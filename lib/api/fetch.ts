import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';
import { parseApiResponse } from '@/lib/api/parse-response';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000/api';

export interface FetchBackendOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  clientIp?: string;
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
  const { token, clientIp, body, searchParams, headers, ...rest } = options;
  const preparedBody = prepareBody(body);
  const isJsonBody = preparedBody !== undefined && !(body instanceof FormData);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, searchParams), {
      ...rest,
      body: preparedBody,
      headers: {
        Accept: 'application/json',
        ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
        ...headers,
      },
      cache: 'no-store',
      next: { tags: tags ?? [] },
    });
  } catch {
    throw new ApiError('Service unavailable', 503);
  }

  return parseApiResponse<T>(response);
}
