import { serverFetch } from '@/lib/api/server';
import { Product, ProductBrand } from '@/lib/types/entities';

export async function getProductsServer(params?: {
  search?: string;
  category_id?: string;
  sub_category_id?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  limit?: number;
  cursor?: string;
}) {
  const res = await serverFetch<Product[]>(
    '/products',
    { searchParams: params, cacheProfile: 'catalog', withAuth: false },
    ['products'],
  );
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getTrendingProductsServer(limit = 12): Promise<Product[]> {
  try {
    const res = await serverFetch<Product[]>(
      '/products/trending',
      { searchParams: { limit }, cacheProfile: 'catalog', withAuth: false },
      ['products', 'trending'],
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  try {
    const res = await serverFetch<Product>(
      `/products/slug/${slug}`,
      { cacheProfile: 'product', withAuth: false },
      ['products', `product-${slug}`],
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getProductByIdServer(id: string): Promise<Product | null> {
  try {
    const res = await serverFetch<Product>(
      `/products/${id}`,
      { cacheProfile: 'stock', withAuth: false },
      ['products', `product-id-${id}`],
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getProductBrandsServer(): Promise<ProductBrand[]> {
  const res = await serverFetch<ProductBrand[]>(
    '/products/brands',
    { cacheProfile: 'catalog', withAuth: false },
    ['products', 'brands'],
  );
  return res.data ?? [];
}

export async function getMaxProductPriceServer(): Promise<number> {
  const res = await serverFetch<number>(
    '/products/max-price',
    { cacheProfile: 'catalog', withAuth: false },
    ['products', 'max-price'],
  );
  return res.data ?? 0;
}
