import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { AppProviders } from '@/components/app-providers';
import { StorefrontCurrencyProvider } from '@/components/storefront/storefront-currency-provider';
import { getRootMetadata, getRootOrganizationSchema } from '@/lib/seo/metadata'; // ← Updated import
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';
import { Analytics } from '@vercel/analytics/next';

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
  return { themeColor: '#00d9ff' };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [organizationSchema, settings] = await Promise.all([
    getRootOrganizationSchema(),
    getWebsiteSettingsServer(),
  ]);

  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        {/* ← ADD THIS: Organization Schema Script */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        
        {/* ← Keep your existing script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('aura-locale');if(l==='en'||l==='ar'){document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-dark-950 text-white min-h-screen overflow-x-hidden">
        <LocaleProvider>
          <StorefrontCurrencyProvider sarToYer={settings.sar_to_yer}>
            {children}
          </StorefrontCurrencyProvider>
          <AppProviders />
          <Toaster />
          <Analytics />
        </LocaleProvider>
      </body>
    </html>
  );
}