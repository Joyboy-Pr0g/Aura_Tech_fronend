'use client';

import { useEffect } from 'react';
import { StorefrontErrorPage } from '@/features/storefront/components/storefront-error-page';

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[storefront]', error);
  }, [error]);

  return <StorefrontErrorPage error={error} reset={reset} />;
}
