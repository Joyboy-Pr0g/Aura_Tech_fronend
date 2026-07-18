import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { Order, OrderStatus } from '@/lib/types/entities';
import { parseAdminOrdersPage } from '@/features/admin/lib/parse-admin-orders-page';

export async function getAdminOrders(params?: {
  status?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<Order>> {
  const res = await clientFetch<Order[]>('/api/orders', { searchParams: params });
  return parseAdminOrdersPage(res);
}

export async function getAdminOrder(id: string): Promise<Order> {
  const res = await clientFetch<Order>(`/api/orders/${id}`);
  return res.data!;
}

export async function updateAdminOrderStatus(id: string, status: OrderStatus, reason?: string) {
  const res = await clientFetch<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: { status, reason },
  });
  return res.data!;
}
