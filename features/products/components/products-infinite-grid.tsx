'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/lib/types/entities';
import { ProductCard } from '@/features/products/components/product-card';
import { Card } from '@/components/ui/card';
import { clientFetch } from '@/lib/api/client';
import { SortOption } from '@/features/products/components/products-grid';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getProducts } from '@/features/products/services/products-client';

interface ProductsInfiniteGridProps {
  initialProducts: Product[];
  initialCursor: string | null;
  initialHasMore: boolean;
  pageSize: number;
  sort: SortOption;
  fetchParams: Record<string, string | number | boolean | undefined>;
  isAuthenticated?: boolean;
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case 'price_asc':
      return list.sort((a, b) => Number(a.price) - Number(b.price));
    case 'price_desc':
      return list.sort((a, b) => Number(b.price) - Number(a.price));
    case 'newest':
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    default:
      return list;
  }
}

export function ProductsInfiniteGrid({
  initialProducts,
  initialCursor,
  initialHasMore,
  pageSize,
  sort,
  fetchParams,
  isAuthenticated = false,
}: ProductsInfiniteGridProps) {
  const { t } = useLocale();
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
  }, [initialProducts, initialCursor, initialHasMore, fetchParams]);

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);
    try {
      const page = await getProducts({
        ...fetchParams,
        cursor,
        limit: pageSize,
      });
      setProducts((prev) => [...prev, ...page.items]);
      setCursor(page.next_cursor ?? null);
      setHasMore(page.has_more);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursor, fetchParams, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  if (sorted.length === 0) {
    return (
      <Card className="p-12 text-center col-span-full">
        <p className="text-white/50">{t('products.noResults')}</p>
      </Card>
    );
  }

  return (
    <>
      {sorted.map((product) => (
        <ProductCard key={product.id} product={product} showWishlist isAuthenticated={isAuthenticated} />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-8">
          {loading && (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          )}
        </div>
      )}
    </>
  );
}
