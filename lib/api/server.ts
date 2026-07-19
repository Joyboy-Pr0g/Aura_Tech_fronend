import { fetchBackend, FetchBackendOptions } from '@/lib/api/fetch';
import { getAuthToken } from '@/lib/auth/session';
import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';
import { isCacheableProfile, type CacheProfile } from '@/lib/api/cache';

export interface ServerFetchOptions extends Omit<FetchBackendOptions, 'token'> {
  token?: string;
  cacheProfile?: CacheProfile;
  /** Attach Bearer token from cookie. Defaults to false for cacheable public reads. */
  withAuth?: boolean;
}

export async function serverFetch<T = unknown>(
  path: string,
  options: ServerFetchOptions = {},
  tags?: string[],
): Promise<ApiResponse<T>> {
  try {
    const { withAuth, token: explicitToken, cacheProfile, ...rest } = options;
    const shouldAttachAuth = withAuth ?? !isCacheableProfile(cacheProfile);
    const token = shouldAttachAuth
      ? explicitToken ?? (await getAuthToken())
      : explicitToken;

    return await fetchBackend<T>(
      path,
      { ...rest, cacheProfile, token },
      tags,
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Service unavailable', 503);
  }
}
