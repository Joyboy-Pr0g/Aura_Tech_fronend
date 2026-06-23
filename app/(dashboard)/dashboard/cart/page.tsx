import { Suspense } from 'react';
import { CartContent } from '@/features/cart/components/cart-content';
import { CartSkeleton } from '@/features/cart/skeletons/cart-skeleton';

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartContent />
    </Suspense>
  );
}
