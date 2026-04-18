import { z } from 'zod';

// ===== Auth =====
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(72),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ===== Profile / Address =====
export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone must be at least 7 digits')
  .max(20, 'Phone too long')
  .regex(/^[+0-9 ()-]+$/, 'Invalid phone format');

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Label required').max(30),
  full_name: z.string().trim().min(2, 'Name required').max(80),
  phone: phoneSchema,
  address: z.string().trim().min(5, 'Address too short').max(200),
  city: z.string().trim().min(2, 'City required').max(80),
  is_default: z.boolean().optional(),
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.union([z.literal(''), phoneSchema]),
  address: z.union([z.literal(''), z.string().trim().max(200)]),
  city: z.union([z.literal(''), z.string().trim().max(80)]),
});

// ===== Checkout =====
export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Name required').max(80),
  phone: phoneSchema,
  address: z.string().trim().min(5, 'Address required').max(200),
  city: z.string().trim().min(2, 'City required').max(80),
  paymentMethod: z.enum(['cod']),
});

// ===== Review =====
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Please select a rating').max(5),
  comment: z.union([z.literal(''), z.string().trim().max(1000, 'Comment too long')]),
});

// ===== Helper =====
export function formatZodError(err: z.ZodError): string {
  return err.issues.map((e) => e.message).join('. ');
}
