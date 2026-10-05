import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z.string().min(1, { message: 'Display Name is required' }).max(50),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+$/, { message: 'Username can only contain letters, numbers, dots, and hyphens' }),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one digit' }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
