import { clientFetch } from '@/lib/api/client';
import { Order, OrderStatus } from '@/lib/types/entities';
import { PaginatedResult } from '@/lib/types/api';

export async function getMyOrders(page = 1, limit = 10) {
  const res = await clientFetch<PaginatedResult<Order>>('/api/orders/my', {
    searchParams: { page, limit },
  });
  return res.data!;
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

export async function getAllOrders(params?: { status?: string; page?: number; limit?: number }) {
  const res = await clientFetch<PaginatedResult<Order>>('/api/orders', {
    searchParams: params,
  });
  return res.data!;
}

export async function updateOrderStatus(id: string, status: OrderStatus, reason?: string) {
  const res = await clientFetch<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: { status, reason },
  });
  return res.data!;
}
