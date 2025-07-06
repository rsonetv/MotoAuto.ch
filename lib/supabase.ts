import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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
