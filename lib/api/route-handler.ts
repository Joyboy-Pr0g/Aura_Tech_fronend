import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { getAuthToken } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';
import { getClientIp } from '@/lib/http/client-ip';

interface ProxyOptions {
  path: string;
  method?: string;
  requireAuth?: boolean;
  searchParams?: Record<string, string>;
  revalidateOnSuccess?: (data?: unknown) => void;
}

export async function proxyToBackend(
  request: NextRequest,
  { path, method, requireAuth = true, searchParams, revalidateOnSuccess }: ProxyOptions,
): Promise<NextResponse> {
  try {
    const token = await getAuthToken();
    if (requireAuth && !token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح ' },
        { status: 401 },
      );
    }

    const contentType = request.headers.get('content-type') ?? '';
    let body: BodyInit | Record<string, unknown> | undefined;

    if (method !== 'GET' && method !== 'DELETE') {
      if (contentType.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        try {
          body = await request.json();
        } catch {
          body = undefined;
        }
      }
    }

    const queryParams = searchParams ?? Object.fromEntries(request.nextUrl.searchParams);

    const response = await fetchBackend(path, {
      method: method ?? request.method,
      token,
      clientIp: getClientIp(request),
      body,
      searchParams: queryParams,
    });

    revalidateOnSuccess?.(response.data);

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: err.message, error: { message: err.message, details: err.details } },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
