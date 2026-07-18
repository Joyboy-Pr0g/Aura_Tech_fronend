import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { RefundRequest } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';

export async function getMyOrderRefundRequest(orderNumber: string) {
  const res = await clientFetch<RefundRequest | null>(
    bffPath(endpoints.orders.myOrderRefundRequest(orderNumber)),
  );
  return res.data ?? null;
}

export async function submitRefundRequest(orderNumber: string, reason: string, image?: File | null) {
  const formData = new FormData();
  formData.append('reason', reason);
  if (image) formData.append('image', image);

  const res = await clientFetch<RefundRequest>(
    bffPath(endpoints.orders.myOrderRefundRequest(orderNumber)),
    {
      method: 'POST',
      body: formData,
    },
  );
  return res.data!;
}

export async function getAdminRefundRequests(params?: {
  status?: string;
  order_number?: string;
  cursor?: string;
  limit?: number;
}) {
  const res = await clientFetch<RefundRequest[]>(bffPath(endpoints.admin.refundRequests), {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  } satisfies CursorPage<RefundRequest>;
}

export async function approveAdminRefundRequest(id: string) {
  const res = await clientFetch<RefundRequest>(bffPath(endpoints.admin.refundRequestApprove(id)), {
    method: 'PATCH',
  });
  return res.data!;
}

export async function rejectAdminRefundRequest(id: string, rejection_reason: string) {
  const res = await clientFetch<RefundRequest>(bffPath(endpoints.admin.refundRequestReject(id)), {
    method: 'PATCH',
    body: { rejection_reason },
  });
  return res.data!;
}
