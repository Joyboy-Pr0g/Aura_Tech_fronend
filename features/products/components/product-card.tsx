'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Package, Eye } from 'lucide-react';
import { Product } from '@/lib/types/entities';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import { getProductImageUrl, isInStock } from '@/lib/products/helpers';
import { addToWishlist, removeFromWishlist } from '@/features/engagement/services/engagement-client';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductImage } from '@/components/ui/product-image';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
  isAuthenticated?: boolean;
  /** Tailwind height/aspect classes for the image area, e.g. `h-40`, `h-48`, `aspect-video` */
  imageClassName?: string;
}

export function ProductCard({
  product,
  showWishlist = false,
  isAuthenticated = false,
  imageClassName = 'h-56',
}: ProductCardProps) {
  const router = useRouter();
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const imageUrl = getProductImageUrl(product);
  // const inStock = isInStock(product);
  const [wishlisted, setWishlisted] = useState(product.is_wishlisted ?? false);

  useEffect(() => {
    setWishlisted(product.is_wishlisted ?? false);
  }, [product.id, product.is_wishlisted]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast(t('wishlist.signIn'), 'info');
      router.push('/login');
      return;
    }
    try {
      if (wishlisted) {
        await removeFromWishlist(product.id);
        setWishlisted(false);
        toast(t('wishlist.removed'), 'success');
      } else {
        await addToWishlist(product.id);
        setWishlisted(true);
        toast(t('wishlist.added'), 'success');
      }
    } catch {
      toast(t('wishlist.error'), 'error');
    } finally {
      router.refresh();
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden h-full transition-all hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5">
        <div className={cn('relative w-full overflow-hidden bg-dark-800 flex items-center justify-center', imageClassName)}>
          {imageUrl ? (
            <ProductImage
              src={imageUrl}
              alt={product.title}
              fill
              className="transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
            />
          ) : (
            <Package className="h-12 w-12 text-white/20" />
          )}
          {showWishlist && (
            <button
              type="button"
              onClick={handleWishlist}
              className={cn(
                'absolute top-3 end-3 p-2 rounded-full bg-dark-950/70 border border-white/10 transition-all',
                'opacity-0 group-hover:opacity-100',
                wishlisted ? 'text-danger border-danger/30 opacity-100' : 'text-white/60 hover:text-danger hover:border-danger/30',
              )}
              aria-label={t('product.addToWishlist')}
            >
              <Heart className={cn('h-4 w-4', wishlisted && 'fill-danger')} />
            </button>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className={cn(
              'flex items-center justify-center gap-1.5 w-full py-2 rounded-lg',
              'bg-primary-500/90 text-dark-950 text-xs font-semibold backdrop-blur-sm',
            )}>
              <Eye className="h-3.5 w-3.5" /> {t('common.quickView')}
            </span>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs text-white/40">
            {product.brand} · {product.category?.name ?? t('product.uncategorized')}
          </p>
          <CardTitle className="line-clamp-2 group-hover:text-primary-400 transition-colors">
            {product.title}
          </CardTitle>
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-primary-400">{formatPrice(product.price)}</span>
            {/* <Badge variant={inStock ? 'success' : 'danger'}>
              {inStock ? t('common.inStock') : t('common.outOfStock')}
            </Badge> */}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
