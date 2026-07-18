import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { AdminLatestAction } from '@/lib/types/entities';

export async function getAdminLatestActions(
  entityType: string,
  entityIds: string[],
): Promise<Record<string, AdminLatestAction>> {
  if (entityIds.length === 0) return {};

  const res = await clientFetch<AdminLatestAction[]>(bffPath(endpoints.admin.actionLogsLatest), {
    searchParams: {
      entity_type: entityType,
      ids: entityIds.join(','),
    },
  });

  const map: Record<string, AdminLatestAction> = {};
  for (const row of res.data ?? []) {
    map[row.entity_id] = row;
  }
  return map;
}
