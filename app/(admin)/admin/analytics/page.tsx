import { AdminAnalyticsPanel } from '@/features/admin/components/analytics/admin-analytics-panel';
import { getAdminAnalyticsDashboardServer } from '@/features/admin/services/admin-dashboard-server';

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalyticsDashboardServer();
  return <AdminAnalyticsPanel initial={analytics} />;
}
