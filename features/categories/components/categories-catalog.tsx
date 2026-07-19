'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, Layers } from 'lucide-react';
import { Category } from '@/lib/types/entities';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { useLocale } from '@/lib/i18n/locale-provider';
import { buildCategoryProductsPath } from '@/lib/storefront/product-paths';
import { cn } from '@/lib/utils/cn';

interface CategoriesCatalogProps {
  categories: Category[];
}

function getRootCategories(categories: Category[]): Category[] {
  return categories.filter((category) => !category.parent_category_id);
}

export function CategoriesCatalog({ categories }: CategoriesCatalogProps) {
  const { t } = useLocale();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const roots = useMemo(() => getRootCategories(categories), [categories]);

  if (roots.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-dark-900/60 px-6 py-10 text-center text-sm text-white/50">
        {t('categories.empty')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roots.map((category) => {
        const children = category.children ?? [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedId === category.id;
        const parentHref = buildCategoryProductsPath(category.slug, null, category.id);

        return (
          <Card key={category.id} className="flex h-full flex-col overflow-hidden border-white/10">
            <Link
              href={parentHref}
              className="group block transition-colors hover:bg-white/[0.03]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-dark-800">
                {category.image_url ? (
                  <ProductImage
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Layers className="h-10 w-10 text-primary-400/40" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="line-clamp-2 text-base font-semibold text-white transition-colors group-hover:text-primary-400 sm:text-lg">
                  {category.name}
                </h2>
                {category.description ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/50">
                    {category.description}
                  </p>
                ) : null}
                <span className="mt-2 inline-flex text-xs font-medium text-primary-400">
                  {t('categories.viewProducts')}
                </span>
              </div>
            </Link>

            {hasChildren ? (
              <>
                <div className="mt-auto border-t border-white/5 px-3 py-2 sm:px-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-full justify-between px-2 text-white/70 hover:text-white"
                    aria-expanded={isExpanded}
                    aria-label={t('categories.toggleSubcategories', { name: category.name })}
                    onClick={() => setExpandedId(isExpanded ? null : category.id)}
                  >
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {t('categories.subcategories')}
                    </span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform duration-300', isExpanded && 'rotate-180')}
                    />
                  </Button>
                </div>

                {isExpanded ? (
                  <div className="border-t border-white/5 bg-dark-950/40 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                    <div className="space-y-2">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={buildCategoryProductsPath(category.slug, child.slug, category.id)}
                          className="group flex items-center gap-3 rounded-xl border border-white/5 bg-dark-900/50 p-2.5 transition-colors hover:border-primary-500/30 hover:bg-primary-500/5"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-dark-800">
                            {child.image_url ? (
                              <ProductImage
                                src={child.image_url}
                                alt={child.name}
                                fill
                                className="transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Layers className="h-4 w-4 text-primary-400/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-medium text-white group-hover:text-primary-400">
                              {child.name}
                            </h3>
                          </div>
                          <ChevronLeft className="h-4 w-4 shrink-0 text-white/25 rtl:rotate-180 group-hover:text-primary-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

export function CategoriesPageHeader() {
  const { t } = useLocale();

  return (
    <div className="mb-10 max-w-3xl">
      <Badge variant="secondary" className="mb-3">
        {t('categories.badge')}
      </Badge>
      <h1 className="text-3xl font-bold text-white lg:text-4xl">{t('categories.title')}</h1>
      <p className="mt-3 text-base leading-relaxed text-white/50">{t('categories.subtitle')}</p>
    </div>
  );
}

export function CategoriesPageShell({ categories }: CategoriesCatalogProps) {
  return (
    <Container>
      <CategoriesPageHeader />
      <CategoriesCatalog categories={categories} />
    </Container>
  );
}
