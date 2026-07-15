import { getMyOrderServer } from '@/features/orders/services/orders-server';
import { getPaymentMethodsServer } from '@/features/cart/services/cart-server';
import { OrderDetail } from '@/features/orders/components/order-detail';
import { OrderNotFound } from '@/features/orders/components/order-not-found';

interface OrderDetailContentProps {
  id: string;
}

export async function OrderDetailContent({ id }: OrderDetailContentProps) {
  const [order, paymentMethods] = await Promise.all([
    getMyOrderServer(id),
    getPaymentMethodsServer(),
  ]);

  if (!order) {
    return <OrderNotFound />;
  }

  return <OrderDetail order={order} paymentMethods={paymentMethods ?? []} />;
}
