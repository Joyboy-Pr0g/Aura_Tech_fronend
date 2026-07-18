import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { CursorPage } from '@/lib/types/api';
import { Order } from '@/lib/types/entities';
import { AdminProductQuestion, AdminProductReview } from '@/features/admin/types';

export async function getAdminQuestions(params?: {
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<AdminProductQuestion>> {
  const res = await clientFetch<AdminProductQuestion[]>(bffPath(endpoints.admin.questions), {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function answerAdminQuestion(questionId: string, answer: string) {
  const res = await clientFetch(bffPath(endpoints.admin.questionAnswer(questionId)), {
    method: 'POST',
    body: { answer },
  });
  return res.data;
}

export async function getAdminUserOrders(
  userId: string,
  params?: { limit?: number; cursor?: string },
): Promise<CursorPage<Order>> {
  const res = await clientFetch<Order[]>(bffPath(endpoints.admin.userOrders(userId)), {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getAdminUserReviews(userId: string): Promise<AdminProductReview[]> {
  const res = await clientFetch<AdminProductReview[]>(bffPath(endpoints.admin.userReviews(userId)));
  return res.data ?? [];
}

export async function getAdminUserQuestions(userId: string): Promise<AdminProductQuestion[]> {
  const res = await clientFetch<AdminProductQuestion[]>(bffPath(endpoints.admin.userQuestions(userId)));
  return res.data ?? [];
}
