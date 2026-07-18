'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, RotateCcw } from 'lucide-react';
import { CursorPage } from '@/lib/types/api';
import { Expense, ExpenseType } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { createAdminExpense, getAdminExpenses } from '@/features/expenses/services/expenses-client';
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

type ExpensesTab = 'expense' | 'refund';

interface AdminExpensesPanelProps {
  initialCompany: CursorPage<Expense>;
  initialRefund: CursorPage<Expense>;
  initialTab?: ExpensesTab;
}

export function AdminExpensesPanel({
  initialCompany,
  initialRefund,
  initialTab = 'expense',
}: AdminExpensesPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ExpensesTab>(initialTab);
  const [companyExpenses, setCompanyExpenses] = useState(initialCompany.items);
  const [refundExpenses, setRefundExpenses] = useState(initialRefund.items);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<ExpenseType>('expense');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);

  const expenses = activeTab === 'expense' ? companyExpenses : refundExpenses;

  useEffect(() => {
    setCompanyExpenses(initialCompany.items);
    setRefundExpenses(initialRefund.items);
  }, [initialCompany.items, initialRefund.items]);

  const refresh = () => {
    startTransition(async () => {
      const [company, refund] = await Promise.all([
        getAdminExpenses({ type: 'expense' }),
        getAdminExpenses({ type: 'refund' }),
      ]);
      setCompanyExpenses(company.items);
      setRefundExpenses(refund.items);
      router.refresh();
    });
  };

  const openForm = () => {
    setType(activeTab);
    setOrderNumber('');
    setAmount('');
    setReason('');
    setReceipt(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt || !amount || !reason.trim()) {
      toast(t('admin.expenseFieldsRequired'), 'error');
      return;
    }
    if (type === 'refund' && !orderNumber.trim()) {
      toast(t('admin.expenseOrderRequired'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createAdminExpense({
        type,
        order_number: type === 'refund' ? orderNumber.trim() : undefined,
        amount: Number(amount),
        reason: reason.trim(),
        receipt,
      });
      toast(t('admin.expenseRecorded'), 'success');
      setIsFormOpen(false);
      refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
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
          <div className="flex justify-end">
            <Button onClick={openForm}>
              <Plus size={16} />
              {t('admin.addExpense')}
            </Button>
          </div>
        }
      />

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
                <th className="text-end p-4">{t('admin.receipt')}</th>
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
                    <td className="p-4 text-white/70 max-w-sm truncate">{expense.reason}</td>
                    <td className="p-4 text-white/60">{expense.created_by_admin?.full_name ?? '—'}</td>
                    <td className="p-4 text-white/50">{formatDateTime(expense.created_at)}</td>
                    <td className="p-4 text-end">
                      <a href={expense.receipt_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                        {t('admin.viewReceipt')}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={isFormOpen} onOpenChange={setIsFormOpen}>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <ModalTitle>{t('admin.addExpense')}</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.expenseType')}</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ExpenseType)}
                  className="input-dark w-full"
                >
                  <option value="expense">{t('admin.companyExpenses')}</option>
                  <option value="refund">{t('admin.refundExpenses')}</option>
                </select>
              </div>
              {type === 'refund' && (
                <div className="space-y-2">
                  <Label>{t('admin.orderNumber')}</Label>
                  <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="input-dark" />
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('admin.expenseAmount')}</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.expenseReason')}</Label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="input-dark w-full resize-none" />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.receipt')}</Label>
                <Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} className="input-dark" />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={submitting}>{submitting ? t('common.loading') : t('common.save')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
