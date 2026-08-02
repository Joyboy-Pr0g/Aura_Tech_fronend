import { SuspiciousUserReport } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';

export async function getAdminSuspiciousUsersServer(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<SuspiciousUserReport>> {
  const res = await serverFetch<CursorPage<SuspiciousUserReport>>(endpoints.admin.suspiciousUsers, {
    searchParams: params,
  });
  return res.data ?? { items: [], next_cursor: null, has_more: false };
}
