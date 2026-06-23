import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
  default: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  secondary: 'bg-white/5 text-white/70 border-white/10',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  outline: 'bg-transparent text-white/60 border-white/20',
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
