import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getSession } from '@/lib/auth/session';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
