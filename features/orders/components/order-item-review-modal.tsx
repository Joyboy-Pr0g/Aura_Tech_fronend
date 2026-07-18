'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { OrderItem } from '@/lib/types/entities';
import { createReview } from '@/features/engagement/services/engagement-client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { toast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils/cn';

interface OrderItemReviewModalProps {
  item: OrderItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (productId: string) => void;
}

export function OrderItemReviewModal({
  item,
  open,
  onOpenChange,
  onSubmitted,
}: OrderItemReviewModalProps) {
  const { t } = useLocale();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setTitle('');
    setContent('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item?.product_id) return;
    if (rating < 1) {
      toast(t('order.reviewRatingRequired'), 'error');
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast(t('order.reviewFieldsRequired'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const review = await createReview({
        product_id: item.product_id,
        order_item_id: item.id,
        rating,
        title: title.trim(),
        content: content.trim(),
      });
      toast(
        review.moderation_status === 'pending'
          ? t('order.reviewSubmittedModeration')
          : t('order.reviewSubmitted'),
        review.moderation_status === 'pending' ? 'info' : 'success',
      );
      onSubmitted(item.product_id);
      handleOpenChange(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('order.reviewFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent size="sm">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>{t('order.reviewProduct')}</ModalTitle>
            <p className="text-sm text-white/50">{item?.product?.title}</p>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div>
              <p className="text-sm text-white/60 mb-2">{t('order.reviewRating')}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                    aria-label={`${value} ${t('reviews.ratings')}`}
                  >
                    <Star
                      size={24}
                      className={cn(
                        'transition-colors',
                        value <= displayRating
                          ? 'fill-warning text-warning'
                          : 'text-white/20',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-1.5 block">{t('order.reviewTitle')}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="input-dark w-full"
                placeholder={t('order.reviewTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm text-white/60 mb-1.5 block">{t('order.reviewContent')}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={2000}
                className="input-dark w-full resize-none"
                placeholder={t('order.reviewContentPlaceholder')}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="btn-ghost"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('order.submitReview')}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
