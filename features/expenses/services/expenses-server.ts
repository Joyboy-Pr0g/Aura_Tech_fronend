import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Expense } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import {
  AdminExpenseFilters,
  AdminExpenseTotals,
  AdminExpenseTotalsFilters,
} from '@/features/expenses/services/expenses-client';

export async function getAdminExpenseTotalsServer(params?: AdminExpenseTotalsFilters) {
  const res = await serverFetch<AdminExpenseTotals>(endpoints.admin.expensesTotals, {
    searchParams: params,
  });
  return (
    res.data ?? {
      expense_total: 0,
      refund_total: 0,
      grand_total: 0,
      expense_count: 0,
      refund_count: 0,
    }
  );
}

export async function getAdminExpensesServer(params?: AdminExpenseFilters) {
  const res = await serverFetch<Expense[]>(endpoints.admin.expenses, {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  } satisfies CursorPage<Expense>;
}
