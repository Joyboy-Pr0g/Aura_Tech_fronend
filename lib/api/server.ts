import { fetchBackend, FetchBackendOptions } from '@/lib/api/fetch';
import { getAuthToken } from '@/lib/auth/session';
import { ApiResponse } from '@/lib/types/api';

export async function serverFetch<T = unknown>(
  path: string,
  options: Omit<FetchBackendOptions, 'token'> & { token?: string } = {},
  tags?: string[],
): Promise<ApiResponse<T>> {
  const token = options.token ?? (await getAuthToken());
  return fetchBackend<T>(path, { ...options, token }, tags);
}
