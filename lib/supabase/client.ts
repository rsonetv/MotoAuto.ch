// ✅ Client-side Supabase client configuration

import { createBrowserClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { clientEnv } from '@/lib/env.client'

export function createClient() {
  const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log the Supabase URL to confirm which environment is being used.
  logger.info(`Initializing Supabase client for URL: ${supabaseUrl}`)

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}