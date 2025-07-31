// ✅ Client-side Supabase client configuration

import { createBrowserClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log the Supabase URL to confirm which environment is being used.
  logger.info(`Initializing Supabase client for URL: ${supabaseUrl}`)

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}