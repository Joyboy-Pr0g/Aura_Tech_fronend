'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Mail } from 'lucide-react';
import {
  createSendEmailVerificationSchema,
  SendEmailVerificationInput,
} from '@/features/auth/schemas/auth-schemas';
import { forgotPassword } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
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

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const schema = useMemo(() => createSendEmailVerificationSchema(t), [t]);

  const form = useForm<SendEmailVerificationInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: SendEmailVerificationInput) => {
    setError('');
    setSuccess(false);
    try {
      await forgotPassword(values);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card className="border-white/10 shadow-2xl shadow-primary-500/5">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 border border-primary-500/30">
          <KeyRound className="h-6 w-6 text-primary-400" />
        </div>
        <CardTitle className="text-2xl">{t('auth.forgotPasswordTitle')}</CardTitle>
        <CardDescription>{t('auth.forgotPasswordSubtitle')}</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="error" className="mb-5">
            {error}
          </Alert>
        )}

        {success ? (
          <Alert variant="success">{t('auth.forgotPasswordSuccess')}</Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  className="ps-10"
                  placeholder={t('auth.emailPlaceholder')}
                  error={!!form.formState.errors.email}
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full mt-2">
              {form.formState.isSubmitting
                ? t('auth.sendingReset')
                : t('auth.sendNewPassword')}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-white/50 text-center">
          <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            {t('auth.backToSignIn')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
