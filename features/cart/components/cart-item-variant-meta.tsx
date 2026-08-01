'use client';

import { CartItem } from '@/lib/types/entities';
import { getCartItemVariantFeatures, getCartItemVariantSummary } from '@/lib/cart/helpers';
import { cn } from '@/lib/utils/cn';

interface CartItemVariantMetaProps {
  item: CartItem;
  compact?: boolean;
  className?: string;
}

export function CartItemVariantMeta({ item, compact = false, className }: CartItemVariantMetaProps) {
  const features = getCartItemVariantFeatures(item);
  const summary = getCartItemVariantSummary(item);

  if (!features.length) return null;

  if (compact) {
    return <p className={cn('text-xs text-white/40', className)}>{summary}</p>;
  }

  return (
    <div className={cn('text-sm text-white/50 space-y-0.5', className)}>
      {features.map(({ key, value }) => (
        <p key={`${key}-${value}`}>
          {key}: <span className="text-white/70">{value}</span>
        </p>
      ))}
    </div>
  );
}
