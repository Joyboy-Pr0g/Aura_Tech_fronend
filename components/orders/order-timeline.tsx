'use client';

import { OrderStatusHistoryEntry } from '@/features/engagement/types';
import { ORDER_STATUS_COLORS, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OrderTimelineProps {
  history: OrderStatusHistoryEntry[];
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  const { t } = useLocale();

  if (history.length === 0) {
    return (
      <div className="card-dark p-5">
        <h3 className="font-semibold text-white mb-2">{t('order.timeline')}</h3>
        <p className="text-sm text-white/40">{t('order.noTimeline')}</p>
      </div>
    );
  }

  return (
    <div className="card-dark p-5">
      <h3 className="font-semibold text-white mb-4">{t('order.timeline')}</h3>
      <ol className="relative border-s border-white/10 ms-3 space-y-6">
        {history.map((entry, index) => {
          const isLast = index === history.length - 1;
          return (
            <li key={entry.id} className="ms-6">
              <span
                className={cn(
                  'absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-dark-900',
                  isLast ? 'bg-primary-500 text-dark-950' : 'bg-dark-700 text-white/60',
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className={cn('text-sm font-medium', ORDER_STATUS_COLORS[entry.new_status as keyof typeof ORDER_STATUS_COLORS] ?? 'text-white')}>
                  {t(`orderStatus.${entry.new_status}`)}
                </p>
                <time className="text-xs text-white/40">{formatDateTime(entry.created_at)}</time>
              </div>
              {(entry.notes || entry.change_reason) && (
                <p className="text-xs text-white/50 mt-1">
                  {entry.notes ?? entry.change_reason}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
