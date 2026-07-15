import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCartServer, getAddressesServer } from '@/features/cart/services/cart-server';
import { CartPageView } from '@/features/cart/components/cart-page-view';
import { Container } from '@/components/ui/container';
import { TranslatedBreadcrumb } from '@/components/ui/translated-breadcrumb';

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/cart');

  const cart = await getCartServer();


  return (
    <div className="py-10 lg:py-14">
      <Container>
        <TranslatedBreadcrumb
          className="mb-8"
          items={[
            { labelKey: 'nav.home', href: '/' },
            { labelKey: 'nav.cart' },
          ]}
        />
        <CartPageView cart={cart!} />
      </Container>
    </div>
  );
}
