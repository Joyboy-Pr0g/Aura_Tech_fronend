import { getMyOrdersServer } from '@/features/orders/services/orders-server';
import { OrdersListView } from '@/features/orders/components/orders-list-view';
import { CursorPage } from '@/lib/types/api';
import { Order } from '@/lib/types/entities';

const PAGE_SIZE = 10;

interface OrdersListContentProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export async function OrdersListContent({ searchParams }: OrdersListContentProps) {
  const params = await searchParams;

  const page: CursorPage<Order> = await getMyOrdersServer({
    search: params.search?.trim() || undefined,
    status: params.status || undefined,
    limit: PAGE_SIZE,
  });

  return (
    <OrdersListView
      initial={page}
      initialSearch={params.search}
      initialStatus={params.status}
    />
  );
}
