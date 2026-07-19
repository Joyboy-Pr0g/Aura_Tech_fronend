import { serverFetch } from '@/lib/api/server';
import { ShippingFee } from '@/lib/types/entities';
import { endpoints } from '@/lib/api/endpoints';

export async function getShippingFeesServer(): Promise<ShippingFee[]> {
  const res = await serverFetch<ShippingFee[]>(
    endpoints.shippingFees.root,
    { cacheProfile: 'catalog', withAuth: false },
    ['shipping-fees'],
  );
  return res.data ?? [];
}
