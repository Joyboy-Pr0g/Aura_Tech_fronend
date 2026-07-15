import { getAdminProductsServer } from '@/features/admin/services/admin-products-server';
import { getAdminCategoriesServer } from '@/features/admin/services/admin-categories-server';
import { AdminProductsPanel } from '@/features/admin/components/products/admin-products-panel';
import { getProductBrandsServer } from '@/features/products/services/products-server';

const PAGE_SIZE = 20;

interface AdminProductsContentProps {
  searchParams: Promise<{
    search?: string;
    category_id?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    include_deleted?: string;
  }>;
}

export async function AdminProductsContent({ searchParams }: AdminProductsContentProps) {
  const params = await searchParams;

  const [page, categoriesPage, brandsResponse] = await Promise.all([
    getAdminProductsServer({
      search: params.search?.trim() || undefined,
      category_id: params.category_id || undefined,
      brand: params.brand?.trim() || undefined,
      min_price: params.min_price || undefined,
      max_price: params.max_price || undefined,
      in_stock: params.in_stock || undefined,
      include_deleted: params.include_deleted,
      limit: PAGE_SIZE,
    }),
    getAdminCategoriesServer({ limit: 100, include_deleted: 'false' }),
    getProductBrandsServer(),
  ]);

  const flatCategories = categoriesPage.items

  return (
    <AdminProductsPanel
      initial={page}
      categories={flatCategories}
      initialSearch={params.search}
      initialCategoryId={params.category_id}
      initialBrand={params.brand}
      initialMinPrice={params.min_price}
      initialMaxPrice={params.max_price}
      initialInStock={params.in_stock}
      initialIncludeDeleted={params.include_deleted === 'true'}
      brands={brandsResponse}
    />
  );
}
