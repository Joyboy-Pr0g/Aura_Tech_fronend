import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border bg-dark-900/80 px-4 py-2 text-sm text-white',
        'placeholder:text-white/30 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
        error
          ? 'border-danger/50 focus-visible:border-danger'
          : 'border-white/10 focus-visible:border-primary-500/50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
