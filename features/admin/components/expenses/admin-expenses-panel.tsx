'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Building2, Pencil, Plus, RotateCcw } from 'lucide-react';
import { CursorPage } from '@/lib/types/api';
import { Expense, ExpenseType, User } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import {
  AdminExpenseFilters,
  AdminExpenseTotals,
  AdminExpenseTotalsFilters,
  createAdminExpense,
  getAdminExpenses,
  getAdminExpenseTotals,
  updateAdminExpense,
} from '@/features/expenses/services/expenses-client';
import { getAdminUsers } from '@/features/admin/services/admin-users-client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PAGE_SIZE = 20;

type ExpensesTab = 'expense' | 'refund';

interface ExpenseFilterState {
  reason: string;
  recordedBy: string;
  fromDate: string;
  toDate: string;
  orderNumber: string;
}

interface TabListState {
  items: Expense[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface AdminExpensesPanelProps {
  initialCompany: CursorPage<Expense>;
  initialRefund: CursorPage<Expense>;
  initialTotals: AdminExpenseTotals;
  initialTab?: ExpensesTab;
}

const EMPTY_FILTERS: ExpenseFilterState = {
  reason: '',
  recordedBy: '',
  fromDate: '',
  toDate: '',
  orderNumber: '',
};

function buildFetchParams(
  tab: ExpensesTab,
  filters: ExpenseFilterState,
  cursor?: string,
): AdminExpenseFilters {
  return {
    type: tab,
    limit: PAGE_SIZE,
    cursor,
    reason: filters.reason.trim() || undefined,
    created_by_admin_id: filters.recordedBy || undefined,
    from_date: filters.fromDate || undefined,
    to_date: filters.toDate || undefined,
    order_number: tab === 'refund' && filters.orderNumber.trim() ? filters.orderNumber.trim() : undefined,
  };
}

function buildTotalsParams(filters: ExpenseFilterState): AdminExpenseTotalsFilters {
  return {
    reason: filters.reason.trim() || undefined,
    created_by_admin_id: filters.recordedBy || undefined,
    from_date: filters.fromDate || undefined,
    to_date: filters.toDate || undefined,
    order_number: filters.orderNumber.trim() ? filters.orderNumber.trim() : undefined,
  };
}

export function AdminExpensesPanel({
  initialCompany,
  initialRefund,
  initialTotals,
  initialTab = 'expense',
}: AdminExpensesPanelProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<ExpensesTab>(initialTab);
  const [filters, setFilters] = useState<ExpenseFilterState>(EMPTY_FILTERS);
  const debouncedReason = useDebounce(filters.reason, 400);
  const debouncedOrderNumber = useDebounce(filters.orderNumber, 400);

  const [companyState, setCompanyState] = useState<TabListState>({
    items: initialCompany.items,
    nextCursor: initialCompany.next_cursor,
    hasMore: initialCompany.has_more,
  });
  const [refundState, setRefundState] = useState<TabListState>({
    items: initialRefund.items,
    nextCursor: initialRefund.next_cursor,
    hasMore: initialRefund.has_more,
  });
  const [totals, setTotals] = useState<AdminExpenseTotals>(initialTotals);

  const [adminOptions, setAdminOptions] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<ExpenseType>('expense');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);

  const activeState = activeTab === 'expense' ? companyState : refundState;
  const expenses = activeState.items;

  useEffect(() => {
    setCompanyState({
      items: initialCompany.items,
      nextCursor: initialCompany.next_cursor,
      hasMore: initialCompany.has_more,
    });
    setRefundState({
      items: initialRefund.items,
      nextCursor: initialRefund.next_cursor,
      hasMore: initialRefund.has_more,
    });
    setTotals(initialTotals);
  }, [initialCompany, initialRefund, initialTotals]);

  useEffect(() => {
    void getAdminUsers({ limit: 100, include_deleted: false }).then((page) => {
      setAdminOptions(page.items.filter((user) => user.role === 'admin' || user.role === 'sub_admin'));
    });
  }, []);

  const effectiveFilters = useCallback(
    (): ExpenseFilterState => ({
      ...filters,
      reason: debouncedReason,
      orderNumber: debouncedOrderNumber,
    }),
    [filters, debouncedReason, debouncedOrderNumber],
  );

  const setActiveTabState = useCallback((tab: ExpensesTab, patch: TabListState) => {
    if (tab === 'expense') {
      setCompanyState(patch);
    } else {
      setRefundState(patch);
    }
  }, []);

  const refreshTab = useCallback(
    (tab: ExpensesTab) => {
      startTransition(async () => {
        try {
          const page = await getAdminExpenses(buildFetchParams(tab, effectiveFilters()));
          setActiveTabState(tab, {
            items: page.items,
            nextCursor: page.next_cursor,
            hasMore: page.has_more,
          });
        } catch (error) {
          toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
        }
      });
    },
    [effectiveFilters, setActiveTabState, t],
  );

  const refreshTotals = useCallback(() => {
    startTransition(async () => {
      try {
        const nextTotals = await getAdminExpenseTotals(buildTotalsParams(effectiveFilters()));
        setTotals(nextTotals);
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  }, [effectiveFilters, t]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    refreshTab('expense');
    refreshTab('refund');
    refreshTotals();
  }, [debouncedReason, debouncedOrderNumber, filters.recordedBy, filters.fromDate, filters.toDate, refreshTab, refreshTotals]);

  const loadMore = useCallback(() => {
    const state = activeTab === 'expense' ? companyState : refundState;
    if (!state.nextCursor || isPending) return;

    startTransition(async () => {
      try {
        const page = await getAdminExpenses(
          buildFetchParams(activeTab, effectiveFilters(), state.nextCursor ?? undefined),
        );
        setActiveTabState(activeTab, {
          items: [...state.items, ...page.items],
          nextCursor: page.next_cursor,
          hasMore: page.has_more,
        });
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  }, [activeTab, companyState, refundState, effectiveFilters, isPending, setActiveTabState, t]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !activeState.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeState.hasMore, loadMore]);

  const resetForm = () => {
    setType(activeTab);
    setOrderNumber('');
    setAmount('');
    setReason('');
    setReceipt(null);
    setEditingExpense(null);
  };

  const openCreateForm = () => {
    resetForm();
    setType(activeTab);
    setIsFormOpen(true);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setType(expense.type);
    setOrderNumber(expense.order?.order_number ?? '');
    setAmount(String(expense.amount));
    setReason(expense.reason);
    setReceipt(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const refreshBoth = () => {
    refreshTab('expense');
    refreshTab('refund');
    refreshTotals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !reason.trim()) {
      toast(t('admin.expenseFieldsRequired'), 'error');
      return;
    }

    if (type === 'refund' && !orderNumber.trim()) {
      toast(t('admin.expenseOrderRequired'), 'error');
      return;
    }

    if (!editingExpense && !receipt) {
      toast(t('admin.expenseFieldsRequired'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingExpense) {
        await updateAdminExpense(editingExpense.id, {
          amount: Number(amount),
          reason: reason.trim(),
          order_number: type === 'refund' ? orderNumber.trim() : undefined,
          receipt,
        });
        toast(t('admin.expenseUpdated'), 'success');
      } else {
        await createAdminExpense({
          type,
          order_number: type === 'refund' ? orderNumber.trim() : undefined,
          amount: Number(amount),
          reason: reason.trim(),
          receipt: receipt!,
        });
        toast(t('admin.expenseRecorded'), 'success');
      }
      closeForm();
      refreshBoth();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = <K extends keyof ExpenseFilterState>(key: K, value: ExpenseFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.expensesTitle', icon: Building2, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.expensesTitle')}
        countLabel={t('admin.expensesCount', { count: expenses.length })}
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                value={filters.reason}
                onChange={(e) => updateFilter('reason', e.target.value)}
                placeholder={t('admin.filterByReason')}
                className="input-dark"
              />
              <select
                value={filters.recordedBy}
                onChange={(e) => updateFilter('recordedBy', e.target.value)}
                className="input-dark w-full"
              >
                <option value="">{t('admin.filterByRecordedBy')}</option>
                {adminOptions.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => updateFilter('fromDate', e.target.value)}
                className="input-dark"
                aria-label={t('admin.fromDate')}
              />
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => updateFilter('toDate', e.target.value)}
                className="input-dark"
                aria-label={t('admin.toDate')}
              />
              {activeTab === 'refund' && (
                <Input
                  value={filters.orderNumber}
                  onChange={(e) => updateFilter('orderNumber', e.target.value)}
                  placeholder={t('admin.filterByOrder')}
                  className="input-dark sm:col-span-2"
                />
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={openCreateForm}>
                <Plus size={16} />
                {t('admin.addExpense')}
              </Button>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-dark p-5">
          <p className="text-sm text-white/50">{t('admin.expensesCompanyTotal')}</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">{formatCurrency(totals.expense_total)}</p>
          <p className="text-xs text-white/40 mt-1">{t('admin.expensesCount', { count: totals.expense_count })}</p>
        </div>
        <div className="card-dark p-5">
          <p className="text-sm text-white/50">{t('admin.expensesRefundTotal')}</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totals.refund_total)}</p>
          <p className="text-xs text-white/40 mt-1">{t('admin.expensesCount', { count: totals.refund_count })}</p>
        </div>
        <div className="card-dark p-5">
          <p className="text-sm text-white/50">{t('admin.expensesGrandTotal')}</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totals.grand_total)}</p>
          <p className="text-xs text-white/40 mt-1">
            {t('admin.expensesCount', { count: totals.expense_count + totals.refund_count })}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('expense')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'expense' ? 'border-primary-400 text-white' : 'border-transparent text-white/50',
          )}
        >
          {t('admin.companyExpenses')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('refund')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-2',
            activeTab === 'refund' ? 'border-primary-400 text-white' : 'border-transparent text-white/50',
          )}
        >
          <RotateCcw size={14} />
          {t('admin.refundExpenses')}
        </button>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                {activeTab === 'refund' && <th className="text-start p-4">{t('admin.orderNumber')}</th>}
                <th className="text-start p-4">{t('admin.expenseAmount')}</th>
                <th className="text-start p-4">{t('admin.expenseReason')}</th>
                <th className="text-start p-4">{t('admin.recordedBy')}</th>
                <th className="text-start p-4">{t('admin.submittedAt')}</th>
                <th className="text-end p-4">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'refund' ? 6 : 5} className="p-8 text-center text-white/40">
                    {t('admin.expensesEmpty')}
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-white/5">
                    {activeTab === 'refund' && (
                      <td className="p-4 text-white font-medium">{expense.order?.order_number ?? '—'}</td>
                    )}
                    <td className="p-4 text-primary-400 font-semibold">{formatCurrency(expense.amount)}</td>
                    <td onClick={() => toast(expense.reason, 'info')} className="p-4 text-white/70 max-w-sm truncate">{expense.reason}</td>
                    <td className="p-4 text-white/60">{expense.created_by_admin?.full_name ?? '—'}</td>
                    <td className="p-4 text-white/50">{formatDateTime(expense.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs"
                        >
                          {t('admin.viewReceipt')}
                        </a>
                        <Button variant="outline" size="sm" onClick={() => openEditForm(expense)}>
                          <Pencil size={14} />
                          {t('admin.editExpense')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {activeState.hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-6 text-white/40 text-sm">
            {isPending ? t('common.loading') : t('admin.loadingMore')}
          </div>
        )}
      </div>

      <Modal open={isFormOpen} onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <ModalTitle>{editingExpense ? t('admin.editExpense') : t('admin.addExpense')}</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.expenseType')}</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ExpenseType)}
                  className="input-dark w-full"
                  disabled={Boolean(editingExpense)}
                >
                  <option value="expense">{t('admin.companyExpenses')}</option>
                  <option value="refund">{t('admin.refundExpenses')}</option>
                </select>
              </div>
              {type === 'refund' && (
                <div className="space-y-2">
                  <Label>{t('admin.orderNumber')}</Label>
                  <Input
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="input-dark"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('admin.expenseAmount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.expenseReason')}</Label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="input-dark w-full resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>{editingExpense ? t('admin.receiptOptional') : t('admin.receipt')}</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                  className="input-dark"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.loading') : t('common.save')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
