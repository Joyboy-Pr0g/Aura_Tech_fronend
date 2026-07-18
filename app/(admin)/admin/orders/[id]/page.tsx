import { Suspense } from 'react';
import { AdminOrderDetailContent } from '@/features/admin/components/orders/admin-order-detail-content';
import { OrderDetailSkeleton } from '@/features/orders/skeletons/order-detail-skeleton';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <AdminOrderDetailContent id={id} />
    </Suspense>
  );
}
