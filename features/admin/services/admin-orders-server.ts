import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { Order } from '@/lib/types/entities';
import { parseAdminOrdersPage } from '@/features/admin/lib/parse-admin-orders-page';
import { OrderStatusHistoryEntry } from '@/features/engagement/types';

export async function getAdminOrdersServer(params?: {
  status?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<Order>> {
  const res = await serverFetch<Order[]>(endpoints.orders.all, { searchParams: params });
  return parseAdminOrdersPage(res);
}

export async function getAdminOrderServer(id: string): Promise<Order | null> {
  try {
    const res = await serverFetch<Order>(endpoints.orders.byId(id));
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getAdminOrderStatusHistoryServer(id: string): Promise<OrderStatusHistoryEntry[]> {
  try {
    const res = await serverFetch<OrderStatusHistoryEntry[]>(endpoints.orders.orderHistory(id));
    return res.data ?? [];
  } catch {
    return [];
  }
}