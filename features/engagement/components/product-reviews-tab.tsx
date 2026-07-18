'use client';

import { Star } from 'lucide-react';
import { ProductReviewSummary } from '@/lib/types/entities';
import { ItemCarousel } from '@/components/ui/item-carousel';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ProductReviewsTabProps {
  reviews?: ProductReviewSummary[];
  averageRating?: number;
  ratingCount?: number;
}

function ReviewCard({ review }: { review: ProductReviewSummary }) {
  const { t } = useLocale();

  return (
    <article className="card-dark p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-white">{review.title}</p>
        {review.rating && (
          <span className="text-warning text-sm flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 fill-warning" />
            {review.rating.rating}
          </span>
        )}
      </div>
      <p className="text-sm text-white/60">{review.content}</p>
      <p className="text-xs text-white/40">
        {review.customer?.full_name ?? t('reviews.anonymous')} ·{' '}
        {new Date(review.created_at).toLocaleDateString()}
        {review.is_verified_purchase && (
          <span className="ms-2 text-success">{t('reviews.verified')}</span>
        )}
      </p>
    </article>
  );
}

export function ProductReviewsTab({
  reviews = [],
  averageRating = 0,
  ratingCount = 0,
}: ProductReviewsTabProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5',
                i < Math.round(averageRating) ? 'fill-warning text-warning' : 'text-white/20',
              )}
            />
          ))}
        </div>
        <span className="text-white font-medium">{averageRating.toFixed(1)}</span>
        <span className="text-white/40 text-sm">
          ({ratingCount} {t('reviews.ratings')})
        </span>
      </div>

      <ItemCarousel
        items={reviews}
        emptyMessage={t('reviews.none')}
        renderItem={(review) => <ReviewCard review={review} />}
      />
    </div>
  );
}
