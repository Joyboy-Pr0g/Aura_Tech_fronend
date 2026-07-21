'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cart, CustomerAddress, OrderPaymentType, PaymentMethod, ShippingFee } from '@/lib/types/entities';
import { useFormatPrice, useCurrency } from '@/lib/currency/currency-provider';
import { convertSarToYer, formatYer } from '@/lib/utils/format';
import { checkout } from '@/features/orders/services/orders-client';
import { submitPayment } from '@/features/cart/services/cart-client';
import { validateCoupon, type ValidateCouponResult } from '@/features/coupons/services/coupons-client';
import { toast } from '@/components/ui/Toaster';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Banknote, Tag, Truck } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors/api-error';
interface CheckoutViewProps {
  cart: Cart;
  addresses: CustomerAddress[];
  shippingFees: ShippingFee[];
  paymentMethods: PaymentMethod[];
}

const STEP_KEYS = [
  'checkout.step.address',
  'checkout.step.shipping',
  'checkout.step.payment',
  'checkout.step.review',
] as const;

export function CheckoutView({
  cart,
  addresses,
  shippingFees,
  paymentMethods,
}: CheckoutViewProps) {
  const router = useRouter();
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const { sarToYer, canUseYer } = useCurrency();
  const [step, setStep] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState(addresses.find((a) => a.is_default)?.id ?? '');
  const [selectedShippingFeeId, setSelectedShippingFeeId] = useState(shippingFees[0]?.id ?? '');
  const [paymentType, setPaymentType] = useState<OrderPaymentType>('bank_transfer');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [payerAccountNumber, setPayerAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const items = cart.items ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.price_at_time) * i.quantity, 0);
  const selectedShippingFee = shippingFees.find((fee) => fee.id === selectedShippingFeeId);
  const shippingCost = Number(selectedShippingFee?.price ?? 0);
  const discountAmount = appliedCoupon?.discount_amount ?? 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);
  const isPayOnDelivery = paymentType === 'pay_on_delivery';
  const totalYer = sarToYer != null ? convertSarToYer(total, sarToYer) : null;

  const canContinuePaymentStep = true;

  const canConfirmTransfer =
    Boolean(selectedPaymentMethodId) &&
    Boolean(receipt) &&
    payerAccountNumber.replace(/\D/g, '').length >= 6;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    try {
      const couponItems = items.map((item) => ({
        product_id: item.product_id,
        category_id: item.product.category?.id ?? '',
        sub_category_id: item.product.sub_category?.id ?? null,
        line_total: Number(item.price_at_time) * item.quantity,
      })).filter((item) => item.category_id);
      const result = await validateCoupon(code, subtotal, couponItems);
      setAppliedCoupon(result);
      setCouponInput(result.code);
      toast(t('checkout.couponApplied', { code: result.code }), 'success');
    } catch (error) {
      setAppliedCoupon(null);
      toast(getErrorMessage(error) || t('checkout.couponInvalid'), 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const renderOrderTotals = (emphasizeTotal = false) => (
    <div className={cn('space-y-2 text-sm', emphasizeTotal && 'pt-2')}>
      <div className="flex justify-between text-white/70">
        <span>{t('cart.subtotal')}</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {selectedShippingFee && (
        <div className="flex justify-between text-white/50">
          <span>
            {t('cart.shipping')} ({selectedShippingFee.delivery_way} · {selectedShippingFee.duration})
          </span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
      )}
      {appliedCoupon && discountAmount > 0 && (
        <div className="flex justify-between text-emerald-400/90">
          <span>{t('checkout.couponDiscount')} ({appliedCoupon.code})</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className={cn(
        'flex justify-between font-bold text-primary-400',
        emphasizeTotal ? 'text-lg pt-2 border-t border-white/10' : 'text-lg',
      )}>
        <span>{t('order.total')}</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddr || !selectedShippingFeeId) {
      toast(t('checkout.missingFields'), 'error');
      return;
    }

    if (!isPayOnDelivery) {
      if (!selectedPaymentMethodId) {
        toast(t('checkout.selectPaymentMethod'), 'error');
        return;
      }
      if (!receipt) {
        toast(t('checkout.missingReceipt'), 'error');
        return;
      }
      if (payerAccountNumber.replace(/\D/g, '').length < 6) {
        toast(t('checkout.missingPayerAccount'), 'error');
        return;
      }
      if (!canUseYer || totalYer == null) {
        toast(t('checkout.failed'), 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const order = await checkout({
        shipping_address_id: selectedAddr,
        billing_address_id: selectedAddr,
        shipping_fee_id: selectedShippingFeeId,
        payment_type: paymentType,
        coupon_code: appliedCoupon?.code,
      });

      if (!isPayOnDelivery && receipt && order?.id) {
        await submitPayment(
          order.id,
          receipt,
          selectedPaymentMethodId,
          payerAccountNumber.replace(/\D/g, ''),
        );
      }

      toast(
        isPayOnDelivery ? t('checkout.successPayOnDelivery') : t('checkout.successBankTransfer'),
        'success',
      );
      router.push(`/dashboard/orders/${order!.order_number}`);
    } catch (error) {
      toast(getErrorMessage(error) || t('checkout.failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">{t('checkout.title')}</h1>

      <div className="flex gap-2">
        {STEP_KEYS.map((key, i) => (
          <div
            key={key}
            className={cn(
              'flex-1 text-center py-2 rounded-lg text-xs font-medium border',
              i <= step
                ? 'border-primary-500/40 bg-primary-500/10 text-primary-400'
                : 'border-white/10 text-white/30',
            )}
          >
            {t(key)}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-white">{t('checkout.shippingAddress')}</h2>
          {addresses.length === 0 ? (
            <p className="text-white/50 text-sm">
              {t('checkout.noAddresses')}{' '}
              <a href="/dashboard/addresses" className="text-primary-400">{t('checkout.yourDashboard')}</a>.
            </p>
          ) : (
            addresses.map((a) => (
              <label
                key={a.id}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border cursor-pointer',
                  selectedAddr === a.id ? 'border-primary-500 bg-primary-500/5' : 'border-white/10',
                )}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddr === a.id}
                  onChange={() => setSelectedAddr(a.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-white">{a.label}</p>
                  <p className="text-sm text-white/50">{a.full_name} · {a.phone}</p>
                  <p className="text-sm text-white/50">{a.street_address}, {a.city}</p>
                </div>
              </label>
            ))
          )}
          <Button onClick={() => setStep(1)} disabled={!selectedAddr}>{t('common.continue')}</Button>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-white">{t('checkout.shippingMethod')}</h2>
          {shippingFees.length === 0 ? (
            <p className="text-white/50 text-sm">{t('checkout.noShippingFees')}</p>
          ) : (
            shippingFees.map((fee) => (
              <label
                key={fee.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border cursor-pointer',
                  selectedShippingFeeId === fee.id ? 'border-primary-500 bg-primary-500/5' : 'border-white/10',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="radio"
                    checked={selectedShippingFeeId === fee.id}
                    onChange={() => setSelectedShippingFeeId(fee.id)}
                  />
                  <div className="min-w-0">
                    <span className="text-white capitalize block">{fee.delivery_way}</span>
                    <span className="text-sm text-white/50">{fee.duration}</span>
                  </div>
                </div>
                <span className="text-primary-400 shrink-0">{formatPrice(Number(fee.price))}</span>
              </label>
            ))
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>{t('common.back')}</Button>
            <Button onClick={() => setStep(2)} disabled={!selectedShippingFeeId}>{t('common.continue')}</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-white">{t('checkout.paymentMethodTitle')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border cursor-pointer',
                paymentType === 'bank_transfer' ? 'border-primary-500 bg-primary-500/5' : 'border-white/10',
              )}
            >
              <input
                type="radio"
                name="payment_type"
                checked={paymentType === 'bank_transfer'}
                onChange={() => {
                  setPaymentType('bank_transfer');
                }}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Banknote size={16} className="text-primary-400" />
                  {t('checkout.paymentBank')}
                </div>
                <p className="text-sm text-white/50 mt-1">{t('checkout.paymentBankDesc')}</p>
              </div>
            </label>

            <label
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border cursor-pointer',
                paymentType === 'pay_on_delivery' ? 'border-primary-500 bg-primary-500/5' : 'border-white/10',
              )}
            >
              <input
                type="radio"
                name="payment_type"
                checked={paymentType === 'pay_on_delivery'}
                onChange={() => {
                  setPaymentType('pay_on_delivery');
                  setSelectedPaymentMethodId('');
                  setReceipt(null);
                }}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Truck size={16} className="text-primary-400" />
                  {t('checkout.payOnDelivery')}
                </div>
                <p className="text-sm text-white/50 mt-1">{t('checkout.payOnDeliveryDesc')}</p>
              </div>
            </label>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center gap-2 text-white font-medium">
              <Tag size={16} className="text-primary-400" />
              {t('checkout.couponCode')}
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-emerald-400">
                  {t('checkout.couponApplied', { code: appliedCoupon.code })}
                  {' · '}
                  -{formatPrice(discountAmount)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveCoupon}>
                  {t('checkout.removeCoupon')}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={t('checkout.couponPlaceholder')}
                  className="input-dark flex-1 uppercase"
                  disabled={couponLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                >
                  {couponLoading ? t('checkout.couponValidating') : t('checkout.applyCoupon')}
                </Button>
              </div>
            )}
          </div>

          {renderOrderTotals()}

          <div className="flex gap-2">            <Button variant="outline" onClick={() => setStep(1)}>{t('common.back')}</Button>
            <Button disabled={!canContinuePaymentStep} onClick={() => setStep(3)}>
              {t('common.continue')}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-white">{t('checkout.reviewOrder')}</h2>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm space-y-2">
            <div className="flex justify-between text-white/70">
              <span>{t('checkout.paymentMethodTitle')}</span>
              <span className="text-white">
                {isPayOnDelivery ? t('checkout.payOnDelivery') : t('checkout.paymentBank')}
              </span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-white/70">
                <span>{t('checkout.couponCode')}</span>
                <span className="text-emerald-400">{appliedCoupon.code}</span>
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-white/70">
                <span>{item.product?.title} × {item.quantity}</span>
                <span>{formatPrice(Number(item.price_at_time) * item.quantity)}</span>
              </div>
            ))}
            {renderOrderTotals(true)}
          </div>

          {!isPayOnDelivery && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm text-white/60">{t('checkout.transferInstructions')}</p>

              {totalYer != null && canUseYer ? (
                <div className="rounded-lg border border-primary-500/30 bg-primary-500/5 p-4">
                  <p className="text-sm text-white/60">{t('checkout.amountToPayYer')}</p>
                  <p className="text-2xl font-bold text-primary-400 mt-1">{formatYer(totalYer)}</p>
                </div>
              ) : (
                <p className="text-sm text-danger">{t('checkout.failed')}</p>
              )}

              {paymentMethods.length === 0 ? (
                <p className="text-white/50 text-sm">{t('checkout.noPaymentMethods')}</p>
              ) : (
                paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={cn(
                      'block p-4 rounded-lg border cursor-pointer text-sm space-y-1',
                      selectedPaymentMethodId === pm.id ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 bg-dark-800',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method_review"
                        checked={selectedPaymentMethodId === pm.id}
                        onChange={() => setSelectedPaymentMethodId(pm.id)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <p className="font-medium text-white">{pm.name}</p>
                        <p className="text-white/50">{t('checkout.bank')}: {pm.bank_name}</p>
                        {pm.account_number && <p className="text-white/50">{t('checkout.account')}: {pm.account_number}</p>}
                        {pm.iban && <p className="text-white/50">{t('checkout.iban')}: {pm.iban}</p>}
                      </div>
                    </div>
                  </label>
                ))
              )}

              <div>
                <label className="label-dark">{t('checkout.payerAccountNumber')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={payerAccountNumber}
                  onChange={(e) => setPayerAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('checkout.payerAccountPlaceholder')}
                  className="input-dark mt-2"
                />
                <p className="text-xs text-white/40 mt-1">{t('checkout.payerAccountHint')}</p>
              </div>

              <div>
                <label className="label-dark">{t('checkout.uploadReceipt')}</label>
                <label
                  htmlFor="receipt-upload-review"
                  className="inline-flex items-center justify-center py-2 px-4 rounded bg-primary-500 text-dark-950 font-medium cursor-pointer transition-opacity hover:opacity-90 mt-2"
                >
                  {receipt ? receipt.name : t('checkout.uploadReceipt')}
                </label>
                <input
                  id="receipt-upload-review"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button disabled={loading} variant="outline" onClick={() => setStep(2)}>{t('common.back')}</Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={loading || (!isPayOnDelivery && !canConfirmTransfer)}
            >
              {loading
                ? (isPayOnDelivery ? t('checkout.placing') : t('checkout.confirmingTransfer'))
                : (isPayOnDelivery ? t('checkout.placeOrder') : t('checkout.confirmTransfer'))}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
