import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VisitTracker } from '@/components/analytics/visit-tracker';
import { PushTokenRegister } from '@/components/notifications/push-token-register';
import { StorefrontSessionProvider } from '@/features/shared/components/storefront-session-provider';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { getCategoriesServer } from '@/features/categories/services/categories-server';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getWebsiteSettingsServer(),
    getCategoriesServer(),
  ]);

  return (
    <StorefrontSessionProvider>
      <div className="flex min-h-screen flex-col">
        <VisitTracker />
        <PushTokenRegister />
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} categories={categories} />
      </div>
    </StorefrontSessionProvider>
  );
}
