'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ItemCarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function ItemCarousel<T>({
  items,
  renderItem,
  emptyMessage,
  className,
}: ItemCarouselProps<T>) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((current) => {
      if (items.length === 0) return 0;
      return Math.min(current, items.length - 1);
    });
  }, [items.length]);

  if (items.length === 0) {
    return emptyMessage ? (
      <p className="text-white/40 text-sm">{emptyMessage}</p>
    ) : null;
  }

  const canGoPrev = index > 0;
  const canGoNext = index < items.length - 1;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="min-h-[8rem]">{renderItem(items[index])}</div>

      {items.length > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={!canGoPrev}
            aria-label={t('common.previous')}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10',
              'text-white/70 transition-colors hover:border-white/20 hover:text-white',
              'disabled:opacity-30 disabled:pointer-events-none',
            )}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm text-white/50 tabular-nums">
            {index + 1} / {items.length}
          </span>

          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(items.length - 1, current + 1))}
            disabled={!canGoNext}
            aria-label={t('common.next')}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10',
              'text-white/70 transition-colors hover:border-white/20 hover:text-white',
              'disabled:opacity-30 disabled:pointer-events-none',
            )}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
