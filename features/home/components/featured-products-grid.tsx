'use client';

import { Product } from '@/lib/types/entities';
import { ProductCard } from '@/features/products/components/product-card';
import { StaggerItem } from '@/lib/motion/reveal';

interface FeaturedProductsGridProps {
  products: Product[];
}

export function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </div>
  );
}
