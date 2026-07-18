const EXCLUDED_PATH_PREFIXES = [
  '/login',
  '/register',
  '/forget-password',
  '/dashboard',
  '/admin',
  '/api',
  '/coming-soon',
] as const;

function hasProductionBackend(): boolean {
  const url = process.env.BACKEND_API_URL?.trim();
  if (!url) return false;
  return !url.includes('localhost') && !url.includes('127.0.0.1');
}

export function isStorefrontComingSoon(): boolean {
  if (process.env.STOREFRONT_COMING_SOON === 'false') return false;
  if (
    process.env.STOREFRONT_COMING_SOON === 'true' ||
    process.env.NEXT_PUBLIC_STOREFRONT_COMING_SOON === 'true'
  ) {
    return true;
  }

  // Safety net: in production without a real backend URL, stay on coming soon.
  if (process.env.NODE_ENV === 'production' && !hasProductionBackend()) {
    return true;
  }

  return false;
}

export function shouldShowComingSoonForPath(pathname: string): boolean {
  if (!isStorefrontComingSoon()) return false;
  if (pathname.includes('.')) return false;

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
