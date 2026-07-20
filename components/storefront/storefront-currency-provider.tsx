'use client';

import { CurrencyProvider } from '@/lib/currency/currency-provider';

export function StorefrontCurrencyProvider({
  sarToYer,
  children,
}: {
  sarToYer?: number | string | null;
  children: React.ReactNode;
}) {
  return <CurrencyProvider sarToYer={sarToYer}>{children}</CurrencyProvider>;
}
