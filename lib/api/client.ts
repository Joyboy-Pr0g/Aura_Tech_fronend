import { ApiResponse } from '@/lib/types/api';
import { ApiError, getErrorMessage } from '@/lib/errors/api-error';

export { getErrorMessage };

interface ClientFetchOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

function buildClientUrl(
  path: string,
  searchParams?: ClientFetchOptions['searchParams'],
): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, window.location.origin);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function prepareClientBody(body: ClientFetchOptions['body']): BodyInit | undefined {
  if (body === null || body === undefined) return undefined;
  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

export async function clientFetch<T = unknown>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<ApiResponse<T>> {
  const { body, searchParams, headers, ...rest } = options;
  const preparedBody = prepareClientBody(body);
  const isJsonBody = preparedBody !== undefined && !(body instanceof FormData);

  const response = await fetch(buildClientUrl(path, searchParams), {
    ...rest,
    body: preparedBody,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include',
  });

  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('Invalid response from server', response.status);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(
      payload.message ?? 'Request failed',
      response.status,
      payload.error?.details,
    );
  }

  return payload;
}
