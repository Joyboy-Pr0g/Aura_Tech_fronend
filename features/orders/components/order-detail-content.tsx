import { getMyOrderServer } from '@/features/orders/services/orders-server';
import { getPaymentMethodsServer } from '@/features/cart/services/cart-server';
import { OrderDetail } from '@/features/orders/components/order-detail';

interface OrderDetailContentProps {
  id: string;
}

export async function OrderDetailContent({ id }: OrderDetailContentProps) {
  const [order, paymentMethods] = await Promise.all([
    getMyOrderServer(id),
    getPaymentMethodsServer(),
  ]);

  if (!order) {
    return <div className="p-8 text-white/50">Order not found</div>;
  }

  return <OrderDetail order={order} paymentMethods={paymentMethods ?? []} />;
}
