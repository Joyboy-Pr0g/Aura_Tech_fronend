import { getMyOrdersServer } from '@/features/orders/services/orders-server';
import { OrdersListView } from '@/features/orders/components/orders-list-view';

export async function OrdersList() {
  const data = await getMyOrdersServer();
  return <OrdersListView orders={data.items} total={data.items.length} />;
}
