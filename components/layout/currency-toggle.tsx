'use client';

import { cn } from '@/lib/utils/cn';
import { useCurrency } from '@/lib/currency/currency-provider';
import { useLocale } from '@/lib/i18n/locale-provider';

export function CurrencyToggle({ className }: { className?: string }) {
  const { t } = useLocale();
  const { currency, canUseYer, toggleCurrency } = useCurrency();

  if (!canUseYer) return null;

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      className={cn(
        'flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-xs font-semibold',
        'text-white/70 hover:text-primary-400 hover:border-primary-500/30 hover:bg-white/5 transition-colors',
        className,
      )}
      aria-label={t('nav.toggleCurrency')}
      title={t('nav.toggleCurrency')}
    >
      <span className={currency === 'SAR' ? 'text-primary-400' : 'text-white/40'}>{t('nav.currencySar')}</span>
      <span className="text-white/25">/</span>
      <span className={currency === 'YER' ? 'text-primary-400' : 'text-white/40'}>{t('nav.currencyYer')}</span>
    </button>
  );
}
