import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getMaxProductPriceServer, getProductBrandsServer, getProductsServer } from '@/features/products/services/products-server';
import { getCategoriesServer, getCategoryByIdServer, getCategoryBySlugServer } from '@/features/categories/services/categories-server';
import { ProductsCatalog } from '@/features/products/components/products-catalog';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { getAuthToken } from '@/lib/auth/session';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { buildCategoryProductsPath } from '@/lib/storefront/product-paths';

const PAGE_SIZE = 12;

interface ProductsPageProps {
  searchParams: Promise<{
    search_query?: string;
    category?: string;
    category_id?: string;
    sub_category?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categoryParam = params.category?.trim() ?? '';
  const categoryIdParam = params.category_id?.trim() ?? '';
  const subCategoryParam = params.sub_category?.trim() ?? '';

  const [categoryBySlug, categoryById, subCategory] = await Promise.all([
    categoryParam ? getCategoryBySlugServer(categoryParam) : Promise.resolve(null),
    !categoryParam && categoryIdParam ? getCategoryByIdServer(categoryIdParam) : Promise.resolve(null),
    subCategoryParam ? getCategoryBySlugServer(subCategoryParam) : Promise.resolve(null),
  ]);
  const category = categoryBySlug ?? categoryById;
  const activeCategory = subCategory ?? category;

  if (activeCategory) {
    const metadataPath = subCategory && category
      ? buildCategoryProductsPath(category.slug, subCategory.slug)
      : buildCategoryProductsPath(activeCategory.slug, null);

    return getPageMetadataFromSettings({
      title: activeCategory.name,
      description: activeCategory.description ?? `Shop ${activeCategory.name} at AURA TECH.`,
      path: metadataPath,
      image: activeCategory.image_url,
    });
  }

  return getPageMetadataFromSettings({
    title: 'Products',
    description: 'Browse gaming laptops, smartphones, and accessories at AURA TECH.',
    path: '/products',
  });
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search_query?.trim() ?? '';
  const categoryParam = params.category?.trim() ?? '';
  const categoryIdParam = params.category_id?.trim() ?? '';
  const subCategoryParam = params.sub_category?.trim() ?? '';

  const [categoryBySlug, categoryById, subCategory] = await Promise.all([
    categoryParam ? getCategoryBySlugServer(categoryParam) : Promise.resolve(null),
    !categoryParam && categoryIdParam ? getCategoryByIdServer(categoryIdParam) : Promise.resolve(null),
    subCategoryParam ? getCategoryBySlugServer(subCategoryParam) : Promise.resolve(null),
  ]);
  const category = categoryBySlug ?? categoryById;

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
