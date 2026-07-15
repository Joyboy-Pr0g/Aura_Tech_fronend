import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { AdminProduct } from '@/lib/types/entities';
import { parseAdminProductsPage } from '@/features/admin/lib/parse-admin-products-page';

export async function getAdminProductsServer(params?: {
  search?: string;
  category_id?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
  limit?: number;
  cursor?: string;
  include_deleted?: string;
}): Promise<CursorPage<AdminProduct>> {
  const res = await serverFetch<AdminProduct[]>(endpoints.admin.products, { searchParams: params });
  return parseAdminProductsPage(res);
}

export async function getAdminProductServer(id: string): Promise<AdminProduct> {
  const res = await serverFetch<AdminProduct>(endpoints.admin.product(id));
  return res.data!;
}
