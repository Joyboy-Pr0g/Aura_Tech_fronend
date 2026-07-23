'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Product } from '@/lib/types/entities';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import {
  getDisplayStock,
  getMainProductStock,
  getProductPricing,
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
import { SlideIn, Stagger, staggerItemVariants, EASE_OUT_EXPO, Reveal } from '@/lib/motion/reveal';
import { ProductImageZoom } from '@/features/products/components/product-image-zoom';
import { ProductPriceDisplay } from '@/features/products/components/product-price-display';

interface ProductDetailClientProps {
  product: Product;
  isAuthenticated: boolean;
}

export function ProductDetailClient({ product, isAuthenticated }: ProductDetailClientProps) {
  const router = useRouter();
  const { t, dir } = useLocale();
  const formatPrice = useFormatPrice();
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

  const selectedPricing = getProductPricing(product, selectedVariant);
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

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId((current) => (current === variantId ? '' : variantId));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    setAdding(true);
    try {
      const cart = await addToCart({
        product_id: product.id,
        quantity,
        ...(selectedVariantId ? { variant_id: selectedVariantId } : {}),
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

  const galleryFromStart = dir !== 'rtl';

  return (
    <div className="space-y-10 lg:space-y-14">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <SlideIn fromStart={galleryFromStart} immediate className="space-y-4">
          {activeImage ? (
            <ProductImageZoom src={activeImage} alt={product.title} priority />
          ) : (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 border border-white/10" />
          )}
          {galleryImages.length > 1 && (
            <Stagger immediate className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img) => (
                <motion.button
                  key={img.public_id}
                  type="button"
                  variants={staggerItemVariants}
                  onClick={() => setActiveImage(img.url)}
                  aria-label={product.title}
                  className={cn(
                    'relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 transition-colors',
                    activeImage === img.url ? 'border-primary-500' : 'border-white/10 hover:border-white/25',
                    img.source === 'variant' && activeImage !== img.url && 'border-secondary-500/40',
                  )}
                >
                  <ProductImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </motion.button>
              ))}
            </Stagger>
          )}
        </SlideIn>

        <SlideIn fromStart={!galleryFromStart} delay={0.1} immediate className="space-y-6">
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

          <div className="space-y-2">
            <ProductPriceDisplay product={product} variant={selectedVariant} layout="detail" />
            {priceRange && !selectedPricing.hasDiscount && (
              <p className="text-sm text-white/40">
                {t('product.fromPrice', { price: formatPrice(priceRange.min) })}
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
                    <ProductPriceDisplay product={product} layout="inline" className="mt-0.5" />
                    <span className="block text-xs mt-0.5 text-white/45">
                      {t('product.availableCount', { count: mainProductStock })}
                    </span>
                  </button>
                )}
                {variants.map((variant) => {
                  const label = getVariantLabel(variant);
                  const variantStock = getVariantAvailableStock(variant);
                  const isSelected = selectedVariantId === variant.id;
                  const outOfStock = variantStock <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={outOfStock && !isSelected}
                      onClick={() => handleVariantSelect(variant.id)}
                      className={cn(
                        'min-w-[5rem] px-3 py-2 rounded-lg border text-sm transition-colors text-start',
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 text-white/70 hover:border-white/20',
                        outOfStock && !isSelected && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <span className="block font-medium">{label}</span>
                      <ProductPriceDisplay
                        product={product}
                        variant={variant}
                        layout="inline"
                        className="mt-0.5"
                      />
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={handleAddToCart}
              disabled={!variantInStock || adding}
              size="lg"
              className="w-full gap-2 sm:flex-1 sm:h-11 sm:px-6 sm:text-sm"
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
                size="lg"
                className="w-full gap-2 sm:flex-1 sm:h-11 sm:px-6 sm:text-sm"
              >
                <Bell className="h-4 w-4" />
                {reminding ? t('product.reminding') : t('product.notifyWhenAvailable')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleWishlist}
              size="lg"
              className={cn(
                'w-full gap-2 sm:w-auto sm:h-11 sm:px-6 sm:text-sm',
                wishlisted && 'text-danger border-danger/30',
              )}
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
        </SlideIn>
      </div>

      <Reveal delay={0.05}>
      <Tabs.Root
        dir={dir}
        defaultValue="description"
        className="w-full border-t border-white/10 pt-10 text-start"
      >
        <Tabs.List className="mb-6 flex w-full flex-wrap justify-start gap-1 border-b border-white/10">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="-mb-px px-4 py-2.5 text-start text-sm font-medium text-white/50 transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:text-primary-400"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content
          value="description"
          className="w-full max-w-3xl text-start leading-relaxed text-white/70 outline-none me-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          >
            {product.description}
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="specs" className="w-full text-start outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          >
            {featureEntries.length > 0 ? (
              <dl className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 me-auto">
                {featureEntries.map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="card-dark p-4 text-start"
                  >
                    <dt className="text-xs uppercase tracking-wide text-white/40">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="mt-1 text-sm text-white">{value}</dd>
                  </motion.div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-white/40">{t('product.noSpecs')}</p>
            )}
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="reviews" className="w-full text-start outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          >
            <ProductReviewsTab
              reviews={product.reviews}
              averageRating={product.average_rating}
              ratingCount={product.rating_count}
            />
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="qa" className="w-full text-start outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          >
            <ProductQaTab
              productId={product.id}
              isAuthenticated={isAuthenticated}
              questions={product.questions}
            />
          </motion.div>
        </Tabs.Content>
      </Tabs.Root>
      </Reveal>
    </div>
  );
}
