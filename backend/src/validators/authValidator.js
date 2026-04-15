/**
 * Auth Validators
 */
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numbers'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});
