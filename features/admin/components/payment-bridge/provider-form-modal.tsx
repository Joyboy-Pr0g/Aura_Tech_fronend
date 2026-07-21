'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentProvider } from '@/lib/types/entities';
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
  createAdminPaymentProvider,
  updateAdminPaymentProvider,
} from '@/features/admin/services/admin-payment-bridge-client';

export type ProviderFormMode =
  | { type: 'create' }
  | { type: 'edit'; provider: PaymentProvider };

interface ProviderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ProviderFormMode | null;
  onSuccess: () => void;
}

function parseAliases(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatAliases(aliases: string[]): string {
  return aliases.join('\n');
}

export function ProviderFormModal({ open, onOpenChange, mode, onSuccess }: ProviderFormModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode?.type === 'edit';

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('admin.paymentBridgeProviderNameMin')).max(50),
        aliasesText: z.string().optional(),
        is_active: z.boolean(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', aliasesText: '', is_active: true },
  });

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.type === 'edit') {
      form.reset({
        name: mode.provider.name,
        aliasesText: formatAliases(mode.provider.aliases),
        is_active: mode.provider.is_active,
      });
    } else {
      form.reset({ name: '', aliasesText: '', is_active: true });
    }
  }, [open, mode, form]);

  const onSubmit = async (values: FormValues) => {
    if (!mode) return;
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim().toLowerCase(),
        aliases: parseAliases(values.aliasesText ?? ''),
        is_active: values.is_active,
      };
      if (mode.type === 'edit') {
        await updateAdminPaymentProvider(mode.provider.id, payload);
      } else {
        await createAdminPaymentProvider(payload);
      }
      onOpenChange(false);
      onSuccess();
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
              {isEdit ? t('admin.paymentBridgeEditProvider') : t('admin.paymentBridgeAddProvider')}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider_name">{t('admin.paymentBridgeProviderName')}</Label>
              <Input
                id="provider_name"
                className="input-dark"
                error={Boolean(form.formState.errors.name)}
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider_aliases">{t('admin.paymentBridgeProviderAliases')}</Label>
              <textarea
                id="provider_aliases"
                rows={4}
                className="input-dark w-full resize-none font-mono text-sm"
                placeholder={t('admin.paymentBridgeProviderAliasesPlaceholder')}
                {...form.register('aliasesText')}
              />
              <p className="text-xs text-white/40">{t('admin.paymentBridgeProviderAliasesHint')}</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" className="rounded" {...form.register('is_active')} />
              {t('admin.active')}
            </label>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('admin.saving') : t('common.save')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
