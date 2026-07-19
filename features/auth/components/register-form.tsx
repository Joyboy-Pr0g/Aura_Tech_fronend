'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Mail, UserPlus } from 'lucide-react';
import { createRegisterSchema, createSendEmailVerificationSchema, RegisterInput } from '@/features/auth/schemas/auth-schemas';
import {
  register as registerUser,
  sendRegistrationEmailVerification,
} from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { EmailVerificationModal } from '@/features/auth/components/email-verification-modal';
import { PasswordStrengthHint } from '@/features/auth/components/password-strength-hint';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/lib/i18n/locale-provider';
import { TurnstileField } from '@/components/security/turnstile-field';
import { useTurnstile } from '@/features/auth/hooks/use-turnstile';

export function RegisterForm() {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState('');
  const { enabled: turnstileEnabled, token: turnstileToken, setToken: setTurnstileToken, reset: resetTurnstile, registerReset, isReady: turnstileReady } = useTurnstile();
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  const emailFieldSchema = useMemo(() => createSendEmailVerificationSchema(t), [t]);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
    },
  });

  const watchedEmail = form.watch('email') ?? '';
  const watchedPassword = form.watch('password') ?? '';
  const watchedConfirmPassword = form.watch('confirm_password') ?? '';
  const normalizedEmail = watchedEmail.trim().toLowerCase();
  const emailIsValid = emailFieldSchema.shape.email.safeParse(watchedEmail).success;
  const emailIsVerified = verifiedEmail === normalizedEmail;

  const handleSendVerification = async () => {
    setError('');
    setSendingVerification(true);
    try {
      await sendRegistrationEmailVerification({ email: normalizedEmail });
      setVerifiedEmail(null);
      setVerificationModalOpen(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSendingVerification(false);
    }
  };

  const onSubmit = async (values: RegisterInput) => {
    setError('');

    if (verifiedEmail !== values.email.trim().toLowerCase()) {
      setError(t('auth.emailNotVerified'));
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setError(t('auth.turnstileRequired'));
      return;
    }

    try {
      await registerUser(values, turnstileToken);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      resetTurnstile();
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <Card className="border-white/10 shadow-2xl shadow-primary-500/5">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 border border-primary-500/30">
            <UserPlus className="h-6 w-6 text-primary-400" />
          </div>
          <CardTitle className="text-2xl">{t('auth.registerTitle')}</CardTitle>
          <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="error" className="mb-5">
              {error}
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('auth.fullName')}</Label>
              <Input
                id="full_name"
                placeholder={t('auth.fullNamePlaceholder')}
                error={!!form.formState.errors.full_name}
                {...form.register('full_name')}
              />
              {form.formState.errors.full_name && (
                <p className="text-xs text-danger">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    className="ps-10"
                    placeholder={t('auth.emailPlaceholder')}
                    error={!!form.formState.errors.email}
                    {...form.register('email', {
                      onChange: () => setVerifiedEmail(null),
                    })}
                  />
                </div>
                {emailIsValid && (
                  emailIsVerified ? (
                    <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-success/30 bg-success/10 px-3 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium hidden sm:inline">
                        {t('settings.verified')}
                      </span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 whitespace-nowrap"
                      disabled={sendingVerification}
                      onClick={handleSendVerification}
                    >
                      {sendingVerification ? t('settings.sendingCode') : t('settings.verifyEmail')}
                    </Button>
                  )
                )}
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
              )}
              {emailIsValid && !emailIsVerified && (
                <p className="text-xs text-white/40">{t('auth.verifyEmailHint')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.passwordHint')}
                error={!!form.formState.errors.password}
                {...form.register('password', {
                  onBlur: () => setPasswordFocused(false),
                })}
                onFocus={() => setPasswordFocused(true)}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
              )}
              <PasswordStrengthHint password={watchedPassword} visible={passwordFocused} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.passwordHint')}
                error={!!form.formState.errors.confirm_password}
                {...form.register('confirm_password', {
                  onBlur: () => setConfirmPasswordFocused(false),
                })}
                onFocus={() => setConfirmPasswordFocused(true)}
              />
              {form.formState.errors.confirm_password && (
                <p className="text-xs text-danger">{form.formState.errors.confirm_password.message}</p>
              )}
              <PasswordStrengthHint
                password={watchedPassword}
                confirmPassword={watchedConfirmPassword}
                showMatch
                visible={confirmPasswordFocused}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                error={!!form.formState.errors.phone}
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-danger">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <TurnstileField
              onTokenChange={setTurnstileToken}
              onResetReady={registerReset}
              className="pt-1"
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !emailIsVerified || !turnstileReady}
              className="w-full mt-2"
            >
              {form.formState.isSubmitting ? t('auth.creating') : t('auth.createAccount')}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm text-white/50 text-center">
            {t('auth.hasAccount')}{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              {t('auth.signIn')}
            </Link>
          </p>
        </CardFooter>
      </Card>

      <EmailVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        email={normalizedEmail}
        variant="register"
        onVerified={(email) => setVerifiedEmail(email.toLowerCase())}
      />
    </>
  );
}
