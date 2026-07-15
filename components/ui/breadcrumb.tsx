import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  iconClassName?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-white/30 rtl:rotate-180 shrink-0"
                  aria-hidden
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-primary-400 transition-colors min-w-0"
                >
                  {item.icon ? (
                    <item.icon
                      className={cn('h-3.5 w-3.5 shrink-0', item.iconClassName ?? 'text-white/50')}
                      aria-hidden
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 min-w-0 truncate',
                    isLast ? 'text-white/80 font-medium' : 'text-white/50',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon ? (
                    <item.icon
                      className={cn('h-3.5 w-3.5 shrink-0', item.iconClassName ?? 'text-white/50')}
                      aria-hidden
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
