'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartUiStore } from '@/lib/stores/cart-ui-store';
import { getCart, removeCartItem } from '@/features/cart/services/cart-client';
import { Cart } from '@/lib/types/entities';
import { formatCurrency } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getCartItemImageUrl } from '@/lib/cart/helpers';
import { CartItemVariantMeta } from '@/features/cart/components/cart-item-variant-meta';
import { ProductImage } from '@/components/ui/product-image';
import { toast } from '@/components/ui/Toaster';

export function CartPanel() {
  const { isPanelOpen, closePanel, setItemCount } = useCartUiStore();
  const { t } = useLocale();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPanelOpen) return;
    setLoading(true);
    getCart()
      .then((c) => {
        setCart(c);
        setItemCount(c.items?.length ?? 0);
      })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [isPanelOpen, setItemCount]);

  const recentItems = cart?.items?.slice(0, 3) ?? [];
  const subtotal = recentItems.reduce(
    (s, i) => s + Number(i.price_at_time) * i.quantity,
    0,
  );

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId);
    toast(t('cart.itemRemoved'), 'info');
    const updated = await getCart();
    setCart(updated);
    setItemCount(updated.items?.length ?? 0);
    router.refresh();
  };

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={closePanel}
          />
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 inset-x-0 z-[70] border-b border-white/10 bg-dark-900/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="max-w-3xl mx-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary-400" />
                  {t('nav.cart')}
                </h2>
                <button
                  type="button"
                  onClick={closePanel}
                  className="p-2 rounded-lg text-white/50 hover:bg-white/5"
                  aria-label={t('cart.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loading ? (
                <p className="text-white/50 text-sm py-8 text-center">{t('common.loading')}</p>
              ) : recentItems.length === 0 ? (
                <p className="text-white/50 text-sm py-8 text-center">{t('cart.empty')}</p>
              ) : (
                <ul className="space-y-3 mb-4">
                  {recentItems.map((item) => {
                    const imageUrl = getCartItemImageUrl(item);
                    return (
                    <li key={item.id} className="flex items-center gap-3">
                      {imageUrl && (
                        <ProductImage
                          src={imageUrl}
                          alt={item.product?.title ?? ''}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg bg-dark-800"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {item.product?.title}
                        </p>
                        <CartItemVariantMeta item={item} compact />
                        <p className="text-xs text-white/40">
                          {item.quantity} × {formatCurrency(item.price_at_time)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-danger/60 hover:text-danger p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                    );
                  })}
                </ul>
              )}

              {recentItems.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-white/40">{t('cart.subtotal')}</p>
                    <p className="text-lg font-bold text-primary-400">{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/cart"
                      onClick={closePanel}
                      className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all border border-white/15 bg-white/5 text-white hover:bg-white/10 px-4 h-9 text-xs"
                    >
                      {t('nav.viewCart')}
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={closePanel}
                      className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all bg-primary-500 text-dark-950 hover:bg-primary-400 px-4 h-9 text-xs"
                    >
                      {t('nav.checkout')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
