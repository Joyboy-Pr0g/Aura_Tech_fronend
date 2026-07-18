import { getAdminExpensesServer } from '@/features/expenses/services/expenses-server';
import { AdminExpensesPanel } from '@/features/admin/components/expenses/admin-expenses-panel';

export async function AdminExpensesContent() {
  const [initialCompany, initialRefund] = await Promise.all([
    getAdminExpensesServer({ type: 'expense', limit: 20 }),
    getAdminExpensesServer({ type: 'refund', limit: 20 }),
  ]);

  return (
    <AdminExpensesPanel
      initialCompany={initialCompany}
      initialRefund={initialRefund}
    />
  );
}
