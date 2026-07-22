'use client';

import { Category, Product } from '@/lib/types/entities';
import { CategoriesOrbit3D } from '@/features/home/components/categories-orbit-3d';
import { TrendingCarousel3D } from '@/features/home/components/trending-carousel-3d';

interface HomeShowcaseContentProps {
  categories: Category[];
  products: Product[];
}

export function HomeShowcaseContent({ categories, products }: HomeShowcaseContentProps) {
  return (
    <>
      {categories.length > 0 && <CategoriesOrbit3D categories={categories} />}
      {products.length > 0 && <TrendingCarousel3D products={products} />}
    </>
  );
}
