import { clientFetch } from '@/lib/api/client';
import { Product } from '@/lib/types/entities';

export async function getProducts(params?: {
  search?: string;
  category_id?: string;
  limit?: number;
  cursor?: string;
}) {
  const res = await clientFetch<Product[]>('/api/products', { searchParams: params });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getProduct(id: string) {
  const res = await clientFetch<Product>(`/api/products/${id}`);
  return res.data!;
}
