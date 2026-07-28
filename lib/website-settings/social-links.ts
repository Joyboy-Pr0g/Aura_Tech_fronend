import { WebsiteSettings } from '@/lib/types/entities';
import { formatWhatsappLink } from '@/lib/website-settings/defaults';

export type SocialLinkKey = 'facebook' | 'instagram' | 'whatsapp' | 'tiktok' | 'site_url';

export interface SocialLinkDefinition {
  key: SocialLinkKey;
  href: string;
  labelKey: string;
}

export function getSocialLinksFromSettings(settings: WebsiteSettings): SocialLinkDefinition[] {
  const links: SocialLinkDefinition[] = [];

  const add = (key: SocialLinkKey, href: string | null | undefined, labelKey: string) => {
    const trimmed = href?.trim();
    if (!trimmed) return;
    links.push({ key, href: trimmed, labelKey });
  };

  add('facebook', settings.facebook, 'admin.websiteFacebook');
  add('instagram', settings.instagram, 'admin.websiteInstagram');
  add('whatsapp', formatWhatsappLink(settings.whatsapp ?? ''), 'admin.websiteWhatsapp');
  add('tiktok', settings.tiktok, 'admin.websiteTiktok');

  const siteUrl = settings.site_url?.trim();
  add('site_url', siteUrl || '/', 'links.visitStore');

  return links;
}
