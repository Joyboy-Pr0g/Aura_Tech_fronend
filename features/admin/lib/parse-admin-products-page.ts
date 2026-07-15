import { ApiResponse, CursorPage } from '@/lib/types/api';
import { AdminProduct } from '@/lib/types/entities';

type NestedProductsPage = {
  items: AdminProduct[];
  next_cursor: string | null;
  has_more: boolean;
};

export function parseAdminProductsPage(
  res: ApiResponse<NestedProductsPage | AdminProduct[]>,
): CursorPage<AdminProduct> {
  const data = res.data;
  if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
    return {
      items: data.items,
      next_cursor: data.next_cursor ?? null,
      has_more: data.has_more ?? false,
    };
  }
  return {
    items: Array.isArray(data) ? data : [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}
