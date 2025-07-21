import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// --- Singleton pattern (client-side) ---------------------------------
let _supabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true } },
    )
  }
  return _supabase
}

// Named export to match existing imports
export const supabase = getSupabaseClient()
