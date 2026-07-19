/** Server-side fetch cache TTLs (seconds). */
export const CACHE = {
  /** Logo, about, website settings — rarely changes */
  static: 86400,
  /** Category tree — rarely changes */
  categories: 86400,
  /** Product listings, brands, filters — updated occasionally */
  catalog: 3600,
  /** Single product pages — stock/price can change */
  product: 1800,
  /** Reviews — users add reviews */
  reviews: 600,
  /** Stock / inventory — changes frequently */
  stock: 300,
  /** User-specific or real-time — never cache */
  none: 0,
} as const;

export type CacheProfile = keyof typeof CACHE;

export function isCacheableProfile(profile?: CacheProfile): profile is Exclude<CacheProfile, 'none'> {
  return profile !== undefined && profile !== 'none';
}
