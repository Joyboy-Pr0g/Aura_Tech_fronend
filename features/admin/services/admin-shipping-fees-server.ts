import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { ShippingFee } from '@/lib/types/entities';

export async function getAdminShippingFeesServer(): Promise<ShippingFee[]> {
  const res = await serverFetch<ShippingFee[]>(endpoints.admin.shippingFees);
  return res.data ?? [];
}

export async function getAdminShippingFeeServer(id: string): Promise<ShippingFee | null> {
  try {
    const res = await serverFetch<ShippingFee>(endpoints.admin.shippingFee(id));
    return res.data ?? null;
  } catch {
    return null;
  }
}
