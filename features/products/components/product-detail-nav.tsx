'use client';

import Link from 'next/link';
import { ArrowLeft, Box,ShapesIcon, Home } from 'lucide-react';
import { TranslatedBreadcrumb } from '@/components/ui/translated-breadcrumb';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ProductDetailNavProps {
  productTitle: string;
  category?: { name: string; slug: string };
  subCategory?: { name: string; slug: string };
  productSlug: string;
}

export function ProductDetailNav({ productTitle, category, subCategory, productSlug }: ProductDetailNavProps) {
  const { t } = useLocale();

  const breadcrumbItems = [
    { labelKey: 'nav.home', href: '/' ,icon: Home},
    { labelKey: 'nav.products', href: '/products' ,icon: Box},
  ];

  if (category) {
    breadcrumbItems.push({
      labelKey: category.name,
      href: `/products?category=${encodeURIComponent(category.slug)}`,
      icon: ShapesIcon,
    });
  }

  if (subCategory && category) {
    breadcrumbItems.push({
      labelKey: subCategory.name,
      href: `/products?category=${encodeURIComponent(category.slug)}&sub_category=${encodeURIComponent(subCategory.slug)}`,
      icon: ShapesIcon,
    });
  }

  breadcrumbItems.push({ labelKey: productTitle, href: `/products/${productSlug}`, icon: Box });

  return (
    <>
      <TranslatedBreadcrumb className="mb-6" items={breadcrumbItems} />
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-primary-400 mb-8 transition-colors lg:hidden"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('products.backToProducts')}
      </Link>
    </>
  );
}
