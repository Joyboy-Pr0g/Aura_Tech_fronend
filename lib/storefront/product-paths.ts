export function buildCategoryProductsPath(
  categorySlug: string,
  subCategorySlug?: string | null,
  categoryId?: string | null,
): string {
  const params = new URLSearchParams();
  const slug = categorySlug?.trim();

  if (slug) {
    params.set('category', slug);
  } else if (categoryId?.trim()) {
    params.set('category_id', categoryId.trim());
  }

  if (subCategorySlug?.trim()) {
    params.set('sub_category', subCategorySlug.trim());
  }

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}
