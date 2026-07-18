import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { Order, Role, User } from '@/lib/types/entities';
import { parseAdminUsersPage } from '@/features/admin/lib/parse-admin-users-page';
import { AdminProductQuestion, AdminProductReview } from '@/features/admin/types';

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

export async function getAdminUserServer(id: string): Promise<User | null> {
  try {
    const res = await serverFetch<User>(endpoints.admin.user(id));
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getAdminUserOrdersServer(
  userId: string,
  params?: { limit?: number; cursor?: string },
): Promise<CursorPage<Order>> {
  const res = await serverFetch<Order[]>(endpoints.admin.userOrders(userId), { searchParams: params });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getAdminUserReviewsServer(userId: string): Promise<AdminProductReview[]> {
  const res = await serverFetch<AdminProductReview[]>(endpoints.admin.userReviews(userId));
  return res.data ?? [];
}

export async function getAdminUserQuestionsServer(userId: string): Promise<AdminProductQuestion[]> {
  const res = await serverFetch<AdminProductQuestion[]>(endpoints.admin.userQuestions(userId));
  return res.data ?? [];
}
