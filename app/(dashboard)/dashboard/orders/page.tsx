import { Suspense } from 'react';
import { OrdersListContent } from '@/features/orders/components/orders-list-content';
import { OrdersListSkeleton } from '@/features/orders/skeletons/orders-list-skeleton';

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default function OrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <Suspense fallback={<OrdersListSkeleton />}>
      <OrdersListContent searchParams={searchParams} />
    </Suspense>
  );
}
