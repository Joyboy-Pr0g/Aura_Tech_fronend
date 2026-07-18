import { clientFetch } from '@/lib/api/client';
import { bffPath } from '@/lib/api/bff';
import { endpoints } from '@/lib/api/endpoints';
import { WebsiteSettings } from '@/lib/types/entities';

export async function getAdminWebsiteSettings(): Promise<WebsiteSettings> {
  const res = await clientFetch<WebsiteSettings>(bffPath(endpoints.admin.websiteSettings));
  return res.data!;
}

export async function updateAdminWebsiteSettings(data: FormData): Promise<WebsiteSettings> {
  const res = await clientFetch<WebsiteSettings>(bffPath(endpoints.admin.websiteSettings), {
    method: 'PATCH',
    body: data,
  });
  return res.data!;
}
