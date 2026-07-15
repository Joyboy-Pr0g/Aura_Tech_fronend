'use client';

import { WishlistView } from '@/features/engagement/components/wishlist-view';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function WishlistPage() {
  const { t } = useLocale();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t('nav.wishlist')}</h1>
      <WishlistView />
    </div>
  );
}
