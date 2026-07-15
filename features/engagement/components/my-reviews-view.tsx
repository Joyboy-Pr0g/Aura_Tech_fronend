'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getMyReviews } from '@/features/engagement/services/engagement-client';
import { ProductReview } from '@/features/engagement/types';
import { Card } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';

export function MyReviewsView() {
  const { t } = useLocale();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-white/40">{t('common.loading')}</p>;
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Star className="h-12 w-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 mb-4">{t('reviews.myEmpty')}</p>
        <ButtonLink href="/dashboard/orders">{t('nav.orders')}</ButtonLink>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="card-dark p-5 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">
                {review.product?.title ?? t('reviews.product')}
              </p>
              <p className="text-sm text-white/60 mt-1">{review.title}</p>
            </div>
            {review.rating && (
              <span className="flex items-center gap-1 text-warning shrink-0">
                <Star className="h-4 w-4 fill-warning" />
                {review.rating.rating}
              </span>
            )}
          </div>
          <p className="text-sm text-white/50">{review.content}</p>
          <p className="text-xs text-white/40">
            {new Date(review.created_at).toLocaleDateString()} · {review.moderation_status}
          </p>
        </li>
      ))}
    </ul>
  );
}
