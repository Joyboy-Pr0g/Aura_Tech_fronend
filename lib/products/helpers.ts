import { Product, ProductImage, ProductVariant } from '@/lib/types/entities';

export function getVariantAvailableStock(variant: ProductVariant): number {
  return Math.max(0, variant.stock_quantity - variant.reserved_quantity);
}

export function getAvailableStock(product: Product): number {
  if (product.variants?.length) {
    return product.variants.reduce(
      (total, variant) => total + getVariantAvailableStock(variant),
      0,
    );
  }

  return Math.max(0, product.stock_quantity - product.reserved_quantity);
}

export function getDisplayPrice(product: Product, variant?: ProductVariant | null): number {
  if (variant?.price != null) {
    return Number(variant.price);
  }
  return Number(product.price);
}

export function getDisplayStock(product: Product, variant?: ProductVariant | null): number {
  if (product.variants?.length) {
    if (variant) return getVariantAvailableStock(variant);
    return getAvailableStock(product);
  }

  return Math.max(0, product.stock_quantity - product.reserved_quantity);
}

export function isInStock(product: Product, variant?: ProductVariant | null): boolean {
  return getDisplayStock(product, variant) > 0;
}

export function getVariantLabel(variant: ProductVariant): string {
  const parts = [variant.color, variant.size].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : variant.sku;
}

export function getPrimaryImage(product: Product): ProductImage | null {
  if (!product.images?.length) return null;
  return product.images.find((img) => img.is_primary) ?? product.images[0];
}

export function getProductImageUrl(product: Product): string | null {
  return getPrimaryImage(product)?.url ?? null;
}

export function getProductPriceRange(product: Product): { min: number; max: number } | null {
  if (!product.variants?.length) return null;

  const prices = product.variants.map((variant) => getDisplayPrice(product, variant));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max ? null : { min, max };
}
