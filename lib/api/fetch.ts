import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000/api';

export interface FetchBackendOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: BodyInit | Record<string, unknown> | null;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, searchParams?: FetchBackendOptions['searchParams']): string {
  const url = new URL(path.startsWith('http') ? path : `${BACKEND_API_URL}${path}`)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}


function prepareBody(body: FetchBackendOptions['body']): BodyInit | null {
  if (body === undefined || body === null) return null;
  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string') return body;
  return JSON.stringify(body);
}

export async function fetchBackend<T = unknown>(
  path: string,
  options: FetchBackendOptions = {},
  tags?: string[],
): Promise<ApiResponse<T>> {
  const { token, body, searchParams, headers, ...rest } = options;
  const preparedBody = prepareBody(body);
  const isJsonBody = preparedBody !== undefined && !(body instanceof FormData);

  const response = await fetch(buildUrl(path, searchParams), {
    ...rest,
    body: preparedBody,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
    next:{tags: tags ?? []},
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
