'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShippingFee } from '@/lib/types/entities';
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
  createAdminShippingFee,
  updateAdminShippingFee,
} from '@/features/admin/services/admin-shipping-fees-client';

const shippingFeeFormSchema = z.object({
  price: z.coerce.number().min(0),
  duration: z.string().min(1).max(100),
  delivery_way: z.string().min(1).max(100),
  is_active: z.boolean().optional(),
});

type ShippingFeeFormValues = z.infer<typeof shippingFeeFormSchema>;

export type ShippingFeeFormMode =
  | { type: 'create' }
  | { type: 'edit'; fee: ShippingFee };

interface ShippingFeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ShippingFeeFormMode | null;
  onSuccess: () => void;
}

export function ShippingFeeFormModal({
  open,
  onOpenChange,
  mode,
  onSuccess,
}: ShippingFeeFormModalProps) {
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
  } = useForm<ShippingFeeFormValues>({
    resolver: zodResolver(shippingFeeFormSchema),
    defaultValues: {
      price: 0,
      duration: '',
      delivery_way: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.type === 'edit') {
      reset({
        price: Number(mode.fee.price),
        duration: mode.fee.duration,
        delivery_way: mode.fee.delivery_way,
        is_active: mode.fee.is_active,
      });
    } else {
      reset({ price: 0, duration: '', delivery_way: '', is_active: true });
    }
  }, [open, mode, reset]);

  const onSubmit = async (values: ShippingFeeFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && mode?.type === 'edit') {
        await updateAdminShippingFee(mode.fee.id, values);
        toast(t('admin.shippingFeeUpdated'), 'success');
      } else {
        await createAdminShippingFee(values);
        toast(t('admin.shippingFeeCreated'), 'success');
      }
      onSuccess();
      onOpenChange(false);
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
          <ModalTitle>
            {isEdit ? t('admin.editShippingFee') : t('admin.addShippingFee')}
          </ModalTitle>
          <ModalDescription>
            {isEdit ? t('admin.editShippingFeeDesc') : t('admin.addShippingFeeDesc')}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('admin.shippingFeePrice')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                error={!!errors.price}
                {...register('price')}
              />
              {errors.price && <p className="text-xs text-danger">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">{t('admin.shippingFeeDuration')}</Label>
              <Input
                id="duration"
                placeholder={t('admin.shippingFeeDurationPlaceholder')}
                error={!!errors.duration}
                {...register('duration')}
              />
              {errors.duration && <p className="text-xs text-danger">{errors.duration.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_way">{t('admin.shippingFeeDeliveryWay')}</Label>
              <Input
                id="delivery_way"
                placeholder={t('admin.shippingFeeDeliveryWayPlaceholder')}
                error={!!errors.delivery_way}
                {...register('delivery_way')}
              />
              {errors.delivery_way && (
                <p className="text-xs text-danger">{errors.delivery_way.message}</p>
              )}
            </div>

            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={!!isActive}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
                {t('admin.active')}
              </label>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
