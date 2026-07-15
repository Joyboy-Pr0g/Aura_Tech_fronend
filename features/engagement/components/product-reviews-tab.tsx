'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getProductReviews } from '@/features/engagement/services/engagement-client';
import { ProductReview } from '@/features/engagement/types';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface ProductReviewsTabProps {
  productId: string;
}

export function ProductReviewsTab({ productId }: ProductReviewsTabProps) {
  const { t } = useLocale();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = async (nextCursor?: string | null, append = false) => {
    setLoading(true);
    try {
      const data = await getProductReviews(productId, nextCursor ?? undefined);
      setReviews((prev) => (append ? [...prev, ...data.items] : data.items));
      setAverage(data.average_rating);
      setCount(data.rating_count);
      setCursor(data.next_cursor);
      setHasMore(data.has_more);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    setInitialLoad(true);
    setReviews([]);
    setCursor(null);
    void load(null, false);
  }, [productId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5',
                i < Math.round(average) ? 'fill-warning text-warning' : 'text-white/20',
              )}
            />
          ))}
        </div>
        <span className="text-white font-medium">{average.toFixed(1)}</span>
        <span className="text-white/40 text-sm">({count} {t('reviews.ratings')})</span>
      </div>

      {loading && initialLoad ? (
        <p className="text-white/40 text-sm">{t('common.loading')}</p>
      ) : reviews.length === 0 ? (
        <p className="text-white/40 text-sm">{t('reviews.none')}</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="card-dark p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-white">{review.title}</p>
                {review.rating && (
                  <span className="text-warning text-sm flex items-center gap-1">
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
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load(cursor, true)}
          disabled={loading}
        >
          {loading ? t('common.loading') : t('reviews.loadMore')}
        </Button>
      )}
    </div>
  );
}
