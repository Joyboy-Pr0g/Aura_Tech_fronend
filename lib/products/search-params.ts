export const PRODUCT_SEARCH_QUERY_KEY = 'search_query';

export function getProductSearchQuery(params: URLSearchParams): string {
  return params.get(PRODUCT_SEARCH_QUERY_KEY)?.trim() ?? '';
}

export function buildProductsHref(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
): string {
  const next = new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });

  const query = next.toString();
  return query ? `/products?${query}` : '/products';
}
