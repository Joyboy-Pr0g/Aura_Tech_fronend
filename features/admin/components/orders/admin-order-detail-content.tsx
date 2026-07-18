import { getAdminOrderServer, getAdminOrderStatusHistoryServer } from '@/features/admin/services/admin-orders-server';
import { getAdminPaymentByOrderServer } from '@/features/admin/services/admin-payments-server';
import { OrderDetail } from '@/features/orders/components/order-detail';
import { OrderNotFound } from '@/features/orders/components/order-not-found';
import { TranslatedBreadcrumb } from '@/components/ui/translated-breadcrumb';

interface AdminOrderDetailContentProps {
  id: string;
}

export async function AdminOrderDetailContent({ id }: AdminOrderDetailContentProps) {
  const [order, orderStatusHistory] = await Promise.all([
    getAdminOrderServer(id),
    getAdminOrderStatusHistoryServer(id),
  ]);

  if (!order) {
    return <OrderNotFound backHref="/admin/orders" />;
  }

  const payment = order.payment ?? (await getAdminPaymentByOrderServer(order.id));
  const orderWithPayment = payment ? { ...order, payment } : order;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <TranslatedBreadcrumb
        items={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.allOrders', href: '/admin/orders' },
          { rawLabel: order.order_number },
        ]}
      />
      <OrderDetail order={orderWithPayment} variant="admin" orderStatusHistory={orderStatusHistory} />
    </div>
  );
}
