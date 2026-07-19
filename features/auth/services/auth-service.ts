import { User } from '@/lib/types/entities';
import {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
  SendEmailVerificationInput,
  VerifyEmailChangeInput,
} from '@/features/auth/schemas/auth-schemas';
import { clientFetch } from '@/lib/api/client';

interface AuthResponse {
  user: User;
}

export async function login(data: LoginInput, turnstileToken?: string | null): Promise<User> {
  const res = await clientFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { ...data, turnstileToken },
  });
  return res.data!.user;
}

export async function register(data: RegisterInput, turnstileToken?: string | null): Promise<User> {
  const { confirm_password: _confirmPassword, ...payload } = data;
  const res = await clientFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { ...payload, turnstileToken },
  });
  return res.data!.user;
}

export async function logout(): Promise<void> {
  await clientFetch('/api/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<User> {
  const res = await clientFetch<User>('/api/auth/me');
  return res.data!;
}

export async function updateProfile(data: UpdateProfileInput): Promise<User> {
  const res = await clientFetch<User>('/api/auth/me', {
    method: 'PATCH',
    body: data,
  });
  return res.data!;
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  await clientFetch('/api/auth/password', {
    method: 'PATCH',
    body: data,
  });
}

export async function sendEmailVerification(data: SendEmailVerificationInput): Promise<void> {
  await clientFetch('/api/auth/email-verification/send', {
    method: 'POST',
    body: data,
  });
}

export async function verifyEmailChange(data: VerifyEmailChangeInput): Promise<void> {
  await clientFetch('/api/auth/email-verification/verify', {
    method: 'POST',
    body: data,
  });
}

export async function sendRegistrationEmailVerification(
  data: SendEmailVerificationInput,
): Promise<void> {
  await clientFetch('/api/auth/registration/email-verification/send', {
    method: 'POST',
    body: data,
  });
}

export async function verifyRegistrationEmail(data: VerifyEmailChangeInput): Promise<void> {
  await clientFetch('/api/auth/registration/email-verification/verify', {
    method: 'POST',
    body: data,
  });
}

export async function forgotPassword(data: SendEmailVerificationInput): Promise<void> {
  await clientFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: data,
  });
}
