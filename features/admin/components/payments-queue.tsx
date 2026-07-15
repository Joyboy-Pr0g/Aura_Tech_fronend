'use client';

import { useEffect, useState, useTransition } from 'react';
import { Payment } from '@/lib/types/entities';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toaster';
import { getPendingPayments, approvePayment, rejectPayment } from '@/features/cart/services/cart-client';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

export function PaymentsQueue() {
  const { t } = useLocale();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const data = await getPendingPayments();
      setPayments(data.items);
      setTotal(data.items.length);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await approvePayment(id);
      toast(t('admin.paymentApproved'), 'success');
      load();
    } catch {
      toast(t('admin.approveFailed'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !reason.trim()) return;
    setActionId(rejectModal.id);
    try {
      await rejectPayment(rejectModal.id, reason);
      toast(t('admin.paymentRejected'), 'info');
      setRejectModal(null);
      setReason('');
      load();
    } catch {
      toast(t('admin.rejectFailed'), 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.paymentQueue')}</h2>
          <p className="text-white/40 mt-1">{t('admin.pendingCount', { count: total })}</p>
        </div>
        <button onClick={load} disabled={isPending} className="btn-outline">
          {isPending ? t('admin.refreshing') : t('admin.refresh')}
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <CheckCircle2 size={48} className="text-success/30 mx-auto mb-4" />
          <p className="text-white/50">{t('admin.queueEmpty')}</p>
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
          {payments.map((p) => (
            <div key={p.id} className="card-dark p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    Order #{(p as Payment & { order?: { order_number: string } }).order?.order_number ?? p.order_id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-white/40">
                    {t('admin.customer')}: {p.submitted_by_customer?.email ?? t('admin.unknown')}
                  </p>
                  <p className="text-sm text-white/40">{t('admin.submitted')}: {formatDateTime(p.submitted_at)}</p>
                  <p className="text-lg font-bold text-primary-400">{formatCurrency(p.amount)}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {p.receipt_document_url && (
                    <a
                      href={p.receipt_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline flex items-center gap-2 text-sm py-1.5"
                    >
                      <ExternalLink size={14} />
                      {t('admin.viewReceipt')}
                    </a>
                  )}

                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={actionId === p.id}
                    className="btn-primary flex items-center gap-2 text-sm py-1.5"
                  >
                    <CheckCircle2 size={15} />
                    {t('admin.approve')}
                  </button>

                  <button
                    onClick={() => { setRejectModal({ id: p.id }); setReason(''); }}
                    disabled={actionId === p.id}
                    className="btn-danger flex items-center gap-2 text-sm py-1.5"
                  >
                    <XCircle size={15} />
                    {t('admin.reject')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="card-dark p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-white text-lg">{t('admin.rejectTitle')}</h3>
            <p className="text-white/60 text-sm">{t('admin.rejectHint')}</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-dark resize-none h-24"
              placeholder={t('admin.rejectPlaceholder')}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!reason.trim() || !!actionId}
                className="btn-danger flex-1"
              >
                {t('admin.confirmReject')}
              </button>
              <button onClick={() => setRejectModal(null)} className="btn-outline flex-1">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
