import { SuspiciousUserReport } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { clientFetch } from '@/lib/api/client';
import { bffPath } from '@/lib/api/bff';
import { endpoints } from '@/lib/api/endpoints';

export async function getAdminSuspiciousUsers(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<SuspiciousUserReport>> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.cursor) search.set('cursor', params.cursor);
  if (params?.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  const path = query
    ? `${bffPath(endpoints.admin.suspiciousUsers)}?${query}`
    : bffPath(endpoints.admin.suspiciousUsers);

  const res = await clientFetch<CursorPage<SuspiciousUserReport>>(path);
  return res.data ?? { items: [], next_cursor: null, has_more: false };
}

export async function dismissSuspiciousUserReport(id: string, note?: string): Promise<SuspiciousUserReport> {
  const res = await clientFetch<SuspiciousUserReport>(
    bffPath(endpoints.admin.suspiciousUserDismiss(id)),
    { method: 'POST', body: note ? { note } : {} },
  );
  return res.data!;
}

export async function blockSuspiciousUserReport(id: string, note?: string): Promise<SuspiciousUserReport> {
  const res = await clientFetch<SuspiciousUserReport>(
    bffPath(endpoints.admin.suspiciousUserBlock(id)),
    { method: 'POST', body: note ? { note } : {} },
  );
  return res.data!;
}

export async function deleteSuspiciousUserReport(id: string, note?: string): Promise<SuspiciousUserReport> {
  const res = await clientFetch<SuspiciousUserReport>(
    bffPath(endpoints.admin.suspiciousUserDelete(id)),
    { method: 'POST', body: note ? { note } : {} },
  );
  return res.data!;
}
