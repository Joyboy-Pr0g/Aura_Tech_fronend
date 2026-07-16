'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, TrashIcon } from 'lucide-react';
import { Product } from '@/lib/types/entities';
import { removeFromWishlist } from '@/features/engagement/services/engagement-client';
import { ProductCard } from '@/features/products/components/product-card';
import { Card } from '@/components/ui/card';
import { Button, ButtonLink } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { toast } from '@/components/ui/Toaster';

interface WishlistViewProps {
  initialWishlist: Product[];
}

export function WishlistView({ initialWishlist }: WishlistViewProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [items, setItems] = useState<Product[]>(initialWishlist);

  useEffect(() => {
    setItems(initialWishlist);
  }, [initialWishlist]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((product) => product.id !== productId));
      router.refresh();
      toast(t('wishlist.removed'), 'success');
    } catch {
      toast(t('wishlist.error'), 'error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t('nav.wishlist')}</h1>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <Button
                variant="danger"
                size="icon"
                className="absolute top-3 start-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(product.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">{t('wishlist.empty')}</p>
          <ButtonLink href="/products">{t('home.shopNow')}</ButtonLink>
        </Card>
      )}
    </div>
  );
}
