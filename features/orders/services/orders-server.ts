import { serverFetch } from '@/lib/api/server';
import { Order } from '@/lib/types/entities';
import { PaginatedResult } from '@/lib/types/api';

export async function getMyOrdersServer(page = 1, limit = 10) {
  const res = await serverFetch<PaginatedResult<Order>>('/orders/my', {
    searchParams: { page, limit },
  });
  return res.data!;
}

export async function getMyOrderServer(id: string) {
  const res = await serverFetch<Order>(`/orders/my/${id}`);
  return res.data!;
}
