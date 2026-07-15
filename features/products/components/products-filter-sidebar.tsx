'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Category } from '@/lib/types/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';
import { buildProductsHref } from '@/lib/products/search-params';

interface ProductsFilterSidebarProps {
  categories: Category[];
  brands: string[];
  maxPrice: number;
  className?: string;
}

export function ProductsFilterSidebar({
  categories,
  brands,
  maxPrice,
  className,
}: ProductsFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        router.push(buildProductsHref(searchParams, updates));
      });
    },
    [router, searchParams],
  );

  const clearFilters = () => {
    startTransition(() => {
      router.push('/products');
    });
  };

  const currentCategory = searchParams.get('category') ?? '';
  const currentSubCategory = searchParams.get('sub_category') ?? '';
  const parentFromSub = currentSubCategory
    ? categories.find((c) => c.children?.some((child) => child.slug === currentSubCategory))
    : undefined;
  const effectiveCategorySlug = currentCategory || parentFromSub?.slug || '';
  const subCategories =
    categories.find((c) => c.slug === effectiveCategorySlug)?.children ?? [];
  const currentBrand = searchParams.get('brand') ?? '';
  const minPrice = searchParams.get('min_price') ?? '';
  const maxPriceParam = searchParams.get('max_price') ?? '';
  const inStock = searchParams.get('in_stock') === 'true';

  return (
    <aside className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">{t('filters.category')}</h3>
        <select
          value={effectiveCategorySlug}
          onChange={(e) =>
            updateParams({
              category: e.target.value || null,
              sub_category: null,
            })
          }
          className="input-dark w-full"
        >
          <option value="">{t('filters.allCategories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        {effectiveCategorySlug && subCategories.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-white mb-3">{t('filters.subCategory')}</h3>
            <select
              value={currentSubCategory}
              onChange={(e) =>
                updateParams({
                  category: effectiveCategorySlug || null,
                  sub_category: e.target.value || null,
                })
              }
              className="input-dark w-full"
            >
              <option value="">{t('filters.allSubCategories')}</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">{t('filters.brand')}</h3>
          <select
            value={currentBrand}
            onChange={(e) => updateParams({ brand: e.target.value || null })}
            className="input-dark w-full"
          >
            <option value="">{t('filters.allBrands')}</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">{t('filters.priceRange')}</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t('filters.min')}
            min={0}
            value={minPrice}
            onChange={(e) => updateParams({ min_price: e.target.value || null })}
            className="bg-dark-900"
          />
          <Input
            type="number"
            placeholder={t('filters.max')}
            min={0}
            max={maxPrice}
            value={maxPriceParam}
            onChange={(e) => updateParams({ max_price: e.target.value || null })}
            className="bg-dark-900"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => updateParams({ in_stock: e.target.checked ? 'true' : null })}
          className="rounded border-white/20 bg-dark-800 text-primary-500 focus:ring-primary-500"
        />
        <span className="text-sm text-white/70">{t('filters.inStockOnly')}</span>
      </label>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={pending}
        onClick={clearFilters}
      >
        {t('filters.clear')}
      </Button>
    </aside>
  );
}
