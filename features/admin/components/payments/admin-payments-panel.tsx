'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { AdminPayment, PaymentMethod, PaymentStatus } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/models/confirm';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import { AdminLastActionLabel } from '@/features/admin/components/audit/admin-last-action-label';
import {
  approveAdminPayment,
  deleteAdminPaymentMethod,
  getAdminPaymentMethods,
  getAdminPayments,
} from '@/features/admin/services/admin-payments-client';
import {
  PaymentMethodFormModal,
  type PaymentMethodFormMode,
} from '@/features/admin/components/payments/payment-method-form-modal';
import { RejectPaymentModal } from '@/features/admin/components/payments/reject-payment-modal';
import { RecordManualPaymentModal } from '@/features/admin/components/payments/record-manual-payment-modal';

const PAGE_SIZE = 20;
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'approved', 'manual_approved', 'rejected', 'refunded'];

type AdminPaymentsTab = 'payments' | 'methods';

interface AdminPaymentsPanelProps {
  initialPayments: CursorPage<AdminPayment>;
  initialMethods: PaymentMethod[];
  initialTab?: AdminPaymentsTab;
  initialSearch?: string;
  initialPaymentMethodId?: string;
  initialStatus?: string;
  initialMinAmount?: string;
  initialMaxAmount?: string;
}

