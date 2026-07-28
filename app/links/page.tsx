import type { Metadata } from 'next';
import { SocialLinksPage } from '@/features/storefront/components/social-links-page';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettingsServer();
  return {
    title: `${settings.title} — Links`,
    description: settings.description ?? settings.meta_description ?? undefined,
    openGraph: {
      title: settings.title,
      description: settings.description ?? undefined,
      images: settings.og_image_url ? [{ url: settings.og_image_url }] : undefined,
    },
  };
}

export default async function LinksPage() {
  const settings = await getWebsiteSettingsServer();
  return <SocialLinksPage settings={settings} />;
}
