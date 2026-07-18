'use client';

import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

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
  const { t } = useLocale();

  if (!items.length) return null;

  return (
    <nav aria-label={t('common.breadcrumb')} className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-white/30 rtl:rotate-180 shrink-0"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors truncate max-w-[200px] sm:max-w-none"
                >
                  {item.icon && (
                    <item.icon className={cn('h-3.5 w-3.5 shrink-0', item.iconClassName)} aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none',
                    isLast ? 'text-white font-medium' : 'text-white/50',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && (
                    <item.icon className={cn('h-3.5 w-3.5 shrink-0', item.iconClassName)} aria-hidden="true" />
                  )}
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
