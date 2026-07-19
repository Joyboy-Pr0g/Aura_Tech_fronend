export function buildCategoryProductsPath(
  categorySlug: string,
  subCategorySlug?: string | null,
): string {
  const params = new URLSearchParams();
  const slug = categorySlug?.trim();

  if (slug) {
    params.set('category', slug);
  }

  if (subCategorySlug?.trim()) {
    params.set('sub_category', subCategorySlug.trim());
  }

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}
