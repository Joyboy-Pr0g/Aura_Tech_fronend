import { fetchBackend, FetchBackendOptions } from '@/lib/api/fetch';
import { getAuthToken } from '@/lib/auth/session';
import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';

export async function serverFetch<T = unknown>(
  path: string,
  options: Omit<FetchBackendOptions, 'token'> & { token?: string } = {},
  tags?: string[],
): Promise<ApiResponse<T>> {
  try {
    const token = options.token ?? (await getAuthToken());
    return await fetchBackend<T>(path, { ...options, token }, tags);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Service unavailable', 503);
  }
}
