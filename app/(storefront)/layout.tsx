import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VisitTracker } from '@/components/analytics/visit-tracker';
import { PushTokenRegister } from '@/components/notifications/push-token-register';
import { getSession } from '@/lib/auth/session';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { getCategoriesServer } from '@/features/categories/services/categories-server';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';
import { StorefrontCurrencyProvider } from '@/components/storefront/storefront-currency-provider';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  if (isStorefrontComingSoon()) {
    redirect('/coming-soon');
  }

  const [user, settings, categories] = await Promise.all([
    getSession(),
    getWebsiteSettingsServer(),
    getCategoriesServer(),
  ]);

  return (
    <StorefrontCurrencyProvider sarToYer={settings.sar_to_yer}>
      <div className="flex min-h-screen flex-col">
        <VisitTracker />
        <PushTokenRegister user={user} />
        <Header user={user} settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} categories={categories} />
      </div>
    </StorefrontCurrencyProvider>
  );
}
