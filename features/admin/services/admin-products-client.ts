import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { CursorPage } from '@/lib/types/api';
import { AdminProduct, ProductVariant } from '@/lib/types/entities';
import { parseAdminProductsPage } from '@/features/admin/lib/parse-admin-products-page';

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category_id: string;
  sub_category_id?: string | null;
  brand?: string;
  features?: Record<string, string>;
  stock_quantity?: number;
  variants?: Array<{
    sku: string;
    size?: string | null;
    color?: string | null;
    price?: number | null;
    stock_quantity?: number;
    delete_image_public_id?: string | null;
  }>;
}

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  price?: number;
  category_id?: string;
  sub_category_id?: string | null;
  brand?: string | null;
  features?: Record<string, string>;
  deleteImagePublicIds?: string[];
  stock_quantity?: number;
  variants?: Array<{
    id?: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    price?: number | null;
    stock_quantity?: number;
    delete_image_public_id?: string | null;
  }>;
}

export async function getAdminProducts(params?: {
  search?: string;
  category_id?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  limit?: number;
  cursor?: string;
  include_deleted?: boolean;
}): Promise<CursorPage<AdminProduct>> {
  const res = await clientFetch<AdminProduct[]>(bffPath(endpoints.admin.products), { searchParams: params });
  return parseAdminProductsPage(res);
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const res = await clientFetch<AdminProduct>(bffPath(endpoints.admin.product(id)));
  return res.data!;
}

export async function createAdminProduct(
  data: FormData | CreateProductPayload | Record<string, unknown>,
): Promise<AdminProduct> {
  const res = await clientFetch<AdminProduct>(bffPath(endpoints.admin.products), {
    method: 'POST',
    body: data as FormData | Record<string, unknown>,
  });
  return res.data!;
}

export async function updateAdminProduct(
  id: string,
  data: FormData | UpdateProductPayload | Record<string, unknown>,
): Promise<AdminProduct> {
  const res = await clientFetch<AdminProduct>(bffPath(endpoints.admin.product(id)), {
    method: 'PUT',
    body: data as FormData | Record<string, unknown>,
  });
  return res.data!;
}

export async function softDeleteAdminProduct(id: string) {
  await clientFetch(bffPath(endpoints.admin.productAction(id, 'soft-delete')), { method: 'POST' });
}

export async function restoreAdminProduct(id: string) {
  await clientFetch(bffPath(endpoints.admin.productAction(id, 'restore')), { method: 'POST' });
}

export async function deleteAdminProduct(id: string) {
  await clientFetch(bffPath(endpoints.admin.product(id)), { method: 'DELETE' });
}

export async function setAdminProductPrimaryImage(id: string, imageId: string): Promise<AdminProduct> {
  const res = await clientFetch<AdminProduct>(bffPath(endpoints.admin.productAction(id, 'set-primary-image')), {
    method: 'POST',
    body: { image_id: imageId },
  });
  return res.data!;
}

export async function removeAdminProductImage(id: string, imageId: string): Promise<AdminProduct> {
  const res = await clientFetch<AdminProduct>(bffPath(endpoints.admin.productAction(id, 'remove-image')), {
    method: 'POST',
    body: { image_id: imageId },
  });
  return res.data!;
}

export async function addAdminProductStock(
  id: string,
  data: { quantity: number; variant_id?: string | null; notes?: string },
) {
  const res = await clientFetch<AdminProduct>(bffPath(endpoints.admin.product(id)), {
    method: 'PATCH',
    body: data,
  });
  return res.data!;
}

export type { ProductVariant };
