export function buildCategoryProductsPath(categorySlug: string, subCategorySlug?: string | null): string {
  const category = encodeURIComponent(categorySlug);
  if (subCategorySlug?.trim()) {
    return `/products/category/${category}/${encodeURIComponent(subCategorySlug.trim())}`;
  }
  return `/products/category/${category}`;
}
