'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types/entities';
import { getWishlist, removeFromWishlist } from '@/features/engagement/services/engagement-client';
import { ProductCard } from '@/features/products/components/product-card';
import { Card } from '@/components/ui/card';
import { Button, ButtonLink } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { toast } from '@/components/ui/Toaster';

export function WishlistView() {
  const { t } = useLocale();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p.id !== productId));
      toast(t('wishlist.removed'), 'success');
    } catch {
      toast(t('wishlist.error'), 'error');
    }
  };

  if (loading) {
    return <p className="text-white/40 p-8">{t('common.loading')}</p>;
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 mb-4">{t('wishlist.empty')}</p>
        <ButtonLink href="/products">{t('home.shopNow')}</ButtonLink>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((product) => (
        <div key={product.id} className="relative group">
          <ProductCard product={product} />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-3 start-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(product.id)}
          >
            {t('wishlist.remove')}
          </Button>
        </div>
      ))}
    </div>
  );
}
