'use client';

import { useLocale } from '@/lib/i18n/locale-provider';

export function OrderNotFound() {
  const { t } = useLocale();
  return <div className="p-8 text-white/50">{t('order.notFound')}</div>;
}
