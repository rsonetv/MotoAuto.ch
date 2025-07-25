import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a mock client
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "preview") {
      return null
    }
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Create a single supabase client for interacting with your database
export const supabase = createSupabaseClient()

/**
 * Client-side helper (App Router client component usage).
 */
export function createClientComponentClient() {
  return supabase
}

/**
 * Server-side helper (React Server Component / Route Handler usage).
 */
export function createServerComponentClient() {
  return supabase
}
