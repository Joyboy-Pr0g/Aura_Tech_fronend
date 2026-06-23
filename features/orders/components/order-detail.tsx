'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, PaymentMethod } from '@/lib/types/entities';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { submitPayment } from '@/features/cart/services/cart-client';
import { Upload, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface OrderDetailProps {
  order: Order;
  paymentMethods: PaymentMethod[];
}

export function OrderDetail({ order, paymentMethods }: OrderDetailProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const payment = order.payment;
  const canSubmitPayment = order.status === 'pending_payment' && (!payment || payment.status === 'rejected');

  const handleSubmitPayment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await submitPayment(order.id, file);
      toast('Receipt uploaded successfully!', 'success');
      router.refresh();
    } catch {
      toast('Failed to upload receipt', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">{order.order_number}</h2>
        <p className="text-white/40 mt-1">{formatDateTime(order.created_at)}</p>
      </div>

      <div className="card-dark p-5 flex items-center justify-between">
        <span className="text-white/60 text-sm">Order Status</span>
        <span className={cn('font-semibold', ORDER_STATUS_COLORS[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="card-dark p-5 space-y-4">
        <h3 className="font-semibold text-white">Items</h3>
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm text-white">{item.product?.title ?? 'Product'}</p>
              <p className="text-xs text-white/40">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
            </div>
            <p className="font-semibold text-white">{formatCurrency(item.total_price)}</p>
          </div>
        ))}
        <div className="border-t border-white/10 pt-3 flex justify-between">
          <span className="font-bold text-white">Total</span>
          <span className="font-bold text-primary-400 text-lg">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {payment && (
        <div className="card-dark p-5 space-y-2">
          <h3 className="font-semibold text-white mb-3">Payment</h3>
          <div className="flex items-center gap-2">
            {payment.status === 'approved' && <CheckCircle2 size={18} className="text-success" />}
            {payment.status === 'rejected' && <XCircle size={18} className="text-danger" />}
            {payment.status === 'pending' && <Clock size={18} className="text-warning" />}
            <span className={cn('text-sm font-medium badge', PAYMENT_STATUS_COLORS[payment.status])}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </span>
          </div>
          {payment.rejection_reason && (
            <p className="text-sm text-danger/80 bg-danger/10 rounded-lg px-3 py-2 mt-2">
              Rejected: {payment.rejection_reason}
            </p>
          )}
        </div>
      )}

      {canSubmitPayment && (
        <div className="card-dark p-5 space-y-4">
          <h3 className="font-semibold text-white">Pay via Bank Transfer</h3>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((m) => (
                <div key={m.id} className="bg-dark-800 rounded-lg p-4 space-y-1">
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-sm text-white/60">Bank: {m.bank_name}</p>
                  {m.account_number && <p className="text-sm text-white/60">Account: {m.account_number}</p>}
                  {m.iban && <p className="text-sm text-white/60">IBAN: {m.iban}</p>}
                  {m.description && <p className="text-xs text-white/40 mt-1">{m.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm">No payment methods configured yet</p>
          )}

          <div>
            <p className="text-sm text-white/60 mb-3">
              Transfer <span className="text-primary-400 font-bold">{formatCurrency(order.total)}</span> and upload your receipt:
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
              className="btn-primary flex items-center gap-2"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
