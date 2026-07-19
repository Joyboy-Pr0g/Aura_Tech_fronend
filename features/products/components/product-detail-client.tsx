'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';
import { Product } from '@/lib/types/entities';
import { formatCurrency } from '@/lib/utils/format';
import {
  getDisplayPrice,
  getDisplayStock,
  getMainProductStock,
  getVariantLabel,
  getProductPriceRange,
  getVariantAvailableStock,
  getDefaultDetailImage,
  buildProductGalleryImages,
  isInStock,
} from '@/lib/products/helpers';
import { addToCart } from '@/features/cart/services/cart-client';
import { addToWishlist, removeFromWishlist } from '@/features/engagement/services/engagement-client';
import { subscribeStockReminder } from '@/features/engagement/services/reminders-client';
import { ProductReviewsTab } from '@/features/engagement/components/product-reviews-tab';
import { ProductQaTab } from '@/features/engagement/components/product-qa-tab';
import { useCartUiStore } from '@/lib/stores/cart-ui-store';
import { useLocale } from '@/lib/i18n/locale-provider';
import { buildCategoryProductsPath } from '@/lib/storefront/product-paths';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { toast } from '@/components/ui/Toaster';
import { Minus, Plus, Heart, ShoppingCart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProductDetailClientProps {
  product: Product;
  isAuthenticated: boolean;
}

export function ProductDetailClient({ product, isAuthenticated }: ProductDetailClientProps) {
  const router = useRouter();
  const { t } = useLocale();
  const { setItemCount, openPanel } = useCartUiStore();

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const mainProductStock = getMainProductStock(product);
  const priceRange = useMemo(() => getProductPriceRange(product), [product]);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [adding, setAdding] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [wishlisted, setWishlisted] = useState(product.is_wishlisted ?? false);
  const [activeImage, setActiveImage] = useState(() => getDefaultDetailImage(product, null));

  const selectedVariant = useMemo(
    () => (selectedVariantId ? variants.find((variant) => variant.id === selectedVariantId) ?? null : null),
    [variants, selectedVariantId],
  );

  const galleryImages = useMemo(
    () => buildProductGalleryImages(product, selectedVariant),
    [product, selectedVariant],
  );

  const displayPrice = getDisplayPrice(product, selectedVariant);
  const available = getDisplayStock(product, selectedVariant);
  const variantInStock = isInStock(product, selectedVariant);
  const stockScopeLabel = selectedVariant
    ? t('product.stockForVariant', { label: getVariantLabel(selectedVariant) })
    : t('product.stockForMain');
  const featureEntries = Object.entries(product.features ?? {});

  useEffect(() => {
    setQuantity(1);
    const variant = variants.find((item) => item.id === selectedVariantId) ?? null;
    const nextImage = getDefaultDetailImage(product, variant);
    if (nextImage) setActiveImage(nextImage);
  }, [selectedVariantId, product, variants]);

  useEffect(() => {
    setQuantity((current) => Math.min(current, Math.max(available, 1)));
  }, [available]);

  useEffect(() => {
    setWishlisted(product.is_wishlisted ?? false);
  }, [product.id, product.is_wishlisted]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    setAdding(true);
    try {
      const cart = await addToCart({
        product_id: product.id,
        variant_id: selectedVariantId || undefined,
        quantity,
      });
      const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
      setItemCount(count);
      toast(t('cart.added'), 'success');
      openPanel();
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('cart.addFailed'), 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
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
    }
  };

  const handleStockReminder = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    setReminding(true);
    try {
      await subscribeStockReminder(
        product.id,
        selectedVariantId || null,
      );
      toast(t('product.reminderSet'), 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : t('product.reminderFailed'), 'error');
    } finally {
      setReminding(false);
    }
  };

  const tabs = [
    { value: 'description', label: t('product.tab.description') },
    { value: 'specs', label: t('product.tab.specs') },
    { value: 'reviews', label: t('product.tab.reviews') },
    { value: 'qa', label: t('product.tab.qa') },
  ];

  const categoryHref = buildCategoryProductsPath(
    product.category.slug,
    null,
    product.category.id,
  );
  const subCategoryHref = product.sub_category
    ? buildCategoryProductsPath(
        product.category.slug,
        product.sub_category.slug,
        product.category.id,
      )
    : null;

  return (
    <div className="space-y-10 lg:space-y-14">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 border border-white/10">
            <ProductImage src={activeImage} alt={product.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img) => (
                <button
                  key={img.public_id}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  aria-label={product.title}
                  className={cn(
                    'relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 transition-colors',
                    activeImage === img.url ? 'border-primary-500' : 'border-white/10 hover:border-white/25',
                    img.source === 'variant' && activeImage !== img.url && 'border-secondary-500/40',
                  )}
                >
                  <ProductImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Link href={categoryHref}>
                <Badge variant="outline" className="hover:border-primary-500/50 hover:text-primary-400 transition-colors">
                  {product.category?.name}
                </Badge>
              </Link>
              {product.sub_category && subCategoryHref && (
                <Link href={subCategoryHref}>
                  <Badge variant="secondary" className="hover:bg-primary-500/20 transition-colors">
                    {product.sub_category.name}
                  </Badge>
                </Link>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">{product.title}</h1>
            <p className="text-white/50 mt-2">
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                className="hover:text-primary-400 transition-colors"
              >
                {product.brand}
              </Link>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary-400">{formatCurrency(displayPrice)}</p>
            {priceRange && (
              <p className="text-sm text-white/40">
                {t('product.fromPrice', { price: formatCurrency(priceRange.min) })}
                {' — '}
                {t('product.priceVaries')}
              </p>
            )}
          </div>

          <Badge variant={variantInStock ? 'success' : 'danger'} className="text-sm px-3 py-1">
            {variantInStock
              ? `${t('common.inStock')} — ${t('product.availableCount', { count: available })} (${stockScopeLabel})`
              : t('product.unavailable')}
          </Badge>

          {hasVariants && (
            <div>
              <p className="label-dark">{t('product.variant')}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {mainProductStock > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedVariantId('')}
                    className={cn(
                      'min-w-[5rem] px-3 py-2 rounded-lg border text-sm transition-colors text-start',
                      !selectedVariantId
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-white/10 text-white/70 hover:border-white/20',
                    )}
                  >
                    <span className="block font-medium">{t('product.mainProduct')}</span>
                    <span className="block text-xs mt-0.5 opacity-80">{formatCurrency(Number(product.price))}</span>
                    <span className="block text-xs mt-0.5 text-white/45">
                      {t('product.availableCount', { count: mainProductStock })}
                    </span>
                  </button>
                )}
                {variants.map((variant) => {
                  const label = getVariantLabel(variant);
                  const variantStock = getVariantAvailableStock(variant);
                  const variantPrice = getDisplayPrice(product, variant);
                  const isSelected = selectedVariantId === variant.id;
                  const outOfStock = variantStock <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        'min-w-[5rem] px-3 py-2 rounded-lg border text-sm transition-colors text-start',
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 text-white/70 hover:border-white/20',
                        outOfStock && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <span className="block font-medium">{label}</span>
                      {variantPrice !== Number(product.price) && (
                        <span className="block text-xs mt-0.5 opacity-80">{formatCurrency(variantPrice)}</span>
                      )}
                      <span className={cn('block text-xs mt-0.5', outOfStock ? 'text-danger' : 'text-white/45')}>
                        {outOfStock
                          ? t('common.outOfStock')
                          : t('product.availableCount', { count: variantStock })}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedVariant && (
                <p className="text-xs text-white/40 mt-2">
                  {t('product.sku')}: {selectedVariant.sku}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">{t('product.quantity')}</span>
            <div className="flex items-center border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="p-2 text-white/60 hover:text-white disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 text-white font-medium min-w-[2.5rem] text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(available, value + 1))}
                className="p-2 text-white/60 hover:text-white disabled:opacity-40"
                disabled={!variantInStock || quantity >= available}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!variantInStock || adding}
              className="flex-1 gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {adding ? t('product.adding') : t('product.addToCart')}
            </Button>
            {!variantInStock && (
              <Button
                type="button"
                variant="outline"
                onClick={handleStockReminder}
                disabled={reminding}
                className="flex-1 gap-2"
              >
                <Bell className="h-4 w-4" />
                {reminding ? t('product.reminding') : t('product.notifyWhenAvailable')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleWishlist}
              className={cn('gap-2', wishlisted && 'text-danger border-danger/30')}
            >
              <Heart className={cn('h-4 w-4', wishlisted && 'fill-danger')} />
              {t('product.wishlist')}
            </Button>
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-white/40">
              <Link href={`/login?redirect=/products/${product.slug}`} className="text-primary-400 hover:underline">
                {t('product.signIn')}
              </Link>{' '}
              {t('product.signInPurchase')}
            </p>
          )}
        </div>
      </div>

      <Tabs.Root defaultValue="description" className="border-t border-white/10 pt-10">
        <Tabs.List className="flex flex-wrap gap-1 border-b border-white/10 mb-6">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-2.5 text-sm font-medium text-white/50 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 -mb-px transition-colors"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="description" className="text-white/70 leading-relaxed max-w-3xl">
          {product.description}
        </Tabs.Content>

        <Tabs.Content value="specs">
          {featureEntries.length > 0 ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
              {featureEntries.map(([key, value]) => (
                <div key={key} className="card-dark p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/40">
                    {key.replace(/_/g, ' ')}
                  </dt>
                  <dd className="text-sm text-white mt-1">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-white/40 text-sm">{t('product.noSpecs')}</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="reviews">
          <ProductReviewsTab
            reviews={product.reviews}
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
          />
        </Tabs.Content>

        <Tabs.Content value="qa">
          <ProductQaTab
            productId={product.id}
            isAuthenticated={isAuthenticated}
            questions={product.questions}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
