'use client';

import { Product } from '@/lib/types/entities';
import { ProductCard } from '@/features/products/components/product-card';
import { Card } from '@/components/ui/card';
import { useMemo } from 'react';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

interface ProductsGridProps {
  products: Product[];
  sort: SortOption;
}

export function ProductsGrid({ products, sort }: ProductsGridProps) {
  const sorted = useMemo(() => {
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
  }, [products, sort]);

  if (sorted.length === 0) {
    return (
      <Card className="p-12 text-center col-span-full">
        <p className="text-white/50">No products match your search. Try adjusting filters.</p>
      </Card>
    );
  }

  return (
    <>
      {sorted.map((product) => (
        <ProductCard key={product.id} product={product} showWishlist />
      ))}
    </>
  );
}

export type { SortOption };
