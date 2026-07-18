import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Order } from '@/lib/types/entities';
import { OrderStatusHistoryEntry } from '@/features/engagement/types';

export async function getMyOrdersServer(params?: {
  search?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}) {
  const res = await serverFetch<Order[]>('/orders/my', {
    searchParams: {
      limit: params?.limit ?? 10,
      cursor: params?.cursor,
      search: params?.search,
      status: params?.status,
    },
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getMyOrderServer(orderNumber: string): Promise<Order | null> {
  try {
    const res = await serverFetch<Order>(`/orders/my/${orderNumber}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getMyOrderStatusHistoryServer(orderNumber: string): Promise<OrderStatusHistoryEntry[]> {
  try {
    const res = await serverFetch<OrderStatusHistoryEntry[]>(endpoints.engagement.orderHistory(orderNumber));
    return res.data ?? [];
  } catch {
    return [];
  }
}
