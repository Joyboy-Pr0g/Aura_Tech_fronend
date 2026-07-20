import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const variants = {
  primary:
    'bg-primary-500 text-dark-950 hover:bg-primary-400 active:bg-primary-600 shadow-lg shadow-primary-500/20',
  outline:
    'border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-primary-500/40',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-danger text-white hover:bg-red-500',
  link: 'text-primary-400 underline-offset-4 hover:underline p-0 h-auto',
} as const;

const sizes = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'h-10 w-10',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function ButtonLink({ href, className, variant = 'primary', size = 'md', ...props }: ButtonLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onMouseEnter={() => {
        if (typeof href === 'string') {
          console.log("hover");
          router.prefetch(href);
        }
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
