'use client';

import { useRef, useState } from 'react';
import { RefundRequest } from '@/lib/types/entities';
import { submitRefundRequest } from '@/features/refunds/services/refunds-client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { toast } from '@/components/ui/Toaster';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface OrderRefundModalProps {
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (request: RefundRequest) => void;
}

export function OrderRefundModal({
  orderNumber,
  open,
  onOpenChange,
  onSubmitted,
}: OrderRefundModalProps) {
  const { t } = useLocale();
  const [reason, setReason] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setReason('');
    setImage(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      toast(t('order.refundReasonRequired'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const request = await submitRefundRequest(orderNumber, reason.trim(), image);
      toast(t('order.refundSubmitted'), 'success');
      onSubmitted(request);
      handleOpenChange(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('order.refundFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent size="sm">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>{t('order.requestRefund')}</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">{t('order.refundReason')}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={2000}
                className="input-dark w-full resize-none"
                placeholder={t('order.refundReasonPlaceholder')}
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">{t('order.refundImageOptional')}</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload size={14} />
                {image ? image.name : t('order.refundUploadImage')}
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn-ghost" onClick={() => handleOpenChange(false)} disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('order.submitRefund')}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
