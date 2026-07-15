import { serverFetch } from '@/lib/api/server';
import { Order } from '@/lib/types/entities';

export async function getMyOrdersServer(limit = 10, cursor?: string) {
  const res = await serverFetch<Order[]>('/orders/my', {
    searchParams: { limit, cursor },
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getMyOrderServer(id: string) {
  const res = await serverFetch<Order>(`/orders/my/${id}`);
  return res.data!;
}
