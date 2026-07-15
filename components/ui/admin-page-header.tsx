'use client';

import { ReactNode } from 'react';
import { TranslatedBreadcrumb, TranslatedBreadcrumbItem } from '@/components/ui/translated-breadcrumb';
import { cn } from '@/lib/utils/cn';

interface AdminPageHeaderProps {
  breadcrumbItems: TranslatedBreadcrumbItem[];
  title: string;
  countLabel: string;
  filters?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  breadcrumbItems,
  title,
  countLabel,
  filters,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
          <span className="text-sm text-white/40" aria-label={countLabel}>
            <span className="text-white/20 mx-1 hidden sm:inline" aria-hidden>
              ·
            </span>
            {countLabel}
          </span>
        </div>

        <TranslatedBreadcrumb items={breadcrumbItems} />
      </div>

      {filters ? (
        <div className="rounded-2xl border border-white/10 bg-dark-900/40 p-4 sm:p-5 space-y-3">
          {filters}
        </div>
      ) : null}
    </header>
  );
}
