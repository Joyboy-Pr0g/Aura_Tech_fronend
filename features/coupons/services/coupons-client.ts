import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { Coupon } from '@/lib/types/entities';

export interface CouponLineItem {
  product_id: string;
  category_id: string;
  sub_category_id?: string | null;
  line_total: number;
}

export interface ValidateCouponResult {
  coupon: Coupon;
  discount_amount: number;
  code: string;
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  items: CouponLineItem[] = [],
): Promise<ValidateCouponResult> {
  const res = await clientFetch<ValidateCouponResult>('/api/coupons/validate', {
    method: 'POST',
    body: { code: code.trim(), subtotal, items },
  });
  return res.data!;
}
