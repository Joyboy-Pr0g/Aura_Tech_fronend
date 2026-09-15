import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { Expense, ExpenseType } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';

export type AdminExpenseFilters = {
  type?: ExpenseType;
  cursor?: string;
  limit?: number;
  reason?: string;
  created_by_admin_id?: string;
  from_date?: string;
  to_date?: string;
  order_id?: string;
  order_number?: string;
};

export type AdminExpenseTotalsFilters = Omit<AdminExpenseFilters, 'type' | 'cursor' | 'limit'>;

export interface AdminExpenseTotals {
  expense_total: number;
  refund_total: number;
  grand_total: number;
  expense_count: number;
  refund_count: number;
}

export async function getAdminExpenseTotals(params?: AdminExpenseTotalsFilters) {
  const res = await clientFetch<AdminExpenseTotals>(bffPath(endpoints.admin.expensesTotals), {
    searchParams: params,
  });
  return res.data ?? {
    expense_total: 0,
    refund_total: 0,
    grand_total: 0,
    expense_count: 0,
    refund_count: 0,
  };
}

export async function getAdminExpenses(params?: AdminExpenseFilters) {
  const res = await clientFetch<Expense[]>(bffPath(endpoints.admin.expenses), {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  } satisfies CursorPage<Expense>;
}

export async function createAdminExpense(data: {
  type: ExpenseType;
  order_number?: string;
  amount: number;
  reason: string;
  receipt: File;
}) {
  const formData = new FormData();
  formData.append('type', data.type);
  formData.append('amount', String(data.amount));
  formData.append('reason', data.reason);
  formData.append('receipt', data.receipt);
  if (data.order_number) formData.append('order_number', data.order_number);

  const res = await clientFetch<Expense>(bffPath(endpoints.admin.expenses), {
    method: 'POST',
    body: formData,
  });
  return res.data!;
}

export async function updateAdminExpense(
  id: string,
  data: {
    amount?: number;
    reason?: string;
    order_number?: string;
    receipt?: File | null;
  },
) {
  const formData = new FormData();
  if (data.amount !== undefined) formData.append('amount', String(data.amount));
  if (data.reason !== undefined) formData.append('reason', data.reason);
  if (data.order_number !== undefined) formData.append('order_number', data.order_number);
  if (data.receipt) formData.append('receipt', data.receipt);

  const res = await clientFetch<Expense>(bffPath(endpoints.admin.expense(id)), {
    method: 'PATCH',
    body: formData,
  });
  return res.data!;
}
