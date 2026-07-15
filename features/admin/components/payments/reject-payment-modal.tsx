'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { rejectAdminPayment } from '@/features/admin/services/admin-payments-client';

interface RejectPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string | null;
  onSuccess: () => void;
}

export function RejectPaymentModal({
  open,
  onOpenChange,
  paymentId,
  onSuccess,
}: RejectPaymentModalProps) {
  const { t } = useLocale();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('');
    onOpenChange(next);
  };

  const handleReject = async () => {
    if (!paymentId || !reason.trim()) return;

    setSubmitting(true);
    try {
      await rejectAdminPayment(paymentId, reason.trim());
      toast(t('admin.paymentRejected'), 'info');
      handleOpenChange(false);
      onSuccess();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.rejectFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{t('admin.rejectTitle')}</ModalTitle>
          <ModalDescription>{t('admin.rejectHint')}</ModalDescription>
        </ModalHeader>

        <ModalBody>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input-dark resize-none h-24 w-full"
            placeholder={t('admin.rejectPlaceholder')}
            autoFocus
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            {t('admin.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleReject}
            disabled={!reason.trim() || submitting}
          >
            {submitting ? t('admin.saving') : t('admin.confirmReject')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
