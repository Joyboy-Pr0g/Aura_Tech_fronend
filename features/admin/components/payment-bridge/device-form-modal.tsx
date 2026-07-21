'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentDevice } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  registerAdminPaymentDevice,
  updateAdminPaymentDevice,
} from '@/features/admin/services/admin-payment-bridge-client';

export type DeviceFormMode =
  | { type: 'register' }
  | { type: 'edit'; device: PaymentDevice };

interface DeviceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DeviceFormMode | null;
  onSuccess: () => void;
  onRegistered: (apiKey: string) => void;
}

export function DeviceFormModal({
  open,
  onOpenChange,
  mode,
  onSuccess,
  onRegistered,
}: DeviceFormModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode?.type === 'edit';

  const schema = useMemo(
    () =>
      z.object({
        device_uuid: isEdit
          ? z.string().optional()
          : z.string().uuid(t('admin.paymentBridgeInvalidUuid')),
        label: z.string().max(100).optional().or(z.literal('')),
        enabled: z.boolean().optional(),
      }),
    [isEdit, t],
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { device_uuid: '', label: '', enabled: true },
  });

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.type === 'edit') {
      form.reset({
        label: mode.device.label ?? '',
        enabled: mode.device.enabled,
      });
    } else {
      form.reset({ device_uuid: '', label: '', enabled: true });
    }
  }, [open, mode, form]);

  const onSubmit = async (values: FormValues) => {
    if (!mode) return;
    setSubmitting(true);
    try {
      if (mode.type === 'register') {
        const result = await registerAdminPaymentDevice({
          device_uuid: values.device_uuid!.trim(),
          label: values.label?.trim() || null,
        });
        onOpenChange(false);
        onRegistered(result.api_key);
      } else {
        await updateAdminPaymentDevice(mode.device.id, {
          label: values.label?.trim() || null,
          enabled: values.enabled,
        });
        onOpenChange(false);
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle>
              {isEdit ? t('admin.paymentBridgeEditDevice') : t('admin.paymentBridgeRegisterDevice')}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="device_uuid">{t('admin.paymentBridgeDeviceUuid')}</Label>
                <Input
                  id="device_uuid"
                  className="input-dark font-mono text-sm"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  error={Boolean(form.formState.errors.device_uuid)}
                  {...form.register('device_uuid')}
                />
                {form.formState.errors.device_uuid && (
                  <p className="text-xs text-danger">{form.formState.errors.device_uuid.message}</p>
                )}
                <p className="text-xs text-white/40">{t('admin.paymentBridgeDeviceUuidHint')}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="device_label">{t('admin.paymentBridgeDeviceLabel')}</Label>
              <Input id="device_label" className="input-dark" {...form.register('label')} />
            </div>
            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="checkbox" className="rounded" {...form.register('enabled')} />
                {t('admin.paymentBridgeDeviceEnabled')}
              </label>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('admin.saving') : isEdit ? t('common.save') : t('admin.paymentBridgeRegisterDevice')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
