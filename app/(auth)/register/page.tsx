import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { RegisterForm } from '@/features/auth/components/register-form';

export default async function RegisterPage() {
  const user = await getSession();
  if (user) {
    redirect(user.role === 'customer' ? '/dashboard' : '/admin');
  }

  return <RegisterForm />;
}
