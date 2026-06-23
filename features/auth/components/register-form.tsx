'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/features/auth/schemas/auth-schemas';
import { register as registerUser } from '@/features/auth/services/auth-service';
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
import { UserPlus } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterInput) => {
    setError('');
    try {
      await registerUser(values);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card className="border-white/10 shadow-2xl shadow-primary-500/5">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 border border-primary-500/30">
          <UserPlus className="h-6 w-6 text-primary-400" />
        </div>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join AURA TECH and start shopping</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="error" className="mb-5">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              placeholder="Your full name"
              error={!!errors.full_name}
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-xs text-danger">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, upper, lower, digit"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+9677XXXXXXXX"
              error={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Separator />
        <p className="text-sm text-white/50 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
