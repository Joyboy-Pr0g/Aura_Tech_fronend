import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Sidebar } from '@/features/shared/components/sidebar';
import { UserProvider } from '@/features/shared/components/user-provider';
import { PushTokenRegister } from '@/components/notifications/push-token-register';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role === 'customer') redirect('/dashboard');

  return (
    <UserProvider user={user}>
      <PushTokenRegister user={user} />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar type="admin" user={user} />
        <main className="flex-1 bg-dark-950 overflow-auto min-w-0 text-start">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
