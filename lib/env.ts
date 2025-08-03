import { z } from 'zod';

/**
 * Schema for environment variables.
 * Ensures all required variables are defined and have the correct format.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // Other
  NEXT_PUBLIC_APP_URL: z.string().url(),
  HCAPTCHA_SECRET_KEY: z.string().optional(),
});

/**
 * Parsed and validated environment variables.
 * This object should be used throughout the application instead of `process.env`.
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
});