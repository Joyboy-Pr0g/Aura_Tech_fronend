'use client';

import { Product, ProductVariant } from '@/lib/types/entities';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getProductBestDiscount, getProductPricing, ProductPricing } from '@/lib/products/helpers';
import { cn } from '@/lib/utils/cn';
import { Sparkles, Tag, Zap } from 'lucide-react';

interface ProductPriceDisplayProps {
  product: Product;
  variant?: ProductVariant | null;
  /** card = catalog tile, detail = PDP hero, inline = variant chips */
  layout?: 'card' | 'detail' | 'inline';
  className?: string;
}

function resolvePricing(
  product: Product,
  variant: ProductVariant | null | undefined,
  layout: 'card' | 'detail' | 'inline',
): ProductPricing {
  if (layout === 'card' && !variant) {
    const best = getProductBestDiscount(product);
    if (best) return best;
  }
  return getProductPricing(product, variant ?? null);
}

export function ProductSaleBadge({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const best = getProductBestDiscount(product);
  if (!best?.hasDiscount) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute start-3 top-3 z-10 flex items-center gap-1 rounded-md px-2.5 py-1',
        'bg-gradient-to-r from-[#ff0080] via-[#ff4d4d] to-[#ff9500]',
        'text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,128,0.55)]',
        'animate-pulse',
        className,
      )}
    >
      <Zap className="h-3 w-3 fill-white" />
      <span>-{best.discountPercent}%</span>
    </div>
  );
}

export function ProductPriceDisplay({
  product,
  variant,
  layout = 'card',
  className,
}: ProductPriceDisplayProps) {
  const formatPrice = useFormatPrice();
  const { t } = useLocale();
  const pricing = resolvePricing(product, variant, layout);

  if (!pricing.hasDiscount) {
    if (layout === 'detail') {
      return (
        <p className={cn('text-3xl font-bold text-primary-400', className)}>
          {formatPrice(pricing.salePrice)}
        </p>
      );
    }
    if (layout === 'inline') {
      return (
        <span className={cn('text-xs opacity-80', className)}>
          {formatPrice(pricing.salePrice)}
        </span>
      );
    }
    return (
      <span className={cn('font-bold text-primary-400', className)}>
        {formatPrice(pricing.salePrice)}
      </span>
    );
  }

  if (layout === 'inline') {
    return (
      <span className={cn('flex flex-col gap-0.5', className)}>
        <span className="text-[10px] text-white/35 line-through">{formatPrice(pricing.originalPrice)}</span>
        <span className="text-xs font-semibold text-[#5dffb0]">{formatPrice(pricing.salePrice)}</span>
      </span>
    );
  }

  if (layout === 'card') {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex flex-wrap items-end gap-2">
          <span
            className={cn(
              'text-lg font-extrabold tracking-tight',
              'bg-gradient-to-r from-[#5dffb0] via-primary-300 to-primary-400 bg-clip-text text-transparent',
            )}
          >
            {formatPrice(pricing.salePrice)}
          </span>
          <span className="rounded bg-[#ff0080]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#ff6eb4]">
            {t('product.deal')}
          </span>
        </div>
        <p className="text-xs text-white/35 line-through">{formatPrice(pricing.originalPrice)}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary-500/25 bg-dark-950/70 p-5 backdrop-blur-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5dffb0] via-primary-400 to-[#ff0080]" />
      <div
        className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-[#ff0080]/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ff0080]/30 bg-[#ff0080]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#ff8ec4]">
            <Sparkles className="h-3.5 w-3.5" />
            {t('product.limitedDeal')}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <p
              className={cn(
                'text-4xl font-extrabold leading-none sm:text-5xl',
                'bg-gradient-to-r from-[#5dffb0] via-primary-300 to-primary-400 bg-clip-text text-transparent',
                'drop-shadow-[0_0_24px_rgba(0,217,255,0.25)]',
              )}
            >
              {formatPrice(pricing.salePrice)}
            </p>
            <p className="pb-1 text-lg text-white/35 line-through">{formatPrice(pricing.originalPrice)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#5dffb0]/25 bg-[#5dffb0]/10 px-3 py-2 text-end">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#5dffb0]/80">
            {t('product.youSave')}
          </p>
          <p className="text-lg font-bold text-[#5dffb0]">{formatPrice(pricing.savings)}</p>
          <p className="text-xs font-semibold text-white/50">-{pricing.discountPercent}%</p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2 text-xs text-white/45">
        <Tag className="h-3.5 w-3.5 shrink-0 text-primary-400/70" />
        <span>{t('product.dealFootnote')}</span>
      </div>
    </div>
  );
}
