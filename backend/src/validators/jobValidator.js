/**
 * Job Validators
 */
import { z } from 'zod';

const platformEnum = z.enum(['TopCV', 'LinkedIn', 'ITviec', 'Custom']);

export const createJobSearchSchema = z.object({
  prompt: z.string().trim().min(5, 'Prompt must be at least 5 characters').max(500, 'Prompt is too long'),
  platforms: z.array(platformEnum).min(1, 'Select at least 1 platform').max(4, 'Too many platforms selected'),
  maxResults: z.number().int().min(5).max(50).default(20),
  location: z.string().trim().max(100).optional(),
});
