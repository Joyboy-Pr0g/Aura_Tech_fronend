'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cart, CustomerAddress, PaymentMethod, ShippingFee } from '@/lib/types/entities';
import { formatCurrency } from '@/lib/utils/format';
import { checkout } from '@/features/orders/services/orders-client';
import { submitPayment } from '@/features/cart/services/cart-client';
import { toast } from '@/components/ui/Toaster';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

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
  const [step, setStep] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState(addresses.find((a) => a.is_default)?.id ?? '');
  const [selectedShippingFeeId, setSelectedShippingFeeId] = useState(shippingFees[0]?.id ?? '');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const items = cart.items ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.price_at_time) * i.quantity, 0);
  const selectedShippingFee = shippingFees.find((fee) => fee.id === selectedShippingFeeId);
  const shippingCost = Number(selectedShippingFee?.price ?? 0);
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!selectedAddr || !selectedShippingFeeId || !selectedPaymentMethodId) {
      toast(t('checkout.missingFields'), 'error');
      return;
    }

    setLoading(true);
    try {
      const order = await checkout({
        shipping_address_id: selectedAddr,
        billing_address_id: selectedAddr,
        shipping_fee_id: selectedShippingFeeId,
      });
      if (receipt && order?.id) {
        await submitPayment(order.id, receipt, selectedPaymentMethodId);
      }
      toast(t('checkout.success'), 'success');
      router.push(`/dashboard/orders/${order!.id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('checkout.failed'), 'error');
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
                <span className="text-primary-400 shrink-0">{formatCurrency(Number(fee.price))}</span>
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
          <h2 className="font-semibold text-white">{t('checkout.paymentBank')}</h2>
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
                    name="payment_method"
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
          <div className="flex justify-between text-lg font-bold text-primary-400">
            <span>{t('order.total')}</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div>
            <label className="label-dark">{t('checkout.uploadReceipt')}</label>
            <label
              htmlFor="receipt-upload"
              onClick={(e) => {
                if (!selectedPaymentMethodId) {
                  e.preventDefault();
                  toast(t('checkout.selectPaymentMethod'), 'error');
                }
              }}
              className={`inline-flex items-center justify-center py-2 px-4 rounded bg-primary-500 text-dark-950 font-medium cursor-pointer transition-opacity ${!selectedPaymentMethodId ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
            >
              {receipt ? receipt.name : t('checkout.uploadReceipt')}
            </label>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              disabled={!selectedPaymentMethodId}
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>{t('common.back')}</Button>
            <Button
              disabled={!receipt || !selectedPaymentMethodId}
              onClick={() => setStep(3)}
            >
              {t('common.continue')}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-white">{t('checkout.reviewOrder')}</h2>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-white/70">
                <span>{item.product?.title} × {item.quantity}</span>
                <span>{formatCurrency(Number(item.price_at_time) * item.quantity)}</span>
              </div>
            ))}
            {selectedShippingFee && (
              <div className="flex justify-between text-white/50 pt-2 border-t border-white/10">
                <span>
                  {t('cart.shipping')} ({selectedShippingFee.delivery_way} · {selectedShippingFee.duration})
                </span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary-400 pt-2">
              <span>{t('order.total')}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button disabled={loading} variant="outline" onClick={() => setStep(2)}>{t('common.back')}</Button>
            <Button onClick={handlePlaceOrder} disabled={loading}>
              {loading ? t('checkout.placing') : t('checkout.placeOrder')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
