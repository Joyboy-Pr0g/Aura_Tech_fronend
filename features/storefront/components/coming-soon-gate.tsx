'use client';

import { usePathname } from 'next/navigation';
import { ComingSoonPage } from '@/features/storefront/components/coming-soon-page';
import { shouldShowComingSoonForPath } from '@/lib/storefront/coming-soon';

export function ComingSoonGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (shouldShowComingSoonForPath(pathname)) {
    return <ComingSoonPage />;
  }

  return children;
}
