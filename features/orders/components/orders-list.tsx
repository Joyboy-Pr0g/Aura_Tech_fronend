import Link from 'next/link';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getMyOrdersServer } from '@/features/orders/services/orders-server';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils/format';

export async function OrdersList() {
  const data = await getMyOrdersServer();
  const orders = data.orders ?? [];
  const total = data.total ?? 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Orders</h2>
        <p className="text-white/40 mt-1">{total} order{total !== 1 ? 's' : ''} total</p>
      </div>

      {orders.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <Package size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="card-dark p-5 flex items-center justify-between hover:border-primary-500/30 transition-colors group"
            >
              <div className="space-y-1">
                <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                  {order.order_number}
                </p>
                <p className="text-sm text-white/40">{formatDateTime(order.created_at)}</p>
                <p className="text-xs text-white/30">
                  {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-white">{formatCurrency(order.total)}</p>
                <span className={cn('text-xs font-medium', ORDER_STATUS_COLORS[order.status])}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
