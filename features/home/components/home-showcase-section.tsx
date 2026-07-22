import { Category, Product } from '@/lib/types/entities';
import { getCategoriesServer } from '@/features/categories/services/categories-server';
import { getTrendingProductsServer } from '@/features/products/services/products-server';
import { HomeShowcaseContent } from '@/features/home/components/home-showcase-content';

export async function HomeShowcaseSection() {
  const [categories, products] = await Promise.all([
    getCategoriesServer(),
    getTrendingProductsServer(12),
  ]);

  if (categories.length === 0 && products.length === 0) return null;

  return <HomeShowcaseContent categories={categories} products={products} />;
}
