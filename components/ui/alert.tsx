import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const variants = {
  error: {
    container: 'border-danger/30 bg-danger/10 text-danger',
    icon: AlertCircle,
  },
  success: {
    container: 'border-success/30 bg-success/10 text-success',
    icon: CheckCircle2,
  },
  info: {
    container: 'border-primary-500/30 bg-primary-500/10 text-primary-400',
    icon: Info,
  },
} as const;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

export function Alert({ className, variant = 'info', children, ...props }: AlertProps) {
  const { container, icon: Icon } = variants[variant];
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3 text-sm',
        container,
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
