'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLoginSchema, LoginInput } from '@/features/auth/schemas/auth-schemas';
import { login } from '@/features/auth/services/auth-service';
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
import { ShoppingBag } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { TurnstileField } from '@/components/security/turnstile-field';
import { useTurnstile } from '@/features/auth/hooks/use-turnstile';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [error, setError] = useState('');
  const { enabled: turnstileEnabled, token: turnstileToken, setToken: setTurnstileToken, reset: resetTurnstile, registerReset, isReady: turnstileReady } = useTurnstile();
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    setError('');

    if (turnstileEnabled && !turnstileToken) {
      setError(t('auth.turnstileRequired'));
      return;
    }

    try {
      const user = await login(values, turnstileToken);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(user.role === 'customer' ? '/dashboard' : '/admin');
      }
      router.refresh();
    } catch (err) {
      resetTurnstile();
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card className="border-white/10 shadow-2xl shadow-primary-500/5">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 border border-primary-500/30">
          <ShoppingBag className="h-6 w-6 text-primary-400" />
        </div>
        <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="error" className="mb-5">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Link
                href="/forget-password"
                className="text-xs text-primary-400 hover:text-primary-300 font-medium"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          <TurnstileField
            onTokenChange={setTurnstileToken}
            onResetReady={registerReset}
            className="pt-1"
          />

          <Button type="submit" disabled={isSubmitting || !turnstileReady} className="w-full mt-2">
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-white/50 text-center">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            {t('auth.createOne')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
