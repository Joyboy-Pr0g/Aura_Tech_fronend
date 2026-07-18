import { ApiResponse, CursorPage } from '@/lib/types/api';
import { Order } from '@/lib/types/entities';

export function parseAdminOrdersPage(res: ApiResponse<Order[]>): CursorPage<Order> {
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}
