import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { ShippingFee } from '@/lib/types/entities';

export interface CreateShippingFeePayload {
  price: number;
  duration: string;
  delivery_way: string;
  is_active?: boolean;
}

export interface UpdateShippingFeePayload {
  price?: number;
  duration?: string;
  delivery_way?: string;
  is_active?: boolean;
}

export async function getAdminShippingFees(): Promise<ShippingFee[]> {
  const res = await clientFetch<ShippingFee[]>(bffPath(endpoints.admin.shippingFees));
  return res.data ?? [];
}

export async function getAdminShippingFee(id: string): Promise<ShippingFee> {
  const res = await clientFetch<ShippingFee>(bffPath(endpoints.admin.shippingFee(id)));
  return res.data!;
}

export async function createAdminShippingFee(data: CreateShippingFeePayload): Promise<ShippingFee> {
  const res = await clientFetch<ShippingFee>(bffPath(endpoints.admin.shippingFees), {
    method: 'POST',
    body: { ...data },
  });
  return res.data!;
}

export async function updateAdminShippingFee(id: string, data: UpdateShippingFeePayload): Promise<ShippingFee> {
  const res = await clientFetch<ShippingFee>(bffPath(endpoints.admin.shippingFee(id)), {
    method: 'PUT',
    body: { ...data },
  });
  return res.data!;
}

export async function deleteAdminShippingFee(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.shippingFee(id)), { method: 'DELETE' });
}

export async function activateAdminShippingFee(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.shippingFeeAction(id, 'activate')), { method: 'POST' });
}

export async function deactivateAdminShippingFee(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.shippingFeeAction(id, 'deactivate')), { method: 'POST' });
}
