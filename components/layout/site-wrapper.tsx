import { headers } from 'next/headers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getSession } from '@/lib/auth/session';

function getPathname(): string {
  const headersList = headers();
  return headersList.get('x-pathname') ?? '';
}

function isAppShellRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register'
  );
}

export async function SiteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = getPathname();

  if (isAppShellRoute(pathname)) {
    return <>{children}</>;
  }

  const user = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
