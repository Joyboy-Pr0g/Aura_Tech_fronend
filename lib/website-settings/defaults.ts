import { WebsiteSettings } from '@/lib/types/entities';

export const DEFAULT_WEBSITE_LOGO = '/logo.jpeg';

export const FALLBACK_WEBSITE_SETTINGS: WebsiteSettings = {
  id: 'fallback',
  title: 'AURA TECH',
  header_logo_public_id: null,
  header_logo_url: null,
  footer_logo_public_id: null,
  footer_logo_url: null,
  website_email: 'hello@auratech.com',
  website_phone: '+967 777 000 000',
  facebook: 'https://facebook.com/auratech',
  instagram: 'https://instagram.com/auratech',
  whatsapp: '+967777000000',
  tiktok: 'https://tiktok.com/@auratech',
  description:
    'Your premier mobile gaming store in Yemen. Premium devices, accessories, and expert support.',
  meta_title: 'AURA TECH — Mobile Gaming Store in Yemen',
  meta_description:
    'Shop premium mobile gaming devices, accessories, and gear in Yemen. Fast delivery and expert support from AURA TECH.',
  meta_keywords: 'mobile gaming, Yemen, gaming phones, accessories, AURA TECH',
  site_url: null,
  favicon_public_id: null,
  favicon_url: null,
  og_image_public_id: null,
  og_image_url: null,
  twitter_card: 'summary_large_image',
  twitter_handle: null,
  default_locale: 'ar_YE',
  theme_color: '#00d9ff',
  robots: 'index, follow',
  sar_to_yer: null,
};

export function resolveWebsiteLogo(url?: string | null): string {
  return url?.trim() || DEFAULT_WEBSITE_LOGO;
}

export function withWebsiteSettingsDefaults(settings: WebsiteSettings): WebsiteSettings {
  return {
    ...settings,
    title: settings.title?.trim() || FALLBACK_WEBSITE_SETTINGS.title,
    website_email: settings.website_email?.trim() || FALLBACK_WEBSITE_SETTINGS.website_email!,
    website_phone: settings.website_phone?.trim() || FALLBACK_WEBSITE_SETTINGS.website_phone!,
    facebook: settings.facebook?.trim() || FALLBACK_WEBSITE_SETTINGS.facebook!,
    instagram: settings.instagram?.trim() || FALLBACK_WEBSITE_SETTINGS.instagram!,
    whatsapp: settings.whatsapp?.trim() || FALLBACK_WEBSITE_SETTINGS.whatsapp!,
    tiktok: settings.tiktok?.trim() || FALLBACK_WEBSITE_SETTINGS.tiktok!,
    description: settings.description?.trim() || FALLBACK_WEBSITE_SETTINGS.description!,
    meta_title: settings.meta_title?.trim() || FALLBACK_WEBSITE_SETTINGS.meta_title!,
    meta_description: settings.meta_description?.trim() || FALLBACK_WEBSITE_SETTINGS.meta_description!,
    meta_keywords: settings.meta_keywords?.trim() || FALLBACK_WEBSITE_SETTINGS.meta_keywords!,
    site_url: settings.site_url?.trim() || FALLBACK_WEBSITE_SETTINGS.site_url,
    twitter_card: settings.twitter_card?.trim() || FALLBACK_WEBSITE_SETTINGS.twitter_card!,
    twitter_handle: settings.twitter_handle?.trim() || FALLBACK_WEBSITE_SETTINGS.twitter_handle,
    default_locale: settings.default_locale?.trim() || FALLBACK_WEBSITE_SETTINGS.default_locale!,
    theme_color: settings.theme_color?.trim() || FALLBACK_WEBSITE_SETTINGS.theme_color!,
    robots: settings.robots?.trim() || FALLBACK_WEBSITE_SETTINGS.robots!,
  };
}

export function formatWhatsappLink(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : trimmed;
}

export function splitWebsiteTitle(title: string): { primary: string; secondary: string } {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return { primary: title, secondary: '' };
  return { primary: parts[0], secondary: parts.slice(1).join(' ') };
}
