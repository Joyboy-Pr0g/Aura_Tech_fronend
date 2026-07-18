import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { Expense, ExpenseType } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';

export async function getAdminExpenses(params?: {
  type?: ExpenseType;
  cursor?: string;
  limit?: number;
}) {
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
