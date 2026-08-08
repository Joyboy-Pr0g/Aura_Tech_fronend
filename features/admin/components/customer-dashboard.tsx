'use client';

import Link from 'next/link';
import { User } from '@/lib/types/entities';
import { Package, ShoppingCart, MapPin } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CustomerDashboardProps {
  user: User;
}

export function CustomerDashboard({ user }: CustomerDashboardProps) {
  const { t } = useLocale();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('dashboard.welcome')}</h2>
        <p className="text-white/50 mt-1">{user.full_name || user.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/orders" className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
          <Package size={28} className="text-primary-500 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{t('dashboard.orders')}</h3>
          <p className="text-sm text-white/40 mt-1">{t('dashboard.ordersHint')}</p>
        </Link>

        <Link href="/cart" className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
          <ShoppingCart size={28} className="text-primary-500 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{t('dashboard.cart')}</h3>
          <p className="text-sm text-white/40 mt-1">{t('dashboard.cartHint')}</p>
        </Link>

        <Link href="/dashboard/addresses" className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
          <MapPin size={28} className="text-primary-500 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{t('dashboard.addresses')}</h3>
          <p className="text-sm text-white/40 mt-1">{t('dashboard.addressesHint')}</p>
        </Link>
      </div>
    </div>
  );
}
