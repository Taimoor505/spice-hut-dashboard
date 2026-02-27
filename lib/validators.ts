import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
});

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
});

export const callLogWebhookSchema = z.object({
  customer_name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  direction: z.preprocess(
    (value) => (typeof value === 'string' ? value.toLowerCase().trim() : value),
    z.enum(['inbound', 'outbound'])
  ),
  status: z.string().min(1).max(40),
  duration: z.coerce.number().int().min(0).max(10800),
  timestamp: z.string().datetime(),
  recording_url: z.string().url().optional().or(z.literal('')),
  transcription: z.string().min(1).max(30000),
  order_summary: z.string().max(3000).optional().or(z.literal('')),
  ai_confidence: z.coerce.number().min(0).max(1).optional()
});

export const menuItemSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  description: z.string().min(1).max(1000),
  price: z.coerce.number().min(0).max(99999),
  imageUrl: z.string().url().optional().or(z.literal('')),
  available: z.boolean()
});
