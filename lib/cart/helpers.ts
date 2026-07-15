import { CartItem } from '@/lib/types/entities';
import { getProductImageUrl } from '@/lib/products/helpers';

export function getCartItemImageUrl(item: CartItem): string | null {
  const variantImage = item.variant?.images?.[0]?.url;
  if (variantImage) return variantImage;
  return item.product ? getProductImageUrl(item.product) : null;
}

export function getCartItemVariantColor(item: CartItem): string | null {
  return item.variant?.color ?? null;
}

export function getCartItemVariantSize(item: CartItem): string | null {
  return item.variant?.size ?? null;
}

export function getCartItemVariantSummary(item: CartItem): string | null {
  if (!item.variant) return null;
  const parts = [item.variant.color, item.variant.size].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}