function paymentStatusBadgeVariant(status: PaymentStatus): 'warning' | 'success' | 'danger' | 'outline' {
  if (status === 'pending') return 'warning';
  if (status === 'approved' || status === 'manual_approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'outline';
}

export function AdminPaymentsPanel({
  initialPayments,
  initialMethods,
  initialTab = 'payments',
  initialSearch,
  initialPaymentMethodId,
  initialStatus,
  initialMinAmount,
  initialMaxAmount,
}: AdminPaymentsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<AdminPaymentsTab>(initialTab);
  const [payments, setPayments] = useState(initialPayments.items);
  const [nextCursor, setNextCursor] = useState(initialPayments.next_cursor);
  const [hasMore, setHasMore] = useState(initialPayments.has_more);
  const [methods, setMethods] = useState(initialMethods);

  const [searchFilter, setSearchFilter] = useState(initialSearch ?? '');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(initialPaymentMethodId ?? '');
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [minAmountFilter, setMinAmountFilter] = useState(initialMinAmount ?? '');
  const [maxAmountFilter, setMaxAmountFilter] = useState(initialMaxAmount ?? '');

  const debouncedSearch = useDebounce(searchFilter, 500);
  const debouncedMinAmount = useDebounce(minAmountFilter, 500);
  const debouncedMaxAmount = useDebounce(maxAmountFilter, 500);

  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [methodFormMode, setMethodFormMode] = useState<PaymentMethodFormMode | null>(null);
  const [deleteMethod, setDeleteMethod] = useState<PaymentMethod | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isManualPaymentModalOpen, setIsManualPaymentModalOpen] = useState(false);
  const isInitialRender = useRef(true);
  const latestActions = useAdminLatestActions('payment', payments.map((p) => p.id));

  useEffect(() => {
    setPayments(initialPayments.items);
    setNextCursor(initialPayments.next_cursor);
    setHasMore(initialPayments.has_more);
  }, [initialPayments]);

  useEffect(() => {
    setMethods(initialMethods);
  }, [initialMethods]);

  const buildQueryParams = useCallback(
    (
      tab: AdminPaymentsTab,
      search: string,
      paymentMethodId: string,
      status: string,
      minAmount: string,
      maxAmount: string,
    ) => {
      const params = new URLSearchParams();
      if (tab !== 'payments') params.set('tab', tab);
      if (search.trim()) params.set('search', search.trim());
      if (paymentMethodId) params.set('payment_method_id', paymentMethodId);
      if (status) params.set('status', status);
      if (minAmount) params.set('min_amount', minAmount);
      if (maxAmount) params.set('max_amount', maxAmount);
      return params;
    },
    [],
  );

  const applyFilters = useCallback(
    (
      tab: AdminPaymentsTab,
      debouncedSearch: string,
      paymentMethodId: string,
      status: string,
      minAmount: string,
      maxAmount: string,
    ) => {
      const query = buildQueryParams(tab, debouncedSearch, paymentMethodId, status, minAmount, maxAmount).toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [buildQueryParams, pathname, router],
  );

  useEffect(() => {
    if (activeTab !== 'payments') return;
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(activeTab, debouncedSearch, paymentMethodFilter, statusFilter, debouncedMinAmount, debouncedMaxAmount);
  }, [
    activeTab,
    debouncedSearch,
    paymentMethodFilter,
    statusFilter,
    debouncedMinAmount,
    debouncedMaxAmount,
    applyFilters,
  ]);

  const buildPaymentParams = useCallback(
    (search: string, paymentMethodId: string, status: string, minAmount: string, maxAmount: string) => ({
      search: search.trim() || undefined,
      payment_method_id: paymentMethodId || undefined,
      status: status || undefined,
      min_amount: minAmount ? Number(minAmount) : undefined,
      max_amount: maxAmount ? Number(maxAmount) : undefined,
      limit: PAGE_SIZE,
    }),
    [],
  );

  const refreshPayments = useCallback(() => {
    startTransition(async () => {
      const page = await getAdminPayments(
        buildPaymentParams(debouncedSearch, paymentMethodFilter, statusFilter, debouncedMinAmount, debouncedMaxAmount),
      );
      setPayments(page.items);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  }, [
    buildPaymentParams,
    debouncedSearch,
    paymentMethodFilter,
    statusFilter,
    debouncedMinAmount,
    debouncedMaxAmount,
  ]);

  const refreshMethods = useCallback(() => {
    startTransition(async () => {
      const nextMethods = await getAdminPaymentMethods();
      setMethods(nextMethods);
    });
  }, []);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await getAdminPayments({
        ...buildPaymentParams(debouncedSearch, paymentMethodFilter, statusFilter, debouncedMinAmount, debouncedMaxAmount),
        cursor: nextCursor,
      });
      setPayments((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const handleTabChange = (tab: AdminPaymentsTab) => {
    setActiveTab(tab);
    applyFilters(tab, searchFilter, paymentMethodFilter, statusFilter, minAmountFilter, maxAmountFilter);
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await approveAdminPayment(id);
      toast(t('admin.paymentApproved'), 'success');
      refreshPayments();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.approveFailed'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteMethod = async () => {
    if (!deleteMethod) return;
    setActionId(deleteMethod.id);
    try {
      await deleteAdminPaymentMethod(deleteMethod.id);
      toast(t('admin.paymentMethodDeleted'), 'success');
      setIsDeleteModalOpen(false);
      setDeleteMethod(null);
      refreshMethods();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const countLabel = useMemo(() => {
    if (activeTab === 'methods') {
      return t('admin.paymentMethodsCount', { count: methods.length });
    }
    return t('admin.paymentsCount', { count: payments.length });
  }, [activeTab, methods.length, payments.length, t]);

  const renderPaymentActions = (payment: AdminPayment) => {

    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {payment.receipt_document_url && (
          <a
            href={payment.receipt_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex items-center gap-2 text-sm py-1.5"
          >
            <ExternalLink size={14} />
            {t('admin.viewReceipt')}
          </a>
        )}
        {payment.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="primary"
              disabled={actionId === payment.id}
              onClick={() => handleApprove(payment.id)}
            >
              <CheckCircle2 size={14} className="me-1" />
              {t('admin.approve')}
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={actionId === payment.id}
              onClick={() => {
                setRejectPaymentId(payment.id);
                setIsRejectModalOpen(true);
              }}
            >
              <XCircle size={14} className="me-1" />
              {t('admin.reject')}
            </Button>
          </>
        )}
      </div>
    );
  };

  const renderPaymentRow = (payment: AdminPayment) => (
    <>
      <td className="px-5 py-4">
        <p className="font-medium text-white">
          #{payment.order?.order_number ?? payment.order_id.slice(0, 8)}
        </p>
      </td>
      <td className="px-5 py-4 text-white">{formatCurrency(payment.amount)}</td>
      <td className="px-5 py-4 text-white/70">
        {payment.payment_method?.name ?? payment.payment_method?.bank_name ?? '—'}
      </td>
      <td className="px-5 py-4">
        <Badge variant={paymentStatusBadgeVariant(payment.status)}>
          {t(`admin.paymentStatus.${payment.status}`)}
        </Badge>
      </td>
      <td className="px-5 py-4 text-white/70">
        {payment.submitted_by_customer?.email ?? t('admin.unknown')}
      </td>
      <td className="px-5 py-4 text-white/50 text-sm">{formatDateTime(payment.submitted_at)}</td>
      <td className="px-5 py-4">
        <AdminLastActionLabel action={latestActions[payment.id]} />
      </td>
      <td className="admin-table-actions-cell">{renderPaymentActions(payment)}</td>
    </>
  );

  const renderPaymentCard = (payment: AdminPayment) => (
    <div key={payment.id} className="card-dark p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">
            #{payment.order?.order_number ?? payment.order_id.slice(0, 8)}
          </p>
          <p className="text-sm text-white/50">{payment.submitted_by_customer?.email ?? t('admin.unknown')}</p>
        </div>
        <Badge variant={paymentStatusBadgeVariant(payment.status)}>
          {t(`admin.paymentStatus.${payment.status}`)}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">{formatCurrency(payment.amount)}</Badge>
        {payment.payment_method && (
          <Badge variant="outline">{payment.payment_method.name ?? payment.payment_method.bank_name}</Badge>
        )}
        <span className="text-white/40">{formatDateTime(payment.submitted_at)}</span>
      </div>
      <AdminLastActionLabel action={latestActions[payment.id]} />
      {payment.rejection_reason && (
        <p className="text-sm text-danger/80">{payment.rejection_reason}</p>
      )}
      {renderPaymentActions(payment)}
    </div>
  );

  const renderMethodCard = (method: PaymentMethod) => (
    <div key={method.id} className="card-dark p-5 space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-white truncate">{method.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/50">{method.bank_name}</p>
            <Badge variant={method.is_active ? 'success' : 'secondary'}>
              {method.is_active ? t('admin.active') : t('admin.inactive')}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={actionId === method.id}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-dark-900 border-white/10">
            <DropdownMenuItem
              onClick={() => {
                setMethodFormMode({ type: 'edit', method });
                setIsMethodModalOpen(true);
              }}
            >
              <Pencil size={14} className="me-2" />
              {t('admin.editPaymentMethod')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => {
                setDeleteMethod(method);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 size={14} className="me-2" />
              {t('admin.deletePaymentMethod')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1 text-sm text-white/60 flex-1">
        {method.account_holder_name && (
          <p>
            <span className="text-white/40">{t('admin.paymentMethodAccountHolder')}: </span>
            {method.account_holder_name}
          </p>
        )}
        {method.account_number && (
          <p>
            <span className="text-white/40">{t('admin.paymentMethodAccount')}: </span>
            {method.account_number}
          </p>
        )}
        {method.iban && (
          <p>
            <span className="text-white/40">{t('admin.paymentMethodIban')}: </span>
            {method.iban}
          </p>
        )}
        {method.description && <p className="text-white/50">{method.description}</p>}
      </div>
    </div>
  );

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.paymentsTitle', icon: Banknote, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.paymentsTitle')}
        countLabel={countLabel}
        filters={
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('payments')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors border',
                  activeTab === 'payments'
                    ? 'border-primary-500/40 bg-primary-500/10 text-primary-400'
                    : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                <Banknote size={16} />
                {t('admin.paymentsTab')}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('methods')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors border',
                  activeTab === 'methods'
                    ? 'border-primary-500/40 bg-primary-500/10 text-primary-400'
                    : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                <CreditCard size={16} />
                {t('admin.paymentMethodsTab')}
              </button>
            </div>

            {activeTab === 'payments' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3">
                  <div className="xl:col-span-2">
                    <Input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder={t('admin.searchPayments')}
                      className="input-dark w-full text-sm"
                    />
                  </div>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="input-dark w-full"
                  >
                    <option value="">{t('admin.allPaymentMethods')}</option>
                    {methods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-dark w-full"
                  >
                    <option value="">{t('admin.allPaymentStatuses')}</option>
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(`admin.paymentStatus.${status}`)}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minAmountFilter}
                    onChange={(e) => setMinAmountFilter(e.target.value)}
                    placeholder={t('admin.minAmount')}
                    className="input-dark w-full"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxAmountFilter}
                    onChange={(e) => setMaxAmountFilter(e.target.value)}
                    placeholder={t('admin.maxAmount')}
                    className="input-dark w-full"
                  />
                  <Button variant="primary" onClick={() => setIsManualPaymentModalOpen(true)}>
                    <Plus size={16} className="me-1" />
                    {t('admin.recordManualPayment')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setMethodFormMode({ type: 'create' });
                    setIsMethodModalOpen(true);
                  }}
                >
                  <Plus size={16} className="me-1" />
                  {t('admin.addPaymentMethod')}
                </Button>
              </div>
            )}
          </div>
        }
      />

      {activeTab === 'payments' ? (
        payments.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <p className="text-white/50">{t('admin.noPayments')}</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block card-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="admin-table-head">
                      <th className="px-5 py-4 font-medium">{t('admin.paymentOrder')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.paymentAmount')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.paymentMethod')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.paymentStatusLabel')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.customer')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.submitted')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.audit')}</th>
                      <th className="admin-table-actions-head">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        {renderPaymentRow(payment)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:hidden space-y-3">{payments.map(renderPaymentCard)}</div>

            {hasMore && (
              <div className="flex justify-center">
                <button type="button" onClick={loadMore} disabled={isPending} className="btn-outline">
                  {t('admin.loadMore')}
                </button>
              </div>
            )}
          </>
        )
      ) : methods.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noPaymentMethods')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {methods.map(renderMethodCard)}
        </div>
      )}

      <RejectPaymentModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        paymentId={rejectPaymentId}
        onSuccess={refreshPayments}
      />

      <RecordManualPaymentModal
        open={isManualPaymentModalOpen}
        onOpenChange={setIsManualPaymentModalOpen}
        onSuccess={refreshPayments}
      />

      <PaymentMethodFormModal
        open={isMethodModalOpen}
        onOpenChange={(open) => {
          setIsMethodModalOpen(open);
          if (!open) setMethodFormMode(null);
        }}
        mode={methodFormMode}
        onSuccess={refreshMethods}
      />

      {deleteMethod && (
        <ConfirmModal
          name={deleteMethod.name}
          onConfirm={handleDeleteMethod}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteMethod(null);
          }}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          loading={isPending}
          confirmText={t('admin.deletePaymentMethod')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
