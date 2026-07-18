import { Suspense } from 'react';
import { AdminOrdersContent } from '@/features/admin/components/orders/admin-orders-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default function AdminOrdersPage(props: AdminOrdersPageProps) {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminOrdersContent {...props} />
    </Suspense>
  );
}
