import { Product, ProductImage, ProductVariant } from '@/lib/types/entities';

interface CouponOptions {
  prefix?: string;
  length?: number;
  separator?: string;
}

export function getVariantAvailableStock(variant: ProductVariant): number {
  return Math.max(0, variant.stock_quantity - variant.reserved_quantity);
}

export function getMainProductStock(product: Product): number {
  return Math.max(0, product.stock_quantity - product.reserved_quantity);
}

export function getAvailableStock(product: Product): number {
  const mainStock = getMainProductStock(product);
  if (!product.variants?.length) return mainStock;

  const variantStock = product.variants.reduce(
    (total, variant) => total + getVariantAvailableStock(variant),
    0,
  );

  return mainStock + variantStock;
}

export function getDisplayPrice(product: Product, variant?: ProductVariant | null): number {
  return getProductPricing(product, variant).salePrice;
}

export interface ProductPricing {
  originalPrice: number;
  salePrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  savings: number;
}

export function getProductPricing(product: Product, variant?: ProductVariant | null): ProductPricing {
  const originalPrice =
    variant?.price != null ? Number(variant.price) : Number(product.price);

  const discountRaw =
    variant?.discount_price != null ? variant.discount_price : product.discount_price;
  const discountPrice = discountRaw != null ? Number(discountRaw) : null;

  const hasDiscount =
    discountPrice != null &&
    !Number.isNaN(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < originalPrice;

  const salePrice = hasDiscount ? discountPrice : originalPrice;
  const savings = hasDiscount ? originalPrice - salePrice : 0;
  const discountPercent = hasDiscount ? Math.round((savings / originalPrice) * 100) : 0;

  return { originalPrice, salePrice, hasDiscount, discountPercent, savings };
}

/** Best visible discount on a product (for cards without a selected variant). */
export function getProductBestDiscount(product: Product): ProductPricing | null {
  const candidates = [getProductPricing(product, null)];
  for (const variant of product.variants ?? []) {
    candidates.push(getProductPricing(product, variant));
  }
  const discounted = candidates.filter((p) => p.hasDiscount);
  if (!discounted.length) return null;
  return discounted.reduce((best, current) =>
    current.discountPercent > best.discountPercent ? current : best,
  );
}

export function getDisplayStock(product: Product, variant?: ProductVariant | null): number {
  if (variant) return getVariantAvailableStock(variant);
  return getMainProductStock(product);
}

export function isInStock(product: Product, variant?: ProductVariant | null): boolean {
  if (arguments.length >= 2) {
    return getDisplayStock(product, variant) > 0;
  }
  return getAvailableStock(product) > 0;
}

export function getVariantLabel(variant: ProductVariant): string {
  const entries = Object.entries(variant.features ?? {}).filter(
    ([key, value]) => key.trim() && String(value).trim(),
  );
  if (entries.length > 0) {
    return entries.map(([key, value]) => `${key}: ${value}`).join(' · ');
  }
  return variant.sku;
}

export function getPrimaryImage(product: Product): ProductImage | null {
  if (!product.images?.length) return null;
  return product.images.find((img) => img.is_primary) ?? product.images[0];
}

export function getProductImageUrl(product: Product): string | null {
  return getPrimaryImage(product)?.url ?? null;
}

export function getVariantImageUrl(variant?: ProductVariant | null): string | null {
  return variant?.images?.[0]?.url ?? null;
}

export interface GalleryImage {
  url: string;
  public_id: string;
  source: 'product' | 'variant';
  is_primary?: boolean;
}

export function buildProductGalleryImages(
  product: Product,
  selectedVariant?: ProductVariant | null,
): GalleryImage[] {
  const gallery: GalleryImage[] = [];
  const seen = new Set<string>();

  const addImage = (
    image: { url: string; public_id: string; is_primary?: boolean },
    source: GalleryImage['source'],
  ) => {
    const key = image.public_id || image.url;
    if (seen.has(key)) return;
    seen.add(key);
    gallery.push({
      url: image.url,
      public_id: image.public_id,
      source,
      is_primary: image.is_primary,
    });
  };

  if (selectedVariant?.images?.length) {
    for (const image of selectedVariant.images) {
      addImage(image, 'variant');
    }
  }

  for (const image of product.images ?? []) {
    addImage(image, 'product');
  }

  return gallery;
}

export function getDefaultDetailImage(
  product: Product,
  selectedVariant?: ProductVariant | null,
): string | null {
  return getVariantImageUrl(selectedVariant) ?? getProductImageUrl(product);
}

export function getProductPriceRange(product: Product): { min: number; max: number } | null {
  if (!product.variants?.length) return null;

  const prices = product.variants.map((variant) => getProductPricing(product, variant).salePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max ? null : { min, max };
}

export function generateCouponCode({
  prefix = "",
  length = 10,
  separator = "-",
}: CouponOptions = {}): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const randomPart = Array.from({ length }, () => {
    const index = Math.floor(Math.random() * chars.length);
    return chars[index];
  }).join("");

  return prefix
    ? `${prefix.toUpperCase()}${separator}${randomPart}`
    : randomPart;
}
