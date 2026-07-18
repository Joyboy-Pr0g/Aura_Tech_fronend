'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { NotificationsInbox } from '@/features/notifications/components/notifications-inbox';
import {
  getMyNotifications,
  isNotificationUnread,
  NOTIFICATIONS_REFRESH_EVENT,
} from '@/features/notifications/services/notifications-client';

export function NotificationBell({ audience = 'customer' }: { audience?: 'customer' | 'admin' }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const items = await getMyNotifications();
      setUnreadCount(items.filter(isNotificationUnread).length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    const onRefresh = () => void refreshCount();
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
  }, [refreshCount]);

  useEffect(() => {
    if (open) void refreshCount();
  }, [open, refreshCount]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white/70 hover:text-primary-400"
          aria-label={t('notifications.title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-dark-900 border-white/10 overflow-hidden"
      >
        <div className="border-b border-white/5 px-4 py-3">
          <p className="text-sm font-semibold text-white">{t('notifications.title')}</p>
        </div>
        <NotificationsInbox compact onNavigate={() => setOpen(false)} audience={audience} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
