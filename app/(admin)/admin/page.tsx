import { AdminDashboard } from '@/features/admin/components/dashboard/admin-dashboard';
import { getAdminDashboardServer } from '@/features/admin/services/admin-dashboard-server';

export default async function AdminPage() {
  const dashboard = await getAdminDashboardServer();
  return <AdminDashboard initial={dashboard} />;
}
