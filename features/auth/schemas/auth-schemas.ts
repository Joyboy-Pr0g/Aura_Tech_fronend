import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  full_name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .max(64)
    .regex(/[a-z]/, 'Need lowercase letter')
    .regex(/[A-Z]/, 'Need uppercase letter')
    .regex(/\d/, 'Need a number'),
  phone: z
    .string()
    .regex(
      /^(\+967|0)(7[0137]\d{7})$/,
      'Valid Yemeni mobile required (e.g. +9677XXXXXXXX or 07XXXXXXXX)',
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const passwordFieldSchema = z
  .string()
  .min(8, 'Min 8 characters')
  .max(64)
  .regex(/[a-z]/, 'Need lowercase letter')
  .regex(/[A-Z]/, 'Need uppercase letter')
  .regex(/\d/, 'Need a number');

export const updateProfileSchema = z.object({
  full_name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  email: z.string().email('Invalid email'),
  phone: z
    .string()
    .regex(
      /^(\+967|0)(7[0137]\d{7})$/,
      'Valid Yemeni mobile required (e.g. +9677XXXXXXXX or 07XXXXXXXX)',
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password required'),
    new_password: passwordFieldSchema,
    confirm_password: z.string().min(1, 'Confirm password required'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: 'New password must differ from current password',
    path: ['new_password'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const sendEmailVerificationSchema = z.object({
  email: z.string().email('Invalid email'),
});

export type SendEmailVerificationInput = z.infer<typeof sendEmailVerificationSchema>;

export const verifyEmailChangeSchema = z.object({
  email: z.string().email('Invalid email'),
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export type VerifyEmailChangeInput = z.infer<typeof verifyEmailChangeSchema>;
