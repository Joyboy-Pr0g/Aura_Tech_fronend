import type { Metadata } from 'next';
import { WebsiteSettings } from '@/lib/types/entities';
import { withWebsiteSettingsDefaults, resolveWebsiteLogo } from '@/lib/website-settings/defaults';

export function getSiteUrl(settings: WebsiteSettings): string {
  const fromSettings = settings.site_url?.trim();
  if (fromSettings) return fromSettings.replace(/\/$/, '');
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return 'http://localhost:3001';
}

function absoluteAssetUrl(siteUrl: string, asset?: string | null): string {
  const value = asset?.trim() || resolveWebsiteLogo(null);
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

export function buildSiteMetadata(
  settings: WebsiteSettings,
  overrides?: Metadata,
): Metadata {
  const s = withWebsiteSettingsDefaults(settings);
  const siteUrl = getSiteUrl(s);
  const siteName = s.title;
  const title = s.meta_title?.trim() || siteName;
  const description = s.meta_description?.trim() || s.description || '';
  const ogImage = absoluteAssetUrl(siteUrl, s.og_image_url || s.header_logo_url);
  const favicon = s.favicon_url?.trim() || resolveWebsiteLogo(null);
  const keywords = s.meta_keywords
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: keywords?.length ? keywords : undefined,
    robots: s.robots ?? 'index, follow',
    icons: {
      icon: favicon.startsWith('http') ? favicon : absoluteAssetUrl(siteUrl, favicon),
    },
    openGraph: {
      type: 'website',
      locale: s.default_locale ?? 'ar_YE',
      url: siteUrl,
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: (s.twitter_card as 'summary' | 'summary_large_image') ?? 'summary_large_image',
      site: s.twitter_handle ?? undefined,
      title,
      description,
      images: [ogImage],
    },
    ...overrides,
  };
}

export function buildPageMetadata(
  settings: WebsiteSettings,
  page: {
    title: string;
    description?: string;
    path?: string;
    image?: string | null;
    type?: 'website' | 'article';
  },
): Metadata {
  const s = withWebsiteSettingsDefaults(settings);
  const siteUrl = getSiteUrl(s);
  const description = page.description?.trim() || s.meta_description?.trim() || s.description || '';
  const image = absoluteAssetUrl(siteUrl, page.image || s.og_image_url || s.header_logo_url);
  const url = page.path ? `${siteUrl}${page.path.startsWith('/') ? page.path : `/${page.path}`}` : siteUrl;

  return {
    title: page.title,
    description,
    openGraph: {
      type: page.type ?? 'website',
      url,
      title: page.title,
      description,
      siteName: s.title,
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: (s.twitter_card as 'summary' | 'summary_large_image') ?? 'summary_large_image',
      title: page.title,
      description,
      images: [image],
    },
  };
}

export async function getRootMetadata(): Promise<Metadata> {
  try {
    const { getWebsiteSettingsServer } = await import('@/features/website-settings/services/website-settings-server');
    const settings = await getWebsiteSettingsServer();
    return buildSiteMetadata(settings);
  } catch {
    const { FALLBACK_WEBSITE_SETTINGS } = await import('@/lib/website-settings/defaults');
    return buildSiteMetadata(FALLBACK_WEBSITE_SETTINGS);
  }
}

export async function getPageMetadataFromSettings(
  page: Parameters<typeof buildPageMetadata>[1],
): Promise<Metadata> {
  const { getWebsiteSettingsServer } = await import('@/features/website-settings/services/website-settings-server');
  const settings = await getWebsiteSettingsServer();
  return buildPageMetadata(settings, page);
}
