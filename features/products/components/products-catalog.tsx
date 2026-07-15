'use client';

import { Suspense, useState } from 'react';
import { Product, Category, ProductBrand } from '@/lib/types/entities';
import { ProductsFilterSidebar } from '@/features/products/components/products-filter-sidebar';
import { SortOption } from '@/features/products/components/products-grid';
import { ProductsInfiniteGrid } from '@/features/products/components/products-infinite-grid';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Filter } from 'lucide-react';

interface ProductsCatalogProps {
  products: Product[];
  hasMore: boolean;
  nextCursor: string | null;
  categories: Category[];
  brands: ProductBrand[];
  maxPrice: number;
  searchQuery?: string;
  fetchParams: Record<string, string | number | boolean | undefined>;
  pageSize: number;
  isAuthenticated?: boolean;
}

export function ProductsCatalog({
  products,
  hasMore,
  nextCursor,
  categories,
  brands,
  maxPrice,
  searchQuery,
  fetchParams,
  pageSize,
  isAuthenticated,
}: ProductsCatalogProps) {
  const { t } = useLocale();
  const [sort, setSort] = useState<SortOption>('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: t('products.sort.relevance') },
    { value: 'price_asc', label: t('products.sort.priceAsc') },
    { value: 'price_desc', label: t('products.sort.priceDesc') },
    { value: 'newest', label: t('products.sort.newest') },
  ];

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mb-10 space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">{t('products.catalog')}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">{t('products.title')}</h1>
            <p className="text-white/50 mt-2">
              {t('products.title').toLowerCase()}
              {searchQuery && ` — "${searchQuery}"`}
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-64 shrink-0 mt-12">
            <div className="sticky top-24 card-dark p-5">
              <Suspense fallback={<p className="text-white/40 text-sm">{t('common.loading')}</p>}>
                <ProductsFilterSidebar categories={categories} brands={brands.map(brand => brand.brand)} maxPrice={maxPrice} />
              </Suspense>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                type="button"
                className="lg:hidden flex items-center gap-2 text-sm text-white/70 border border-white/10 rounded-lg px-3 py-2"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Filter className="h-4 w-4" /> {t('products.filters')}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="input-dark ms-auto w-auto min-w-[180px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {filtersOpen && (
              <div className="lg:hidden card-dark p-5 mb-6">
                <Suspense fallback={null}>
                  <ProductsFilterSidebar categories={categories} brands={brands.map(brand => brand.brand)} maxPrice={maxPrice} />
                </Suspense>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <ProductsInfiniteGrid
                initialProducts={products}
                initialCursor={nextCursor}
                initialHasMore={hasMore}
                pageSize={pageSize}
                sort={sort}
                fetchParams={fetchParams}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
