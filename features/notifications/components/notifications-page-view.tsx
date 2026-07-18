'use client';

import { useLocale } from '@/lib/i18n/locale-provider';
import { NotificationsInbox } from '@/features/notifications/components/notifications-inbox';

interface NotificationsPageViewProps {
  audience?: 'customer' | 'admin';
}

export function NotificationsPageView({ audience = 'customer' }: NotificationsPageViewProps) {
  const { t } = useLocale();

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('notifications.title')}</h1>
        <p className="mt-1 text-sm text-white/50">
          {audience === 'admin' ? t('notifications.adminSubtitle') : t('notifications.subtitle')}
        </p>
      </div>
      <NotificationsInbox audience={audience} />
    </div>
  );
}
