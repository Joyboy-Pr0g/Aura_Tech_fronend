import { ApiResponse, CursorPage } from '@/lib/types/api';
import { AdminCategory } from '@/lib/types/entities';

type NestedCategoriesPage = {
  items: AdminCategory[];
  next_cursor: string | null;
  has_more: boolean;
};

export function parseAdminCategoriesPage(
  res: ApiResponse<NestedCategoriesPage | AdminCategory[]>,
): CursorPage<AdminCategory> {
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
