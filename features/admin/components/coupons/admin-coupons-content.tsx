import { getAdminCouponsServer } from '@/features/admin/services/admin-coupons-server';
import { getAdminCategoriesServer } from '@/features/admin/services/admin-categories-server';
import { getAdminProductsServer } from '@/features/admin/services/admin-products-server';
import { AdminCouponsPanel } from '@/features/admin/components/coupons/admin-coupons-panel';

export async function AdminCouponsContent() {
  const [coupons, categoriesPage, productsPage] = await Promise.all([
    getAdminCouponsServer(),
    getAdminCategoriesServer({ limit: 100, include_deleted: 'false' }),
    getAdminProductsServer({ limit: 100 }),
  ]);

  return (
    <AdminCouponsPanel
      initialCoupons={coupons}
      categories={categoriesPage.items}
      products={productsPage.items}
    />
  );
}
