import { clientFetch } from '@/lib/api/client';
import { Order, OrderStatus } from '@/lib/types/entities';

export async function getMyOrders(limit = 10, cursor?: string) {
  const res = await clientFetch<Order[]>('/api/orders/my', {
    searchParams: { limit, cursor },
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getMyOrder(id: string) {
  const res = await clientFetch<Order>(`/api/orders/my/${id}`);
  return res.data!;
}

export async function checkout(data: {
  shipping_address_id?: string;
  billing_address_id?: string;
  notes?: string;
}) {
  const res = await clientFetch<Order>('/api/orders/checkout', {
    method: 'POST',
    body: data,
  });
  return res.data!;
}

export async function getAllOrders(params?: { status?: string; limit?: number; cursor?: string }) {
  const res = await clientFetch<Order[]>('/api/orders', {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function updateOrderStatus(id: string, status: OrderStatus, reason?: string) {
  const res = await clientFetch<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: { status, reason },
  });
  return res.data!;
}
