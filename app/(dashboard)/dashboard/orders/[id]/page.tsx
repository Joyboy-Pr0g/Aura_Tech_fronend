import { Suspense } from 'react';
import { OrderDetailContent } from '@/features/orders/components/order-detail-content';
import { OrderDetailSkeleton } from '@/features/orders/skeletons/order-detail-skeleton';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent id={id} />
    </Suspense>
  );
}
