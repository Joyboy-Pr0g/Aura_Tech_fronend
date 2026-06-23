import { Suspense } from 'react';
import { ProductsContent } from '@/features/products/components/products-content';
import { ProductGridSkeleton } from '@/features/products/skeletons/product-grid-skeleton';

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
