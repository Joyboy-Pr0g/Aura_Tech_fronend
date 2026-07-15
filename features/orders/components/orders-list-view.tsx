'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Order } from '@/lib/types/entities';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OrdersListViewProps {
  orders: Order[];
  total: number;
}

export function OrdersListView({ orders, total }: OrdersListViewProps) {
  const { t } = useLocale();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('orders.title')}</h2>
        <p className="text-white/40 mt-1">{t('orders.count', { count: total })}</p>
      </div>

      {orders.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <Package size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">{t('orders.empty')}</p>
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
                  {t('orders.itemsCount', { count: order.items?.length ?? 0 })}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-white">{formatCurrency(order.total)}</p>
                <span className={cn('text-xs font-medium', ORDER_STATUS_COLORS[order.status])}>
                  {t(`orderStatus.${order.status}`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
