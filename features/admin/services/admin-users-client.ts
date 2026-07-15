import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { Role, User } from '@/lib/types/entities';
import { parseAdminUsersPage } from '@/features/admin/lib/parse-admin-users-page';
import { bffPath } from '@/lib/api/bff';

type NestedUsersPage = {
  items: User[];
  next_cursor: string | null;
  has_more: boolean;
};

export async function getAdminUsers(params?: {
  role?: Role;
  search?: string;
  limit?: number;
  cursor?: string;
  include_deleted: boolean;
}): Promise<CursorPage<User>> {
  const res = await clientFetch<NestedUsersPage | User[]>(bffPath(endpoints.admin.users), { searchParams: params });
  return parseAdminUsersPage(res);
}

export async function activateAdminUser(id: string) {
  await clientFetch(bffPath(endpoints.admin.userAction(id, 'activate')), { method: 'POST' });
}

export async function deactivateAdminUser(id: string) {
  await clientFetch(bffPath(endpoints.admin.userAction(id, 'deactivate')), { method: 'POST' });
}

export async function softDeleteAdminUser(id: string) {
  await clientFetch(bffPath(endpoints.admin.userAction(id, 'soft-delete')), { method: 'POST' });
}

export async function restoreAdminUser(id: string) {
  await clientFetch(bffPath(endpoints.admin.userAction(id, 'restore')), { method: 'POST' });
}

export async function deleteAdminUser(id: string) {
  await clientFetch(bffPath(endpoints.admin.user(id)), { method: 'DELETE' });
}

export async function updateAdminUser(id: string, data: { full_name: string }) {
  const res = await clientFetch<User>(bffPath(endpoints.admin.user(id)), {
    method: 'PUT',
    body: data,
  });
  return res.data!;
}

export async function resetPasswordAdminUser(id: string) {
  await clientFetch(bffPath(endpoints.admin.userAction(id, 'reset-password')), { method: 'POST' });
}

export async function createAdminUser(data: {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}) {
  const res = await clientFetch<User>(bffPath(endpoints.admin.users), {
    method: 'POST',
    body: data,
  });
  return res.data!;
}
