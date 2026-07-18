'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createVerifyEmailChangeSchema,
  VerifyEmailChangeInput,
} from '@/features/auth/schemas/auth-schemas';
import {
  sendEmailVerification,
  verifyEmailChange,
  sendRegistrationEmailVerification,
  verifyRegistrationEmail,
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

const RESEND_COOLDOWN_SECONDS = 120;

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface EmailVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerified: (email: string) => void;
  variant?: 'profile' | 'register';
}

export function EmailVerificationModal({
  open,
  onOpenChange,
  email,
  onVerified,
  variant = 'profile',
}: EmailVerificationModalProps) {
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const verifyEmailChangeSchema = useMemo(() => createVerifyEmailChangeSchema(t), [t]);

  const form = useForm<VerifyEmailChangeInput>({
    resolver: zodResolver(verifyEmailChangeSchema),
    defaultValues: { email, code: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ email, code: '' });
      setError('');
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    }
  }, [open, email, form]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timerId = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [cooldownSeconds]);

  const canResend = cooldownSeconds === 0 && !resending;

  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    setResending(true);
    try {
      if (variant === 'register') {
        await sendRegistrationEmailVerification({ email });
      } else {
        await sendEmailVerification({ email });
      }
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
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
      if (variant === 'register') {
        await verifyRegistrationEmail(values);
      } else {
        await verifyEmailChange(values);
      }
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
          <ModalTitle>
            {variant === 'register' ? t('auth.verifyEmailTitle') : t('settings.verifyEmailTitle')}
          </ModalTitle>
          <ModalDescription>
            {variant === 'register'
              ? t('auth.verifyEmailDescription', { email })
              : t('settings.verifyEmailDescription', { email })}
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
                placeholder={t('validation.verificationCodePlaceholder')}
                className="tracking-[0.35em] text-center font-mono text-lg"
                error={!!form.formState.errors.code}
                {...form.register('code')}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-danger">{form.formState.errors.code.message}</p>
              )}
            </div>

            <p className="text-xs text-white/40">{t('settings.verificationCodeHint')}</p>
            {cooldownSeconds > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/50">
                    {t('settings.resendCodeTimer', { time: formatCooldown(cooldownSeconds) })}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-primary-400">
                    {formatCooldown(cooldownSeconds)}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={RESEND_COOLDOWN_SECONDS}
                  aria-valuenow={RESEND_COOLDOWN_SECONDS - cooldownSeconds}
                  aria-label={t('settings.resendCodeTimer', { time: formatCooldown(cooldownSeconds) })}
                >
                  <div
                    className="h-full rounded-full bg-primary-500 shadow-[0_0_12px_rgba(0,217,255,0.45)] transition-[width] duration-1000 ease-linear"
                    style={{
                      width: `${((RESEND_COOLDOWN_SECONDS - cooldownSeconds) / RESEND_COOLDOWN_SECONDS) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canResend}
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
