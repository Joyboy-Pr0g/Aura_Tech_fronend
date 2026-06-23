import { clientFetch } from '@/lib/api/client';
import { Product } from '@/lib/types/entities';

interface ProductsResult {
  items: Product[];
  total: number;
}

export async function getProducts(params?: {
  search?: string;
  category_id?: string;
  limit?: number;
}) {
  const res = await clientFetch<ProductsResult>('/api/products', { searchParams: params });
  return res.data!;
}

export async function getProduct(id: string) {
  const res = await clientFetch<Product>(`/api/products/${id}`);
  return res.data!;
}
