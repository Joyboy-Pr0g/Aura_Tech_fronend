import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { AdminCategory } from '@/lib/types/entities';
import { parseAdminCategoriesPage } from '@/features/admin/lib/parse-admin-categories-page';

export async function getAdminCategoriesServer(params?: {
  search?: string;
  is_active?: string;
  limit?: number;
  cursor?: string;
  include_deleted?: string;
}): Promise<CursorPage<AdminCategory>> {
  const res = await serverFetch<AdminCategory[]>(endpoints.admin.categories, { searchParams: params });
  return parseAdminCategoriesPage(res);
}
