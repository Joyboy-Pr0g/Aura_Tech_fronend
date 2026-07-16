import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCartServer, getAddressesServer, getPaymentMethodsServer } from '@/features/cart/services/cart-server';
import { getShippingFeesServer } from '@/features/shipping/services/shipping-server';
import { CheckoutView } from '@/features/checkout/components/checkout-view';
import { Container } from '@/components/ui/container';
import { TranslatedBreadcrumb } from '@/components/ui/translated-breadcrumb';

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/checkout');

  const [cart, addresses, shippingFees, paymentMethods] = await Promise.all([
    getCartServer(),
    getAddressesServer(),
    getShippingFeesServer().catch(() => []),
    getPaymentMethodsServer().catch(() => []),
  ]);

  if (!cart?.items?.length) redirect('/cart');

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <TranslatedBreadcrumb
          className="mb-8"
          items={[
            { labelKey: 'nav.home', href: '/' },
            { labelKey: 'nav.cart', href: '/cart' },
            { labelKey: 'nav.checkout' },
          ]}
        />
        <CheckoutView
          cart={cart}
          addresses={addresses ?? []}
          shippingFees={shippingFees ?? []}
          paymentMethods={paymentMethods ?? []}
        />
      </Container>
    </div>
  );
}
