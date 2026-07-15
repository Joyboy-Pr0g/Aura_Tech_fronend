import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { endpoints } from '@/lib/api/endpoints';
import { setAuthCookie } from '@/lib/auth/session';
import { User } from '@/lib/types/entities';
import { ApiError } from '@/lib/errors/api-error';

interface AuthData {
  token: string;
  user: User;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetchBackend<AuthData>(endpoints.auth.login, {
      method: 'POST',
      body,
    });

    const { token, user } = response.data!;
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: response.message,
      data: { user },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { success: false, message: 'Login faileddddd' },
      { status: 500 },
    );
  }
}
