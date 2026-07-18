import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { AppProviders } from '@/components/app-providers';
import { getRootMetadata } from '@/lib/seo/metadata';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';
import { Analytics } from '@vercel/analytics/next';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';
import { ComingSoonGate } from '@/features/storefront/components/coming-soon-gate';

const COMING_SOON_METADATA: Metadata = {
  title: 'AuraTech — Coming Soon',
  description: 'AuraTech is launching soon. Premium gaming and tech gear for Yemen.',
  robots: 'noindex, nofollow',
};

export async function generateMetadata(): Promise<Metadata> {
  if (isStorefrontComingSoon()) {
    return COMING_SOON_METADATA;
  }

  return getRootMetadata();
}

export async function generateViewport(): Promise<Viewport> {
  if (isStorefrontComingSoon()) {
    return { themeColor: '#00d9ff' };
  }

  const settings = withWebsiteSettingsDefaults(await getWebsiteSettingsServer());
  return {
    themeColor: settings.theme_color ?? '#00d9ff',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('aura-locale');if(l==='en'||l==='ar'){document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-dark-950 text-white min-h-screen overflow-x-hidden">
        <LocaleProvider>
          <ComingSoonGate>{children}</ComingSoonGate>
          <AppProviders />
          <Toaster />
          <Analytics />
        </LocaleProvider>
      </body>
    </html>
  );
}
