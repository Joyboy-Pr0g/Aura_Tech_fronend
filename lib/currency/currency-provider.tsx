'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type DisplayCurrency,
  formatDisplayPrice,
  convertSarToYer,
} from '@/lib/utils/format';

const STORAGE_KEY = 'aura-currency';

interface CurrencyContextValue {
  currency: DisplayCurrency;
  sarToYer: number | null;
  canUseYer: boolean;
  setCurrency: (currency: DisplayCurrency) => void;
  toggleCurrency: () => void;
  formatPrice: (amountSar: number | string) => string;
  convertPrice: (amountSar: number | string) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function parseRate(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

function resolveInitialCurrency(canUseYer: boolean): DisplayCurrency {
  if (typeof window === 'undefined') return 'SAR';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'YER' && canUseYer) return 'YER';
  return 'SAR';
}

export function CurrencyProvider({
  sarToYer: sarToYerProp,
  children,
}: {
  sarToYer?: number | string | null;
  children: ReactNode;
}) {
  const sarToYer = parseRate(sarToYerProp);
  const canUseYer = sarToYer != null;
  const [currency, setCurrencyState] = useState<DisplayCurrency>('SAR');

  useEffect(() => {
    setCurrencyState(resolveInitialCurrency(canUseYer));
  }, [canUseYer]);

  const setCurrency = useCallback(
    (next: DisplayCurrency) => {
      const resolved = next === 'YER' && !canUseYer ? 'SAR' : next;
      setCurrencyState(resolved);
      localStorage.setItem(STORAGE_KEY, resolved);
    },
    [canUseYer],
  );

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === 'SAR' && canUseYer ? 'YER' : 'SAR');
  }, [canUseYer, currency, setCurrency]);

  const formatPrice = useCallback(
    (amountSar: number | string) => formatDisplayPrice(amountSar, currency, sarToYer),
    [currency, sarToYer],
  );

  const convertPrice = useCallback(
    (amountSar: number | string) => {
      const base = Number(amountSar);
      if (currency === 'YER' && sarToYer != null) return convertSarToYer(base, sarToYer);
      return base;
    },
    [currency, sarToYer],
  );

  const value = useMemo(
    () => ({
      currency,
      sarToYer,
      canUseYer,
      setCurrency,
      toggleCurrency,
      formatPrice,
      convertPrice,
    }),
    [canUseYer, convertPrice, currency, formatPrice, sarToYer, setCurrency, toggleCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export function useFormatPrice() {
  const { formatPrice } = useCurrency();
  return formatPrice;
}
