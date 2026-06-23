import { cn } from '@/lib/utils/cn';

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn('h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent', className)}
      {...props}
    />
  );
}
