import { Suspense } from 'react';
import { OrdersList } from '@/features/orders/components/orders-list';
import { OrdersListSkeleton } from '@/features/orders/skeletons/orders-list-skeleton';

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersListSkeleton />}>
      <OrdersList />
    </Suspense>
  );
}
