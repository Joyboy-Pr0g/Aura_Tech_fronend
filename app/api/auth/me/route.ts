import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { endpoints } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { ApiError } from '@/lib/errors/api-error';
import { User } from '@/lib/types/entities';

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const response = await fetchBackend<User>(endpoints.auth.me, { token });
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      const response = NextResponse.json(
        { success: false, message: err.message },
        { status: err.status },
      );
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    if (err instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
