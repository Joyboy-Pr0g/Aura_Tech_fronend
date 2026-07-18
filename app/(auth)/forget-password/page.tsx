import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default async function ForgotPasswordPage() {
  const user = await getSession();
  if (user) {
    redirect(user.role === 'customer' ? '/dashboard' : '/admin');
  }

  return <ForgotPasswordForm />;
}
