'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Cart } from '@/lib/types/entities';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import { toast } from '@/components/ui/Toaster';
import { clearCart, editCartQuantity, removeCartItem } from '@/features/cart/services/cart-client';
import { Trash2, ShoppingCart, Minus, Plus } from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCartItemImageUrl } from '@/lib/cart/helpers';
import { CartItemVariantMeta } from '@/features/cart/components/cart-item-variant-meta';
import { ProductImage } from '@/components/ui/product-image';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CartPageViewProps {
  cart: Cart;
}

export function CartPageView({ cart: initialCart }: CartPageViewProps) {
  const router = useRouter();
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const items = initialCart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.price_at_time) * i.quantity, 0);

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId);
    toast(t('cart.itemRemoved'), 'info');
    router.refresh();
  };

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(itemId);
    try {
      await editCartQuantity(itemId, quantity);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('cart.updateFailed'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart();
      toast(t('cart.cleared'), 'info');
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('cart.clearFailed'), 'error');
    } finally {
      setClearing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card className="p-16 text-center">
        <ShoppingCart className="h-16 w-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">{t('cart.emptyTitle')}</h1>
        <p className="text-white/50 mb-6">{t('cart.emptyHint')}</p>
        <ButtonLink href="/products">{t('cart.continueShopping')}</ButtonLink>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-white">{t('cart.title')}</h1>
          <Button type="button" variant="outline" size="sm" disabled={clearing} onClick={handleClearCart}>
            {clearing ? t('common.loading') : t('cart.clearCart')}
          </Button>
        </div>
        {items.map((item) => {
          const imageUrl = getCartItemImageUrl(item);
          const isUpdating = updatingId === item.id;
          return (
          <Card key={item.id} className="p-4 flex gap-4">
            {imageUrl && (
              <Link href={`/products/${item.product.slug}`} className="relative h-20 w-20 shrink-0">
                <ProductImage
                  src={imageUrl}
                  alt={item.product.title ?? ''}
                  fill
                  className="rounded-lg bg-dark-800"
                />
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product?.slug ?? '#'}`}
                className="font-medium text-white hover:text-primary-400 truncate block"
              >
                {item.product?.title}
              </Link>
              <CartItemVariantMeta item={item} className="mt-1" />
              <p className="text-sm text-white/40 mt-1">
                {formatPrice(item.price_at_time)} {t('cart.each')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-white/50">{t('cart.qty')}:</span>
                <div className="flex items-center border border-white/10 rounded-lg">
                  <button
                    type="button"
                    disabled={isUpdating || item.quantity <= 1}
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="p-1.5 text-white/60 hover:text-white disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-sm text-white min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="p-1.5 text-white/60 hover:text-white disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-end flex flex-col justify-between">
              <p className="font-bold text-primary-400">
                {formatPrice(Number(item.price_at_time) * item.quantity)}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="text-danger/60 hover:text-danger self-end"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
          );
        })}
        <ButtonLink href="/products" variant="outline">{t('cart.continueShopping')}</ButtonLink>
      </div>

      <div>
        <Card className="p-6 sticky top-24 space-y-4">
          <h2 className="text-lg font-semibold text-white">{t('cart.orderSummary')}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>{t('cart.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>{t('cart.shipping')}</span>
              <span>{t('cart.shippingAtCheckout')}</span>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t border-white/10">
            <span className="font-semibold text-white">{t('order.total')}</span>
            <span className="text-xl font-bold text-primary-400">{formatPrice(subtotal)}</span>
          </div>
          <ButtonLink href="/checkout" className="w-full">{t('cart.checkout')}</ButtonLink>
        </Card>
      </div>
    </div>
  );
}
