import { z } from 'zod';

/** Body schema shared by register and login. */
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must be at most 72 characters long'),
});

export const registerSchema = z.object({
  body: credentialsSchema,
});

export const loginSchema = z.object({
  body: credentialsSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
