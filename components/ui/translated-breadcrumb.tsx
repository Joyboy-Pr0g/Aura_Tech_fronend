'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { LucideIcon } from 'lucide-react';

export interface TranslatedBreadcrumbItem {
  /** Translation key, or omit when using rawLabel */
  labelKey?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  /** Dynamic label that should not be translated (e.g. product title) */
  rawLabel?: string;
  href?: string;
}

interface TranslatedBreadcrumbProps {
  items: TranslatedBreadcrumbItem[];
  className?: string;
}

export function TranslatedBreadcrumb({ items, className }: TranslatedBreadcrumbProps) {
  const { t } = useLocale();

  return (
    <Breadcrumb
      className={className}
      items={items.map((item) => ({
        label: item.rawLabel ?? (item.labelKey ? t(item.labelKey) : ''),
        href: item.href,
        icon: item.icon,
        iconClassName: item.iconClassName,
      }))}
    />
  );
}
