import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { WebsiteSettings } from '@/lib/types/entities';

export async function getAdminWebsiteSettingsServer(): Promise<WebsiteSettings> {
  const res = await serverFetch<WebsiteSettings>(endpoints.admin.websiteSettings);
  return res.data!;
}
