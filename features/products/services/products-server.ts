import { serverFetch } from '@/lib/api/server';
import { Product } from '@/lib/types/entities';

interface ProductsResult {
  items: Product[];
  total: number;
}

export async function getProductsServer(params?: {
  search?: string;
  category_id?: string;
  limit?: number;
}) {
  const res = await serverFetch<ProductsResult>('/products', { searchParams: params });
  return res.data!;
}
