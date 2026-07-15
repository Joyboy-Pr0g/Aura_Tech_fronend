import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  max = 5,
  size = 'sm',
  showValue = false,
  className,
}: RatingStarsProps) {
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = rating >= i + 1;
        const partial = !filled && rating > i;
        return (
          <Star
            key={i}
            size={iconSize}
            className={cn(
              filled ? 'fill-warning text-warning' : partial ? 'fill-warning/50 text-warning' : 'text-white/20',
            )}
          />
        );
      })}
      {showValue && <span className="text-xs text-white/50 ms-1">{rating.toFixed(1)}</span>}
    </div>
  );
}
