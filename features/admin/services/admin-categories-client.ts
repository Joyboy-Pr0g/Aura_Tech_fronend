import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { CursorPage } from '@/lib/types/api';
import { AdminCategory } from '@/lib/types/entities';
import { parseAdminCategoriesPage } from '@/features/admin/lib/parse-admin-categories-page';

export async function getAdminCategories(params?: {
  search?: string;
  is_active?: boolean;
  limit?: number;
  cursor?: string;
  include_deleted?: boolean;
}): Promise<CursorPage<AdminCategory>> {
  const res = await clientFetch<AdminCategory[]>(bffPath(endpoints.admin.categories), { searchParams: params });
  return parseAdminCategoriesPage(res);
}

export async function getAdminCategory(id: string): Promise<AdminCategory> {
  const res = await clientFetch<AdminCategory>(bffPath(endpoints.admin.category(id)));
  return res.data!;
}

export async function createAdminCategory(data: FormData | Record<string, unknown>): Promise<AdminCategory> {
  const res = await clientFetch<AdminCategory>(bffPath(endpoints.admin.categories), {
    method: 'POST',
    body: data,
  });
  return res.data!;
}

export async function updateAdminCategory(id: string, data: FormData | Record<string, unknown>): Promise<AdminCategory> {
  const res = await clientFetch<AdminCategory>(bffPath(endpoints.admin.category(id)), {
    method: 'PUT',
    body: data,
  });
  return res.data!;
}

export async function activateAdminCategory(id: string) {
  await clientFetch(bffPath(endpoints.admin.categoryAction(id, 'activate')), { method: 'POST' });
}

export async function deactivateAdminCategory(id: string) {
  await clientFetch(bffPath(endpoints.admin.categoryAction(id, 'deactivate')), { method: 'POST' });
}

export async function softDeleteAdminCategory(id: string) {
  await clientFetch(bffPath(endpoints.admin.categoryAction(id, 'soft-delete')), { method: 'POST' });
}

export async function restoreAdminCategory(id: string) {
  await clientFetch(bffPath(endpoints.admin.categoryAction(id, 'restore')), { method: 'POST' });
}

export async function deleteAdminCategory(id: string) {
  await clientFetch(bffPath(endpoints.admin.category(id)), { method: 'DELETE' });
}

export async function unassignParentAdminCategory(id: string) {
  await clientFetch(bffPath(endpoints.admin.categoryAction(id, 'unassign-parent')), { method: 'POST' });
}
