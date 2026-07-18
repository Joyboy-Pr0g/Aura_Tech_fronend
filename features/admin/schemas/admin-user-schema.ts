import { z } from 'zod';
import type { SchemaTranslate } from '@/features/auth/schemas/auth-schemas';

const adminRoles = ['admin', 'sub_admin', 'customer'] as const;

function createPasswordFieldSchema(t: SchemaTranslate) {
  return z
    .string()
    .min(8, t('validation.min8Chars'))
    .max(64)
    .regex(/[a-z]/, t('validation.needLowercase'))
    .regex(/[A-Z]/, t('validation.needUppercase'))
    .regex(/\d/, t('validation.needNumber'));
}

export function createAdminUserSchema(t: SchemaTranslate) {
  return z.object({
    full_name: z.string().min(3, t('validation.nameMin3')).max(50),
    email: z.string().email(t('validation.invalidEmail')),
    password: createPasswordFieldSchema(t),
    phone: z.string().regex(/^(\+967|0)(7[0137]\d{7})$/, t('validation.yemeniMobile')),
    role: z.enum(adminRoles, { required_error: t('validation.roleRequired') }),
  });
}

export type AdminUserFormValues = z.infer<ReturnType<typeof createAdminUserSchema>>;
