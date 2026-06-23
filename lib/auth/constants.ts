export const AUTH_COOKIE_NAME = 'auth_token';

export type TokenRole = 'admin' | 'sub_admin' | 'customer';

export function decodeTokenRole(token: string): TokenRole | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    const role = payload.role;
    if (role === 'admin' || role === 'sub_admin' || role === 'customer') {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}
