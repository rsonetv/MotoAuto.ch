import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Use default values for build time, but these should be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-service-key"

// Create a mock client for build time
class MockSupabaseAdmin {
  auth = {
    getUser: () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
    autoRefreshToken: false,
    persistSession: false,
  };
  
  from(table: string) {
    return {
      select: () => this,
      eq: () => this,
      single: () => ({ data: { is_dealer: true }, error: null }),
    };
  }
  
  rpc(func: string, params?: any) {
    return { data: true, error: null };
  }
}

// Admin client with service role key for server-side operations
export const supabaseAdmin = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview'
  ? new MockSupabaseAdmin() as any
  : createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
