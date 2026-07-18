export function isStorefrontComingSoon(): boolean {
  return process.env.STOREFRONT_COMING_SOON === 'true';
}
