import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
}

/**
 * Admin client with service role key for server-side operations
 * This client bypasses Row Level Security (RLS) policies
 * NEVER expose this client or the service role key to the browser!
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Utility function to verify admin client is working
 */
export async function verifyAdminConnection() {
  try {
    const { data, error } = await supabaseAdmin.from("profiles").select("count").limit(1)
    if (error) {
      console.error("Admin connection verification failed:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Admin connection error:", error)
    return false
  }
}
