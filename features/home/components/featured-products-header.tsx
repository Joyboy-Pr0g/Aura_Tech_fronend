'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/lib/i18n/locale-provider';

export function FeaturedProductsHeader() {
  const { t } = useLocale();

  return (
    <div className="flex items-end justify-between gap-4 mb-10">
      <div>
        <Badge variant="secondary" className="mb-3">{t('home.featuredBadge')}</Badge>
        <h2 className="text-3xl font-bold text-white">{t('home.trending')}</h2>
        <p className="text-white/50 mt-2">{t('home.featuredDesc')}</p>
      </div>
      <Link
        href="/products"
        className="hidden sm:flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
      >
        {t('home.viewAll')}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </div>
  );
}
