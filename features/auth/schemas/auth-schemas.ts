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
