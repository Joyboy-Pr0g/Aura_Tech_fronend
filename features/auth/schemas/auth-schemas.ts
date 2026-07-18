import { z } from 'zod';

export type SchemaTranslate = (key: string) => string;

export function createLoginSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export function createRegisterSchema(t: SchemaTranslate) {
  return z
    .object({
      full_name: z.string().min(3, t('validation.nameMin3')).max(50),
      email: z.string().email(t('validation.invalidEmail')),
      password: createPasswordFieldSchema(t),
      confirm_password: z.string().min(1, t('validation.confirmPasswordRequired')),
      phone: z.string().regex(/^(\+967|0)(7[0137]\d{7})$/, t('validation.yemeniMobile')),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: t('validation.passwordsNoMatch'),
      path: ['confirm_password'],
    });
}

export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

function createPasswordFieldSchema(t: SchemaTranslate) {
  return z
    .string()
    .min(8, t('validation.min8Chars'))
    .max(64)
    .regex(/[a-z]/, t('validation.needLowercase'))
    .regex(/[A-Z]/, t('validation.needUppercase'))
    .regex(/\d/, t('validation.needNumber'));
}

export function createUpdateProfileSchema(t: SchemaTranslate) {
  return z.object({
    full_name: z.string().min(3, t('validation.nameMin3')).max(50),
    email: z.string().email(t('validation.invalidEmail')),
    phone: z.string().regex(/^(\+967|0)(7[0137]\d{7})$/, t('validation.yemeniMobile')),
  });
}

export type UpdateProfileInput = z.infer<ReturnType<typeof createUpdateProfileSchema>>;

export function createChangePasswordSchema(t: SchemaTranslate) {
  return z
    .object({
      current_password: z.string().min(1, t('validation.currentPasswordRequired')),
      new_password: createPasswordFieldSchema(t),
      confirm_password: z.string().min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t('validation.passwordsNoMatch'),
      path: ['confirm_password'],
    })
    .refine((data) => data.new_password !== data.current_password, {
      message: t('validation.passwordMustDiffer'),
      path: ['new_password'],
    });
}

export type ChangePasswordInput = z.infer<ReturnType<typeof createChangePasswordSchema>>;

export function createSendEmailVerificationSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().email(t('validation.invalidEmail')),
  });
}

export type SendEmailVerificationInput = z.infer<ReturnType<typeof createSendEmailVerificationSchema>>;

export function createVerifyEmailChangeSchema(t: SchemaTranslate) {
  return z.object({
    email: z.string().email(t('validation.invalidEmail')),
    code: z
      .string()
      .length(6, t('validation.code6Digits'))
      .regex(/^\d{6}$/, t('validation.code6Digits')),
  });
}

export type VerifyEmailChangeInput = z.infer<ReturnType<typeof createVerifyEmailChangeSchema>>;
