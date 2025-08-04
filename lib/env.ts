import { z } from 'zod';

// This file is for SERVER-SIDE environment variables.
// For client-side variables, use `lib/env.client.ts`.

/**
 * Schema for build-time SERVER-ONLY environment variables.
 */
const buildEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  HCAPTCHA_SECRET_KEY: z.string().optional(),
});

/**
 * Schema for runtime-only environment variables.
 */
export const runtimeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

/**
 * Parsed and validated build-time SERVER-ONLY environment variables.
 */
export const env = buildEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
});

/**
 * Validates and returns runtime-only environment variables.
 * This function should be called on-demand within API routes.
 */
export function validateRuntimeEnv() {
  return runtimeEnvSchema.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  });
}