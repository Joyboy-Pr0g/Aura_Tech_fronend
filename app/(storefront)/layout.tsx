import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VisitTracker } from '@/components/analytics/visit-tracker';
import { PushTokenRegister } from '@/components/notifications/push-token-register';
import { ComingSoonPage } from '@/features/storefront/components/coming-soon-page';
import { getSession } from '@/lib/auth/session';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  if (isStorefrontComingSoon()) {
    return <ComingSoonPage />;
  }

  const [user, settings] = await Promise.all([getSession(), getWebsiteSettingsServer()]);

  return (
    <div className="flex min-h-screen flex-col">
      <VisitTracker />
      <PushTokenRegister user={user} />
      <Header user={user} settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
