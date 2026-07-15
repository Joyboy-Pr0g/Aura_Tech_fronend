'use client';

import { CartItem } from '@/lib/types/entities';
import { getCartItemVariantColor, getCartItemVariantSize } from '@/lib/cart/helpers';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface CartItemVariantMetaProps {
  item: CartItem;
  compact?: boolean;
  className?: string;
}

export function CartItemVariantMeta({ item, compact = false, className }: CartItemVariantMetaProps) {
  const { t } = useLocale();
  const color = getCartItemVariantColor(item);
  const size = getCartItemVariantSize(item);

  if (!color && !size) return null;

  if (compact) {
    const summary = [color, size].filter(Boolean).join(' · ');
    return <p className={cn('text-xs text-white/40', className)}>{summary}</p>;
  }

  return (
    <div className={cn('text-sm text-white/50 space-y-0.5', className)}>
      {color && (
        <p>
          {t('cart.color')}: <span className="text-white/70">{color}</span>
        </p>
      )}
      {size && (
        <p>
          {t('cart.size')}: <span className="text-white/70">{size}</span>
        </p>
      )}
    </div>
  );
}
