'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { createAdminManualPayment } from '@/features/admin/services/admin-payments-client';

const manualPaymentSchema = z.object({
  order_number: z.string().trim().min(3).max(50),
  amount: z.coerce.number().positive(),
});

type ManualPaymentFormValues = z.infer<typeof manualPaymentSchema>;

interface RecordManualPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecordManualPaymentModal({
  open,
  onOpenChange,
  onSuccess,
}: RecordManualPaymentModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualPaymentFormValues>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: { order_number: '', amount: undefined },
  });

  const onSubmit = async (values: ManualPaymentFormValues) => {
    setSubmitting(true);
    try {
      await createAdminManualPayment({
        order_number: values.order_number.trim(),
        amount: values.amount,
      });
      toast(t('admin.manualPaymentCreated'), 'success');
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="bg-dark-900 border-white/10">
        <ModalHeader>
          <ModalTitle>{t('admin.recordManualPayment')}</ModalTitle>
          <ModalDescription>{t('admin.recordManualPaymentDesc')}</ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">{t('admin.orderNumber')}</Label>
              <Input
                id="order_number"
                className="input-dark font-mono"
                placeholder={t('admin.orderNumberPlaceholder')}
                {...register('order_number')}
              />
              {errors.order_number && (
                <p className="text-sm text-danger">{errors.order_number.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t('admin.paymentAmount')}</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="input-dark"
                {...register('amount')}
              />
              {errors.amount && <p className="text-sm text-danger">{errors.amount.message}</p>}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('admin.recordPayment')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
