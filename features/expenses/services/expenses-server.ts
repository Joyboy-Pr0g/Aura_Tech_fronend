import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Expense, ExpenseType } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';

export async function getAdminExpensesServer(params?: {
  type?: ExpenseType;
  cursor?: string;
  limit?: number;
}) {
  const res = await serverFetch<Expense[]>(endpoints.admin.expenses, {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  } satisfies CursorPage<Expense>;
}
