'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AppNotification } from '@/lib/types/entities';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  getMyNotifications,
  isNotificationUnread,
  markNotificationRead,
  NOTIFICATIONS_REFRESH_EVENT,
} from '@/features/notifications/services/notifications-client';

function formatWhen(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function notificationHref(notification: AppNotification, audience: 'customer' | 'admin'): string | null {
  if (audience === 'admin') {
    if (notification.notification_type === 'staff_payment_submitted') {
      return '/admin/payments';
    }
    if (notification.notification_type === 'staff_refund_request') {
      return '/admin/refunds';
    }
    if (notification.related_order_id) {
      return `/admin/orders/${notification.related_order_id}`;
    }
    return null;
  }
  if (notification.related_order_number) {
    return `/dashboard/orders/${encodeURIComponent(notification.related_order_number)}`;
  }
  if (notification.related_product_slug) {
    return `/products/${encodeURIComponent(notification.related_product_slug)}`;
  }
  return null;
}

interface NotificationsInboxProps {
  compact?: boolean;
  onNavigate?: () => void;
  audience?: 'customer' | 'admin';
}

export function NotificationsInbox({ compact = false, onNavigate, audience = 'customer' }: NotificationsInboxProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyNotifications();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('notifications.loadFailed'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onRefresh = () => void load();
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
  }, [load]);

  const handleOpen = async (notification: AppNotification) => {
    const href = notificationHref(notification, audience);
    if (isNotificationUnread(notification)) {
      try {
        await markNotificationRead(notification.id);
        setItems((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
      } catch {
        // still navigate if link exists
      }
    }
    onNavigate?.();
    if (href) router.push(href);
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center text-white/40', compact ? 'py-8' : 'py-16')}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center text-sm text-danger', compact ? 'px-4 py-6' : 'py-12')}>
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('text-center text-white/40', compact ? 'px-4 py-8' : 'py-16')}>
        <Bell className="mx-auto mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm">{t('notifications.empty')}</p>
      </div>
    );
  }

  const list = (
    <ul className={cn('divide-y divide-white/5', !compact && 'rounded-xl border border-white/10 bg-dark-900/50')}>
      {items.map((notification) => {
        const unread = isNotificationUnread(notification);
        const href = notificationHref(notification, audience);
        const content = (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-sm font-medium', unread ? 'text-white' : 'text-white/70')}>
                {notification.title}
              </p>
              {unread && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-400" aria-hidden />
              )}
            </div>
            <p className="mt-1 text-xs text-white/50 line-clamp-2">{notification.message}</p>
            <p className="mt-2 text-[11px] text-white/30">{formatWhen(notification.created_at, locale)}</p>
          </>
        );

        return (
          <li key={notification.id}>
            {href ? (
              <button
                type="button"
                onClick={() => void handleOpen(notification)}
                className={cn(
                  'block w-full text-start px-4 py-3 transition-colors hover:bg-white/5',
                  unread && 'bg-primary-500/5',
                )}
              >
                {content}
              </button>
            ) : (
              <div className={cn('px-4 py-3', unread && 'bg-primary-500/5')}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  if (compact) {
    return (
      <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
        {list}
        <div className="border-t border-white/5 p-2">
          <Link
            href={audience === 'admin' ? '/admin/notifications' : '/dashboard/notifications'}
            onClick={onNavigate}
            className="block rounded-lg px-3 py-2 text-center text-xs text-primary-400 hover:bg-white/5"
          >
            {t('notifications.viewAll')}
          </Link>
        </div>
      </div>
    );
  }

  return list;
}
