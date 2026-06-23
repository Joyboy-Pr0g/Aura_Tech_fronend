import { getProductsServer } from '@/features/products/services/products-server';
import { ProductGrid } from '@/features/products/components/product-grid';

export async function ProductsContent() {
  const data = await getProductsServer({ limit: 50 });
  return <ProductGrid products={data?.items ?? []} />;
}
