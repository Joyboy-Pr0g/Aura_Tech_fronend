'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentMethod } from '@/lib/types/entities';
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
import {
  createAdminPaymentMethod,
  updateAdminPaymentMethod,
} from '@/features/admin/services/admin-payments-client';

const paymentMethodFormSchema = z.object({
  name: z.string().min(2).max(100),
  account_holder_name: z.string().min(2).max(100),
  bank_name: z.string().min(2).max(100),
  account_number: z.string().max(50).optional(),
  iban: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;

export type PaymentMethodFormMode =
  | { type: 'create' }
  | { type: 'edit'; method: PaymentMethod };

interface PaymentMethodFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PaymentMethodFormMode | null;
  onSuccess: () => void;
}

export function PaymentMethodFormModal({
  open,
  onOpenChange,
  mode,
  onSuccess,
}: PaymentMethodFormModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode?.type === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: '',
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      iban: '',
      description: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (!open || !mode) return;

    if (mode.type === 'create') {
      reset({
        name: '',
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        iban: '',
        description: '',
        is_active: true,
      });
      return;
    }

    reset({
      name: mode.method.name,
      account_holder_name: mode.method.account_holder_name,
      bank_name: mode.method.bank_name,
      account_number: mode.method.account_number ?? '',
      iban: mode.method.iban ?? '',
      description: mode.method.description ?? '',
      is_active: mode.method.is_active,
    });
  }, [open, mode, reset]);

  const onSubmit = async (values: PaymentMethodFormValues) => {
    if (!mode) return;

    const payload = {
      name: values.name.trim(),
      account_holder_name: values.account_holder_name.trim(),
      bank_name: values.bank_name.trim(),
      account_number: values.account_number?.trim() || undefined,
      iban: values.iban?.trim() || undefined,
      description: values.description?.trim() || undefined,
      ...(isEdit ? { is_active: values.is_active } : {}),
    };

    setSubmitting(true);
    try {
      if (mode.type === 'create') {
        await createAdminPaymentMethod(payload);
        toast(t('admin.paymentMethodCreated'), 'success');
      } else {
        await updateAdminPaymentMethod(mode.method.id, payload);
        toast(t('admin.paymentMethodUpdated'), 'success');
      }
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
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{isEdit ? t('admin.editPaymentMethod') : t('admin.addPaymentMethod')}</ModalTitle>
          <ModalDescription>
            {isEdit ? t('admin.editPaymentMethodDesc') : t('admin.addPaymentMethodDesc')}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pm-name">{t('admin.paymentMethodName')}</Label>
              <Input id="pm-name" {...register('name')} error={Boolean(errors.name)} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-holder">{t('admin.paymentMethodAccountHolder')}</Label>
              <Input
                id="pm-holder"
                {...register('account_holder_name')}
                error={Boolean(errors.account_holder_name)}
              />
              {errors.account_holder_name && (
                <p className="text-xs text-danger">{errors.account_holder_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-bank">{t('admin.paymentMethodBank')}</Label>
              <Input id="pm-bank" {...register('bank_name')} error={Boolean(errors.bank_name)} />
              {errors.bank_name && <p className="text-xs text-danger">{errors.bank_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-account">{t('admin.paymentMethodAccount')}</Label>
              <Input id="pm-account" {...register('account_number')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-iban">{t('admin.paymentMethodIban')}</Label>
              <Input id="pm-iban" {...register('iban')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pm-description">{t('admin.paymentMethodDescription')}</Label>
              <textarea
                id="pm-description"
                {...register('description')}
                rows={3}
                className="input-dark w-full resize-none"
              />
            </div>

            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive ?? true}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                  className="rounded border-white/20"
                />
                {t('admin.paymentMethodActive')}
              </label>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('admin.saving') : isEdit ? t('admin.saveChanges') : t('admin.create')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
