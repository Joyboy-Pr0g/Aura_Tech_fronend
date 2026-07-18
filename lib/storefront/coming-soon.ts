const EXCLUDED_PATH_PREFIXES = [
  '/login',
  '/register',
  '/forget-password',
  '/dashboard',
  '/admin',
  '/api',
] as const;

export function isStorefrontComingSoon(): boolean {
  return process.env.STOREFRONT_COMING_SOON === 'true';
}

export function shouldShowComingSoonForPath(pathname: string): boolean {
  if (!isStorefrontComingSoon()) return false;

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
