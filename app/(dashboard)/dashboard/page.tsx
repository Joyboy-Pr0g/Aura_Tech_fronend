import { getSession } from '@/lib/auth/session';
import { CustomerDashboard } from '@/features/admin/components/customer-dashboard';

export default async function DashboardPage() {
  const user = await getSession();
  return <CustomerDashboard user={user!} />;
}
