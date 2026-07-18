import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { Coupon } from '@/lib/types/entities';

export interface CreateCouponPayload {
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_uses?: number | null;
  min_purchase_amount?: number;
  max_discount_amount?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
  category_id?: string | null;
  sub_category_id?: string | null;
  product_id?: string | null;
}

export type UpdateCouponPayload = Partial<CreateCouponPayload>;

function asBody(data: Record<string, unknown>) {
  return data;
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  const res = await clientFetch<Coupon[]>(bffPath(endpoints.admin.coupons));
  return res.data ?? [];
}

export async function createAdminCoupon(data: CreateCouponPayload): Promise<Coupon> {
  const res = await clientFetch<Coupon>(bffPath(endpoints.admin.coupons), {
    method: 'POST',
    body: asBody(data as unknown as Record<string, unknown>),
  });
  return res.data!;
}

export async function updateAdminCoupon(id: string, data: UpdateCouponPayload): Promise<Coupon> {
  const res = await clientFetch<Coupon>(bffPath(endpoints.admin.coupon(id)), {
    method: 'PUT',
    body: asBody(data as unknown as Record<string, unknown>),
  });
  return res.data!;
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.coupon(id)), { method: 'DELETE' });
}
