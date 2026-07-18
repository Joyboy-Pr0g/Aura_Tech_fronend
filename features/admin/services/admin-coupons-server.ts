import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Coupon } from '@/lib/types/entities';

export async function getAdminCouponsServer(): Promise<Coupon[]> {
  const res = await serverFetch<Coupon[]>(endpoints.admin.coupons);
  return res.data ?? [];
}
