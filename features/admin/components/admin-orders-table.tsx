'use client';

import { useEffect, useState, useTransition } from 'react';
import { Order, OrderStatus } from '@/lib/types/entities';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { getAllOrders, updateOrderStatus } from '@/features/orders/services/orders-client';
import { useLocale } from '@/lib/i18n/locale-provider';

const ORDER_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_confirmed',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const NEXT_STATUSES: Record<string, OrderStatus[]> = {
  pending_payment: ['cancelled'],
  payment_confirmed: ['processing', 'cancelled'],
  processing: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export function AdminOrdersTable() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = (status?: string) => {
    startTransition(async () => {
      const data = await getAllOrders({ status: status || undefined, limit: 50 });
      setOrders(data.items);
      setTotal(data.items.length);
    });
  };

  useEffect(() => {
    load(filterStatus);
  }, [filterStatus]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast(t('admin.orderMoved', { status: t(`orderStatus.${newStatus}`) }), 'success');
      load(filterStatus);
    } catch {
      toast(t('admin.statusFailed'), 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.allOrders')}</h2>
          <p className="text-white/40 mt-1">{t('admin.ordersCount', { count: total })}</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-dark w-auto min-w-[180px]"
        >
          <option value="">{t('admin.allStatuses')}</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{t(`orderStatus.${status}`)}</option>
          ))}
        </select>
      </div>

      <div className={cn('space-y-3 transition-opacity', isPending && 'opacity-60')}>
        {orders.map((order) => {
          const nextOptions = NEXT_STATUSES[order.status] ?? [];
          return (
            <div key={order.id} className="card-dark p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <p className="font-semibold text-white">{order.order_number}</p>
                <p className="text-sm text-white/40">
                  {order.customer?.email ?? order.customer_id.slice(0, 8)} · {formatDateTime(order.created_at)}
                </p>
                <p className={cn('text-xs font-medium', ORDER_STATUS_COLORS[order.status])}>
                  {t(`orderStatus.${order.status}`)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="font-bold text-white">{formatCurrency(order.total)}</p>

                {nextOptions.length > 0 && (
                  <select
                    disabled={updating === order.id}
                    defaultValue=""
                    onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="input-dark w-auto text-sm py-1.5"
                  >
                    <option value="" disabled>{t('admin.moveTo')}</option>
                    {nextOptions.map((s) => (
                      <option key={s} value={s}>{t(`orderStatus.${s}`)}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
