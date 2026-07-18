import { fetchBackend } from '@/lib/api/fetch';
import { endpoints } from '@/lib/api/endpoints';
import { WebsiteSettings } from '@/lib/types/entities';
import {
  FALLBACK_WEBSITE_SETTINGS,
  withWebsiteSettingsDefaults,
} from '@/lib/website-settings/defaults';

export async function getWebsiteSettingsServer(): Promise<WebsiteSettings> {
  try {
    const res = await fetchBackend<WebsiteSettings>(endpoints.websiteSettings.root);
    if (!res.data) return FALLBACK_WEBSITE_SETTINGS;
    return withWebsiteSettingsDefaults(res.data);
  } catch {
    return FALLBACK_WEBSITE_SETTINGS;
  }
}
