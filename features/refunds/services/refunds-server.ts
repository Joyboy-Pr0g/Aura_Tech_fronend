import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { RefundRequest } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';

export async function getMyOrderRefundRequestServer(orderNumber: string) {
  const res = await serverFetch<RefundRequest | null>(
    endpoints.orders.myOrderRefundRequest(orderNumber),
  );
  return res.data ?? null;
}

export async function getAdminRefundRequestsServer(params?: {
  status?: string;
  order_number?: string;
  cursor?: string;
  limit?: number;
}) {
  const res = await serverFetch<RefundRequest[]>(endpoints.admin.refundRequests, {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  } satisfies CursorPage<RefundRequest>;
}
