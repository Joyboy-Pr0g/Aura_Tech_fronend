import { CartItem } from '@/lib/types/entities';
import { getProductImageUrl, getVariantLabel } from '@/lib/products/helpers';

export function getCartItemImageUrl(item: CartItem): string | null {
  const variantImage = item.variant?.images?.[0]?.url;
  if (variantImage) return variantImage;
  return item.product ? getProductImageUrl(item.product) : null;
}

export function getCartItemVariantSummary(item: CartItem): string | null {
  if (!item.variant) return null;
  const hasFeatures = Object.keys(item.variant.features ?? {}).length > 0;
  if (!hasFeatures) return null;
  return getVariantLabel(item.variant);
}

export function getCartItemVariantFeatures(item: CartItem): Array<{ key: string; value: string }> {
  if (!item.variant?.features) return [];
  return Object.entries(item.variant.features)
    .filter(([key, value]) => key.trim() && String(value).trim())
    .map(([key, value]) => ({ key: key.trim(), value: String(value).trim() }));
}
