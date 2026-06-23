import { User } from '@/lib/types/entities';
import { LoginInput, RegisterInput } from '@/features/auth/schemas/auth-schemas';
import { clientFetch } from '@/lib/api/client';

interface AuthResponse {
  user: User;
}

export async function login(data: LoginInput): Promise<User> {
  const res = await clientFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  });
  return res.data!.user;
}

export async function register(data: RegisterInput): Promise<User> {
  const res = await clientFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: data,
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
