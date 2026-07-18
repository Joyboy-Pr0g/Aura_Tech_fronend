import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { AdminProductQuestion } from '@/features/admin/types';

export async function getAdminQuestionsServer(params?: {
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<AdminProductQuestion>> {
  const res = await serverFetch<AdminProductQuestion[]>(endpoints.admin.questions, { searchParams: params });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}
