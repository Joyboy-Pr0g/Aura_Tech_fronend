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
  const res = await serverFetch<Product[]>('/products', { searchParams: params }, ['products']);
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  try {
    const res = await serverFetch<Product>(`/products/slug/${slug}`,{},['products']);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getProductByIdServer(id: string): Promise<Product | null> {
  try {
    const res = await serverFetch<Product>(`/products/${id}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}
export async function getProductBrandsServer(): Promise<ProductBrand[]> {
  const res = await serverFetch<ProductBrand[]>('/products/brands');
  return res.data ?? [];
}
export async function getMaxProductPriceServer(): Promise<number> {
  const res = await serverFetch<number>('/products/max-price');
  return res.data ?? 0;
}
