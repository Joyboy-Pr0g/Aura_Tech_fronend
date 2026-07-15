import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { Role, User } from '@/lib/types/entities';
import { parseAdminUsersPage } from '@/features/admin/lib/parse-admin-users-page';

type NestedUsersPage = {
  items: User[];
  next_cursor: string | null;
  has_more: boolean;
};

export async function getAdminUsersServer(params?: {
  role?: Role;
  search?: string;
  limit?: number;
  include_deleted?: string;
  cursor?: string;
}): Promise<CursorPage<User>> {
  const res = await serverFetch<NestedUsersPage | User[]>(endpoints.admin.users, { searchParams: params });
  return parseAdminUsersPage(res);
}

export async function getAdminUserServer(id: string): Promise<User> {
  const res = await serverFetch<User>(endpoints.admin.user(id));
  return res.data!;
}
