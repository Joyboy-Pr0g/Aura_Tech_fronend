import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { AppProviders } from '@/components/app-providers';
import { getRootMetadata } from '@/lib/seo/metadata';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';

export async function generateMetadata(): Promise<Metadata> {
  return getRootMetadata();
}

export async function generateViewport(): Promise<Viewport> {
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
          {children}
          <AppProviders />
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
