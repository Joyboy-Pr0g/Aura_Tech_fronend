'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderItem, PaymentMethod, RefundRequest } from '@/lib/types/entities';
import { OrderStatusHistoryEntry } from '@/features/engagement/types';
import { formatDateTime, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/lib/utils/format';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import { getProductImageUrl } from '@/lib/products/helpers';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { ProductImage } from '@/components/ui/product-image';
import { OrderItemReviewModal } from '@/features/orders/components/order-item-review-modal';
import { OrderRefundModal } from '@/features/orders/components/order-refund-modal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { submitPayment } from '@/features/cart/services/cart-client';
import { Upload, CheckCircle2, XCircle, Clock, Truck, User, Mail, Phone, MapPin, Star, Package, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderDetailProps {
  order: Order;
  paymentMethods?: PaymentMethod[];
  variant?: 'customer' | 'admin';
  orderStatusHistory?: OrderStatusHistoryEntry[];
  reviewedProductIds?: string[];
  refundRequest?: RefundRequest | null;
}

export function OrderDetail({
  order,
  paymentMethods = [],
  variant = 'customer',
  orderStatusHistory = [],
  reviewedProductIds = [],
  refundRequest: initialRefundRequest = null,
}: OrderDetailProps) {
  const router = useRouter();
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const [uploading, setUploading] = useState(false);
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const [reviewedIds, setReviewedIds] = useState<string[]>(reviewedProductIds);
  const [refundRequest, setRefundRequest] = useState<RefundRequest | null>(initialRefundRequest);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isAdmin = variant === 'admin';
  const canReview = !isAdmin && order.status === 'delivered';

  const deliveredAt = orderStatusHistory.find((entry) => entry.new_status === 'delivered')?.created_at ?? null;
  const refundExpiresAt = deliveredAt ? new Date(new Date(deliveredAt).getTime() + 24 * 60 * 60 * 1000) : null;
  const canRequestRefund =
    !isAdmin &&
    order.status === 'delivered' &&
    !refundRequest &&
    deliveredAt &&
    refundExpiresAt &&
    Date.now() <= refundExpiresAt.getTime();

  const payment = order.payment;
  const canSubmitPayment =
    !isAdmin &&
    order.payment_type !== 'pay_on_delivery' &&
    order.status === 'pending_payment' &&
    (!payment || payment.status === 'rejected');

  const handleSubmitPayment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const methodId = paymentMethods[0]?.id;
      if (!methodId) throw new Error(t('checkout.noPaymentMethods'));
      await submitPayment(order.id, file, methodId);
      toast(t('order.receiptUploaded'), 'success');
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('order.receiptFailed'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const renderOrderItem = (item: OrderItem) => {
    const alreadyReviewed = reviewedIds.includes(item.product_id);
    const product = item.product;
    const productTitle = product?.title ?? t('reviews.product');
    const categoryName = product?.category?.name ?? product?.sub_category?.name;

    return (
      <div
        key={item.id}
        className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-dark-800 shrink-0">
            <ProductImage
              src={product ? getProductImageUrl(product) : null}
              alt={productTitle}
              fill
              sizes="80px"
              className="rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            {!isAdmin && product?.slug ? (
              <Link
                href={`/products/${encodeURIComponent(product.slug)}`}
                className="text-sm font-semibold text-white hover:text-primary-400 transition-colors line-clamp-2"
              >
                {productTitle}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-white line-clamp-2">{productTitle}</p>
            )}
            {product?.brand && (
              <p className="text-xs text-white/45">
                {t('filters.brand')}: <span className="text-white/70">{product.brand}</span>
              </p>
            )}
            {categoryName && (
              <p className="text-xs text-white/45">
                {t('filters.category')}: <span className="text-white/70">{categoryName}</span>
              </p>
            )}
          </div>
        </div>

        {(item.variant?.color || item.variant?.size || item.variant?.sku) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {item.variant.color && (
              <span className="rounded-md border border-white/10 px-2 py-1 text-white/60">
                {item.variant.color}
              </span>
            )}
            {item.variant.size && (
              <span className="rounded-md border border-white/10 px-2 py-1 text-white/60">
                {item.variant.size}
              </span>
            )}
            {item.variant.sku && (
              <span className="rounded-md border border-white/10 px-2 py-1 text-white/50">
                {t('product.sku')}: {item.variant.sku}
              </span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between gap-3 pt-1 border-t border-white/5">
          <p className="text-xs text-white/45">
            {t('cart.qty')}: {item.quantity} × {formatPrice(item.unit_price)}
          </p>
          <p className="font-semibold text-white shrink-0">{formatPrice(item.total_price)}</p>
        </div>

        {canReview && (
          <div>
            {alreadyReviewed ? (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle2 size={12} />
                {t('order.reviewed')}
              </span>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setReviewItem(item)}
              >
                <Star size={12} />
                {t('order.reviewRate')}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const productsSidebar = (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {isAdmin && order.customer && (
        <div className="card-dark p-5 space-y-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-primary-400" />
            <h3 className="font-semibold text-white">{t('admin.orderCustomer')}</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-white font-medium">{order.customer.full_name}</p>
            <div className="flex items-start gap-2 text-white/60">
              <Mail size={14} className="mt-0.5 shrink-0" />
              <span className="break-all">{order.customer.email}</span>
            </div>
            {order.customer.phone && (
              <div className="flex items-center gap-2 text-white/60">
                <Phone size={14} className="shrink-0" />
                <span>{order.customer.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card-dark p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-primary-400" />
          <h3 className="font-semibold text-white">{t('order.items')}</h3>
        </div>

        <div className="space-y-3">
          {order.items?.map(renderOrderItem)}
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-white/60">
            <span>{t('order.subtotal')}</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.shipping_fee && (
            <div className="flex justify-between text-white/60">
              <span>
                {t('cart.shipping')} ({order.shipping_fee.delivery_way} · {order.shipping_fee.duration})
              </span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
          )}
          {!order.shipping_fee && order.shipping_cost > 0 && (
            <div className="flex justify-between text-white/60">
              <span>{t('cart.shipping')}</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <span className="font-bold text-white">{t('order.total')}</span>
            <span className="font-bold text-primary-400 text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{order.order_number}</h2>
        <p className="text-white/40 mt-1">{formatDateTime(order.created_at)}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">

          <div className="card-dark p-5 flex items-center justify-between">
            <span className="text-white/60 text-sm">{t('order.status')}</span>
            <span className={cn('font-semibold', ORDER_STATUS_COLORS[order.status])}>
              {t(`orderStatus.${order.status}`)}
            </span>
          </div>

          <OrderTimeline history={orderStatusHistory} />

          {!isAdmin && order.shipping_address && (
            <div className="card-dark p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary-400" />
                <h3 className="font-semibold text-white">{t('order.deliveryAddress')}</h3>
              </div>
              <div className="text-sm text-white/70 space-y-1">
                <p className="text-white font-medium">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.phone}</p>
                <p>
                  {order.shipping_address.street_address}
                  {order.shipping_address.district ? `, ${order.shipping_address.district}` : ''}
                </p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.governorate}
                  {order.shipping_address.postal_code ? ` · ${order.shipping_address.postal_code}` : ''}
                </p>
                <p className="text-white/50">{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          {payment && (
            <div className="card-dark p-5 space-y-2">
              <h3 className="font-semibold text-white mb-3">{t('order.payment')}</h3>
              <div className="flex items-center gap-2">
                {payment.status === 'approved' && <CheckCircle2 size={18} className="text-success" />}
                {payment.status === 'manual_approved' && <CheckCircle2 size={18} className="text-success" />}
                {payment.status === 'rejected' && <XCircle size={18} className="text-danger" />}
                {payment.status === 'pending' && <Clock size={18} className="text-warning" />}
                <span className={cn('text-sm font-medium badge', PAYMENT_STATUS_COLORS[payment.status])}>
                  {t(`admin.paymentStatus.${payment.status}`)}
                </span>
              </div>
              {payment.payment_method && (
                <p className="text-sm text-white/50">
                  {t('admin.paymentMethod')}: {payment.payment_method.name} · {payment.payment_method.bank_name}
                </p>
              )}
              {payment.rejection_reason && (
                <p className="text-sm text-danger/80 bg-danger/10 rounded-lg px-3 py-2 mt-2">
                  {t('order.rejectedPrefix')}: {payment.rejection_reason}
                </p>
              )}
            </div>
          )}

          {!isAdmin && order.status === 'delivered' && (
            <div className="card-dark p-5 space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="text-primary-400" />
                <h3 className="font-semibold text-white">{t('order.refund')}</h3>
              </div>
              <p className="text-sm text-white/50">{t('order.refundWindowNote')}</p>
              {refundExpiresAt && !refundRequest && (
                <p className="text-xs text-white/40">
                  {t('order.refundDeadline', { date: formatDateTime(refundExpiresAt.toISOString()) })}
                </p>
              )}
              {refundRequest ? (
                <div className="space-y-2 text-sm">
                  <span className={cn(
                    'inline-flex badge',
                    refundRequest.status === 'pending' && 'badge-warning',
                    refundRequest.status === 'approved' && 'badge-success',
                    refundRequest.status === 'rejected' && 'badge-danger',
                  )}>
                    {t(`order.refundStatus.${refundRequest.status}`)}
                  </span>
                  <p className="text-white/70">{refundRequest.reason}</p>
                  {refundRequest.rejection_reason && (
                    <p className="text-danger/80">{refundRequest.rejection_reason}</p>
                  )}
                </div>
              ) : canRequestRefund ? (
                <Button type="button" size="sm" onClick={() => setIsRefundModalOpen(true)}>
                  <RotateCcw size={14} />
                  {t('order.requestRefund')}
                </Button>
              ) : deliveredAt && refundExpiresAt && Date.now() > refundExpiresAt.getTime() ? (
                <p className="text-sm text-white/40">{t('order.refundWindowExpired')}</p>
              ) : null}
            </div>
          )}

          {canSubmitPayment && (
            <div className="card-dark p-5 space-y-4">
              <h3 className="font-semibold text-white">{t('order.payBank')}</h3>

              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((m) => (
                    <div key={m.id} className="bg-dark-800 rounded-lg p-4 space-y-1">
                      <p className="font-semibold text-white">{m.name}</p>
                      <p className="text-sm text-white/60">{t('checkout.bank')}: {m.bank_name}</p>
                      {m.account_number && <p className="text-sm text-white/60">{t('checkout.account')}: {m.account_number}</p>}
                      {m.iban && <p className="text-sm text-white/60">{t('checkout.iban')}: {m.iban}</p>}
                      {m.description && <p className="text-xs text-white/40 mt-1">{m.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">{t('order.noPaymentMethods')}</p>
              )}

              <div>
                <p className="text-sm text-white/60 mb-3">
                  {t('order.transferHint')}{' '}
                  <span className="text-primary-400 font-bold">{formatPrice(order.total)}</span>
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleSubmitPayment}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-primary flex items-center gap-2 w-full justify-center"
                >
                  <Upload size={16} />
                  {uploading ? t('common.loading') : t('order.uploadReceipt')}
                </button>
              </div>
            </div>
          )}

          {order.shipping_fee && (
            <div className="card-dark p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-primary-400" />
                <h3 className="font-semibold text-white">{t('order.shippingDetails')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-xs uppercase tracking-wide text-white/40">{t('admin.shippingFeeDeliveryWay')}</p>
                  <p className="text-white capitalize mt-1">{order.shipping_fee.delivery_way}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-xs uppercase tracking-wide text-white/40">{t('admin.shippingFeeDuration')}</p>
                  <p className="text-white mt-1">{order.shipping_fee.duration}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-xs uppercase tracking-wide text-white/40">{t('admin.shippingFeePrice')}</p>
                  <p className="text-primary-400 font-semibold mt-1">{formatPrice(Number(order.shipping_fee.price))}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {productsSidebar}
        </div>
      </div>

      <OrderItemReviewModal
        item={reviewItem}
        open={!!reviewItem}
        onOpenChange={(open) => !open && setReviewItem(null)}
        onSubmitted={(productId) => setReviewedIds((prev) => [...prev, productId])}
      />

      <OrderRefundModal
        orderNumber={order.order_number}
        open={isRefundModalOpen}
        onOpenChange={setIsRefundModalOpen}
        onSubmitted={setRefundRequest}
      />
    </div>
  );
}
