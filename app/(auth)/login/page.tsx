import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/features/shared/components/ui/skeleton';

function LoginFormFallback() {
  return (
    <Card className="border-white/10">
      <CardContent className="p-8 space-y-4">
        <div className="flex flex-col items-center gap-3 mb-2">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default async function LoginPage() {
  const user = await getSession();
  if (user) {
    redirect(user.role === 'customer' ? '/dashboard' : '/admin');
  }

  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
