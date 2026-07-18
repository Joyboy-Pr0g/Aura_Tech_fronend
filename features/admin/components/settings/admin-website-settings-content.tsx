import { getAdminWebsiteSettingsServer } from '@/features/admin/services/admin-website-settings-server';
import { AdminWebsiteSettingsPanel } from '@/features/admin/components/settings/admin-website-settings-panel';

export async function AdminWebsiteSettingsContent() {
  const settings = await getAdminWebsiteSettingsServer();
  return <AdminWebsiteSettingsPanel initialSettings={settings} />;
}
