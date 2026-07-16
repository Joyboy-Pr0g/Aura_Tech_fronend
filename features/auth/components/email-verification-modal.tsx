'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  verifyEmailChangeSchema,
  VerifyEmailChangeInput,
} from '@/features/auth/schemas/auth-schemas';
import {
  sendEmailVerification,
  verifyEmailChange,
} from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { toast } from '@/components/ui/Toaster';

interface EmailVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerified: (email: string) => void;
}

export function EmailVerificationModal({
  open,
  onOpenChange,
  email,
  onVerified,
}: EmailVerificationModalProps) {
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const form = useForm<VerifyEmailChangeInput>({
    resolver: zodResolver(verifyEmailChangeSchema),
    defaultValues: { email, code: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ email, code: '' });
      setError('');
    }
  }, [open, email, form]);

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await sendEmailVerification({ email });
      toast(t('settings.verificationSent'), 'success');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (values: VerifyEmailChangeInput) => {
    setError('');
    try {
      await verifyEmailChange(values);
      toast(t('settings.emailVerified'), 'success');
      onVerified(email);
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{t('settings.verifyEmailTitle')}</ModalTitle>
          <ModalDescription>
            {t('settings.verifyEmailDescription', { email })}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="space-y-2">
              <Label htmlFor="verification_code">{t('settings.verificationCode')}</Label>
              <Input
                id="verification_code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="tracking-[0.35em] text-center font-mono text-lg"
                error={!!form.formState.errors.code}
                {...form.register('code')}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-danger">{form.formState.errors.code.message}</p>
              )}
            </div>

            <p className="text-xs text-white/40">{t('settings.verificationCodeHint')}</p>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={resending}
              onClick={handleResend}
            >
              {resending ? t('settings.sendingCode') : t('settings.resendCode')}
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? t('settings.verifying')
                : t('settings.confirmVerification')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
