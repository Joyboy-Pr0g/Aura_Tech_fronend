import { Suspense } from 'react';
import { getMaxProductPriceServer, getProductBrandsServer, getProductsServer } from '@/features/products/services/products-server';
import { getCategoriesServer, getCategoryBySlugServer } from '@/features/categories/services/categories-server';
import { ProductsCatalog } from '@/features/products/components/products-catalog';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { getAuthToken } from '@/lib/auth/session';

const PAGE_SIZE = 12;

interface ProductsPageProps {
  searchParams: Promise<{
    search_query?: string;
    category?: string;
    sub_category?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
  }>;
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search_query?.trim() ?? '';
  const categoryParam = params.category?.trim() ?? '';
  const subCategoryParam = params.sub_category?.trim() ?? '';

  const [category, subCategory] = await Promise.all([
    categoryParam ? getCategoryBySlugServer(categoryParam) : Promise.resolve(null),
    subCategoryParam ? getCategoryBySlugServer(subCategoryParam) : Promise.resolve(null),
  ]);

  const fetchParams = {
    search: search || undefined,
    category_id: category?.id,
    sub_category_id: subCategory?.id,
    brand: params.brand || undefined,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    in_stock: params.in_stock === 'true' ? true : undefined,
    limit: PAGE_SIZE,
  };

  const [categories, productPage, brands, maxProductPrice] = await Promise.all([
    getCategoriesServer(),
    getProductsServer(fetchParams),
    getProductBrandsServer(),
    getMaxProductPriceServer(),
  ]);

  const maxPrice = Math.max(maxProductPrice, 1000);
  const isAuthenticated = Boolean(await getAuthToken());

  return (
    <ProductsCatalog
      products={productPage.items}
      hasMore={productPage.has_more}
      nextCursor={productPage.next_cursor}
      categories={categories}
      brands={brands}
      maxPrice={maxPrice}
      searchQuery={search || undefined}
      fetchParams={fetchParams}
      pageSize={PAGE_SIZE}
      isAuthenticated={isAuthenticated}
    />
  );
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={<div className="py-20 px-4"><ProductGridSkeleton count={8} /></div>}>
      <ProductsContent {...props} />
    </Suspense>
  );
}
