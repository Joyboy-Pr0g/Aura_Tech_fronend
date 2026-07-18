'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OrderNotFoundProps {
  backHref?: string;
}

export function OrderNotFound({ backHref }: OrderNotFoundProps) {
  const { t } = useLocale();
  return (
    <div className="p-8 space-y-4">
      <p className="text-white/50">{t('order.notFound')}</p>
      {backHref && (
        <Link href={backHref} className="text-primary-400 hover:text-primary-300 text-sm">
          {t('admin.backToOrders')}
        </Link>
      )}
    </div>
  );
}
