import type { NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { Order } from '@/lib/types/entities';

interface BlogRevalidateOptions {
  slug?: string | null;
}

interface CategoryRevalidateOptions {
  slug?: string | null;
  id?: string | null;
}

interface ProductRevalidateOptions {
  slug?: string | null;
  id?: string | null;
}

export function expireTag(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

/** Storefront shell (header/footer) uses website settings on every page. */
function revalidateStorefrontLayout() {
  revalidatePath('/', 'layout');
}

export function revalidateBlogStorefront(options?: BlogRevalidateOptions) {
  expireTag('blogs');
  if (options?.slug?.trim()) {
    expireTag(`blog-${options.slug.trim()}`);
    revalidatePath(`/blogs/${options.slug.trim()}`);
  }
  revalidatePath('/blogs');
  revalidatePath('/sitemap.xml');
}

export function revalidateCategoryStorefront(options?: CategoryRevalidateOptions) {
  expireTag('categories');
  if (options?.slug?.trim()) {
    expireTag(`category-${options.slug.trim()}`);
  }
  if (options?.id?.trim()) {
    expireTag(`category-${options.id.trim()}`);
  }
  revalidatePath('/categories');
  revalidatePath('/products');
  revalidateStorefrontLayout();
  revalidatePath('/sitemap.xml');
}

export function revalidateProductStorefront(options?: ProductRevalidateOptions) {
  expireTag('products');
  expireTag('trending');
  expireTag('brands');
  expireTag('max-price');
  if (options?.slug?.trim()) {
    expireTag(`product-${options.slug.trim()}`);
    revalidatePath(`/products/${options.slug.trim()}`);
  }
  if (options?.id?.trim()) {
    expireTag(`product-id-${options.id.trim()}`);
  }
  revalidatePath('/products');
  revalidateStorefrontLayout();
  revalidatePath('/sitemap.xml');
}

export function revalidateWebsiteSettingsStorefront() {
  expireTag('website-settings');
  revalidateStorefrontLayout();
  revalidatePath('/about');
  revalidatePath('/contact');
  revalidatePath('/coming-soon');
  revalidatePath('/privacy-policy');
  revalidatePath('/terms-of-service');
  revalidatePath('/sitemap.xml');
}

export function revalidateShippingFeesStorefront() {
  expireTag('shipping-fees');
  revalidatePath('/checkout');
}

export function revalidateOrderProductsStorefront(order: Order) {
  const slugs = new Set<string>();
  const ids = new Set<string>();

  for (const item of order.items ?? []) {
    const slug = item.product?.slug?.trim();
    if (slug) {
      slugs.add(slug);
      continue;
    }
    const id = item.product_id?.trim() || item.product?.id?.trim();
    if (id) ids.add(id);
  }

  revalidateProductStorefront();

  slugs.forEach((slug) => {
    expireTag(`product-${slug}`);
    revalidatePath(`/products/${slug}`);
  });
  ids.forEach((id) => {
    expireTag(`product-id-${id}`);
  });
}

export async function readJsonField(
  request: NextRequest,
  field: string,
): Promise<string | null> {
  try {
    const clone = request.clone();
    const body = await clone.json();
    const value = body?.[field];
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}
