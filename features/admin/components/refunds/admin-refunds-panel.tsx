'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, RotateCcw, Search, XCircle } from 'lucide-react';
import { CursorPage } from '@/lib/types/api';
import { RefundRequest, RefundRequestStatus } from '@/lib/types/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { AdminLastActionLabel } from '@/features/admin/components/audit/admin-last-action-label';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import {
  approveAdminRefundRequest,
  getAdminRefundRequests,
  rejectAdminRefundRequest,
} from '@/features/refunds/services/refunds-client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';

interface AdminRefundsPanelProps {
  initial: CursorPage<RefundRequest>;
  initialStatus?: string;
  initialOrderNumber?: string;
}

function refundStatusBadgeVariant(status: RefundRequestStatus) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'danger' as const;
  return 'warning' as const;
}

export function AdminRefundsPanel({
  initial,
  initialStatus,
  initialOrderNumber,
}: AdminRefundsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [requests, setRequests] = useState(initial.items);
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [orderNumberFilter, setOrderNumberFilter] = useState(initialOrderNumber ?? '');
  const debouncedOrderNumber = useDebounce(orderNumberFilter, 500);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);
  const [rejectTarget, setRejectTarget] = useState<RefundRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionsRefreshKey, setActionsRefreshKey] = useState(0);
  const latestActions = useAdminLatestActions(
    'refund_request',
    requests.map((request) => request.id),
    actionsRefreshKey,
  );

  const applyFilters = useCallback(
    (status: string, orderNumber: string) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (orderNumber.trim()) params.set('order_number', orderNumber.trim());
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(statusFilter, debouncedOrderNumber);
  }, [statusFilter, debouncedOrderNumber, applyFilters]);

  useEffect(() => {
    setRequests(initial.items);
  }, [initial.items]);

  const refresh = () => {
    startTransition(async () => {
      const page = await getAdminRefundRequests({
        status: statusFilter || undefined,
        order_number: debouncedOrderNumber || undefined,
      });
      setRequests(page.items);
      setActionsRefreshKey((key) => key + 1);
      router.refresh();
    });
  };

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      try {
        await approveAdminRefundRequest(id);
        toast(t('admin.refundApproved'), 'success');
        refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleReject = async () => {
    if (!rejectTarget || rejectReason.trim().length < 3) return;
    setSubmitting(true);
    try {
      await rejectAdminRefundRequest(rejectTarget.id, rejectReason.trim());
      toast(t('admin.refundRejected'), 'success');
      setRejectTarget(null);
      setRejectReason('');
      refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: RefundRequestStatus) => (
    <Badge variant={refundStatusBadgeVariant(status)}>
      {t(`order.refundStatus.${status}`)}
    </Badge>
  );

  const renderActions = (request: RefundRequest) => (
    <div className="grid grid-cols-2 gap-2">
      {request.image_url && (
        <a
          href={request.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline flex items-center gap-2 text-sm py-1.5"
        >
          <ExternalLink size={14} />
          {t('admin.viewImage')}
        </a>
      )}
      {request.status === 'pending' && (
        <>
          <Button size="sm" variant="primary" onClick={() => handleApprove(request.id)}>
            <CheckCircle2 size={14} className="me-1" />
            {t('admin.approve')}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setRejectTarget(request)}>
            <XCircle size={14} className="me-1" />
            {t('admin.reject')}
          </Button>
        </>
      )}
    </div>
  );

  const renderRefundRow = (request: RefundRequest) => (
    <>
      <td className="px-5 py-4">
        <p className="font-medium text-white">{request.order?.order_number ?? '—'}</p>
        {request.order?.total != null && (
          <p className="text-xs text-white/40 mt-1">{formatCurrency(request.order.total)}</p>
        )}
      </td>
      <td className="px-5 py-4 text-white/80">{request.customer?.full_name ?? '—'}</td>
      <td className="px-5 py-4 text-white/70 max-w-xs">
        <p className="truncate">{request.reason}</p>
        {request.rejection_reason && (
          <p className="text-xs text-danger/80 mt-1 truncate">{request.rejection_reason}</p>
        )}
      </td>
      <td className="px-5 py-4">{renderStatusBadge(request.status)}</td>
      <td className="px-5 py-4 text-white/50 text-sm">{formatDateTime(request.created_at)}</td>
      <td className="px-5 py-4">
        <AdminLastActionLabel action={latestActions[request.id]} />
      </td>
      <td className="admin-table-actions-cell">{renderActions(request)}</td>
    </>
  );

  const renderRefundCard = (request: RefundRequest) => (
    <div key={request.id} className="card-dark p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">{request.order?.order_number ?? '—'}</p>
          <p className="text-sm text-white/50 truncate mt-1">
            {request.customer?.full_name}
          </p>
        </div>
        {renderStatusBadge(request.status)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {request.order?.total != null && (
          <Badge variant="outline">{formatCurrency(request.order.total)}</Badge>
        )}
        <span className="text-white/40">{formatDateTime(request.created_at)}</span>
      </div>
      <p className="text-sm text-white/70">{request.reason}</p>
      {request.rejection_reason && (
        <p className="text-sm text-danger/80">{request.rejection_reason}</p>
      )}
      <AdminLastActionLabel action={latestActions[request.id]} />
      {renderActions(request)}
    </div>
  );

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.refundsTitle', icon: RotateCcw, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.refundsTitle')}
        countLabel={t('admin.refundsCount', { count: requests.length })}
        filters={
          <div className="flex flex-col lg:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                value={orderNumberFilter}
                onChange={(e) => setOrderNumberFilter(e.target.value)}
                placeholder={t('admin.refundsSearchOrder')}
                className="input-dark ps-9 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark w-full lg:w-auto lg:min-w-[200px]"
            >
              <option value="">{t('admin.refundsAllStatuses')}</option>
              <option value="pending">{t('order.refundStatus.pending')}</option>
              <option value="approved">{t('order.refundStatus.approved')}</option>
              <option value="rejected">{t('order.refundStatus.rejected')}</option>
            </select>
          </div>
        }
      />

      {requests.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.refundsEmpty')}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-5 py-4 font-medium">{t('admin.orderNumber')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.orderCustomer')}</th>
                    <th className="px-5 py-4 font-medium">{t('order.refundReason')}</th>
                    <th className="px-5 py-4 font-medium">{t('order.status')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.submittedAt')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.audit')}</th>
                    <th className="admin-table-actions-head">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      {renderRefundRow(request)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {requests.map(renderRefundCard)}
          </div>
        </>
      )}

      <Modal open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>{t('admin.rejectRefund')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="input-dark w-full resize-none"
              placeholder={t('admin.rejectReasonPlaceholder')}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleReject} disabled={submitting || rejectReason.trim().length < 3}>
              {t('admin.reject')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
