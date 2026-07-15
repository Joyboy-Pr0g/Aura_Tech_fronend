'use client';

import { MyReviewsView } from '@/features/engagement/components/my-reviews-view';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function ReviewsPage() {
  const { t } = useLocale();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t('nav.reviews')}</h1>
      <MyReviewsView />
    </div>
  );
}
