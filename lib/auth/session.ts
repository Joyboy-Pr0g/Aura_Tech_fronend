import { cookies } from 'next/headers';
import { fetchBackend } from '@/lib/api/fetch';
import { endpoints } from '@/lib/api/endpoints';
import { User } from '@/lib/types/entities';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
};

export const getAuthToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
};

export const setAuthCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions);
};

export const clearAuthCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
};

export const getSession = async (): Promise<User | null> => {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetchBackend<User>(endpoints.auth.me, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}