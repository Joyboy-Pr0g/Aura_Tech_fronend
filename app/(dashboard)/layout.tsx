import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Sidebar } from '@/features/shared/components/sidebar';
import { UserProvider } from '@/features/shared/components/user-provider';
import { PushTokenRegister } from '@/components/notifications/push-token-register';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { StorefrontCurrencyProvider } from '@/components/storefront/storefront-currency-provider';

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'customer') redirect('/admin');

  const settings = await getWebsiteSettingsServer();

  return (
    <StorefrontCurrencyProvider sarToYer={settings.sar_to_yer}>
      <UserProvider user={user}>
        <PushTokenRegister user={user} />
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Sidebar type="customer" user={user} />
          <main className="flex-1 bg-dark-950 overflow-auto min-w-0 text-start">
            {children}
          </main>
        </div>
      </UserProvider>
    </StorefrontCurrencyProvider>
  );
}
