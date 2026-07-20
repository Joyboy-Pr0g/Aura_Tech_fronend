'use client';

import { useRouter } from 'next/navigation';
import { Cart, CustomerAddress } from '@/lib/types/entities';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import { toast } from '@/components/ui/Toaster';
import { removeCartItem } from '@/features/cart/services/cart-client';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { ProductImage } from '@/components/ui/product-image';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CartViewProps {
  cart: Cart;
  addresses: CustomerAddress[];
}

export function CartView({ cart: initialCart, addresses }: CartViewProps) {
  const router = useRouter();
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const cart = initialCart;
  const [selectedAddr, setSelectedAddr] = useState(
    addresses.find((a) => a.is_default)?.id ?? '',
  );
  const [notes, setNotes] = useState('');

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId);
    toast(t('cart.itemRemoved'), 'info');
    router.refresh();
  };

  const handleCheckout = () => {
    if (!cart?.items?.length) return;
    router.push('/checkout');
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.price_at_time) * i.quantity, 0);

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-white">{t('cart.yourCart')}</h2>

      {items.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <ShoppingCart size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">{t('cart.emptyShort')}</p>
        </div>
      ) : (
        <>
          <div className="card-dark divide-y divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                {item.product?.images?.[0]?.url && (
                  <ProductImage
                    src={item.product.images[0].url}
                    alt={item.product.title ?? ''}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-lg bg-dark-800"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{item.product?.title ?? t('reviews.product')}</p>
                  <p className="text-sm text-white/40">{t('cart.qty')}: {item.quantity} × {formatPrice(item.price_at_time)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{formatPrice(Number(item.price_at_time) * item.quantity)}</p>
                  <button onClick={() => handleRemove(item.id)} className="text-danger/60 hover:text-danger mt-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card-dark p-5 space-y-4">
            {addresses.length > 0 && (
              <div>
                <label className="label-dark">{t('checkout.shippingAddress')}</label>
                <select
                  value={selectedAddr}
                  onChange={(e) => setSelectedAddr(e.target.value)}
                  className="input-dark"
                >
                  <option value="">{t('checkout.selectAddress')}</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {a.city}, {a.governorate}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label-dark">{t('checkout.notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-dark resize-none h-20"
                placeholder={t('checkout.notesPlaceholder')}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="text-white/50 text-sm">{t('cart.subtotal')}</span>
                <p className="text-xl font-bold text-white">{formatPrice(subtotal)}</p>
              </div>
              <button onClick={handleCheckout} className="btn-primary">
                {t('checkout.placeOrder')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
