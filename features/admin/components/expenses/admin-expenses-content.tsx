import {
  getAdminExpenseTotalsServer,
  getAdminExpensesServer,
} from '@/features/expenses/services/expenses-server';
import { AdminExpensesPanel } from '@/features/admin/components/expenses/admin-expenses-panel';

export async function AdminExpensesContent() {
  const [initialCompany, initialRefund, initialTotals] = await Promise.all([
    getAdminExpensesServer({ type: 'expense', limit: 20 }),
    getAdminExpensesServer({ type: 'refund', limit: 20 }),
    getAdminExpenseTotalsServer(),
  ]);

  return (
    <AdminExpensesPanel
      initialCompany={initialCompany}
      initialRefund={initialRefund}
      initialTotals={initialTotals}
    />
  );
}
