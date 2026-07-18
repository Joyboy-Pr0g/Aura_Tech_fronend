import { getMyOrderServer, getMyOrderStatusHistoryServer } from '@/features/orders/services/orders-server';
import { getPaymentMethodsServer, getPaymentForOrderServer } from '@/features/cart/services/cart-server';
import { getMyReviewsServer } from '@/features/engagement/services/engagement-server';
import { getMyOrderRefundRequestServer } from '@/features/refunds/services/refunds-server';
import { OrderDetail } from '@/features/orders/components/order-detail';
import { OrderNotFound } from '@/features/orders/components/order-not-found';

interface OrderDetailContentProps {
  orderNumber: string;
}

export async function OrderDetailContent({ orderNumber }: OrderDetailContentProps) {
  const [order, paymentMethods, orderStatusHistory, myReviews, refundRequest] = await Promise.all([
    getMyOrderServer(orderNumber),
    getPaymentMethodsServer(),
    getMyOrderStatusHistoryServer(orderNumber),
    getMyReviewsServer(),
    getMyOrderRefundRequestServer(orderNumber),
  ]);

  if (!order) {
    return <OrderNotFound />;
  }

  const payment = order.payment ?? (await getPaymentForOrderServer(order.id));
  const orderWithPayment = payment ? { ...order, payment } : order;

  const reviewedProductIds = myReviews.map((review) => review.product_id);

  return (
    <OrderDetail
      order={orderWithPayment}
      paymentMethods={paymentMethods ?? []}
      orderStatusHistory={orderStatusHistory}
      reviewedProductIds={reviewedProductIds}
      refundRequest={refundRequest}
    />
  );
}
