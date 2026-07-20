import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import { assertTurnstileFromBody } from '@/lib/security/turnstile';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const turnstile = await assertTurnstileFromBody(body, request);
    if (!turnstile.ok) {
      return NextResponse.json(
        { success: false, message: turnstile.message },
        { status: 400 },
      );
    }

    const response = await fetchBackend(endpoints.auth.forgotPassword, {
      method: 'POST',
      body: turnstile.payload,
    });

    return NextResponse.json({
      success: true,
      message: response.message,
      data: response.data,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { success: false, message: 'Password reset request failed' },
      { status: 500 },
    );
  }
}
