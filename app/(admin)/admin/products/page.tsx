import { Suspense } from 'react';
import { AdminProductsContent } from '@/features/admin/components/products/admin-products-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminProductsPageProps {
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

export default function AdminProductsPage(props: AdminProductsPageProps) {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminProductsContent {...props} />
    </Suspense>
  );
}
