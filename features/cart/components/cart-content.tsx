import { getCartServer, getAddressesServer } from '@/features/cart/services/cart-server';
import { CartView } from '@/features/cart/components/cart-view';

export async function CartContent() {
  const [cart, addresses] = await Promise.all([
    getCartServer(),
    getAddressesServer(),
  ]);

  return <CartView cart={cart!} addresses={addresses ?? []} />;
}
