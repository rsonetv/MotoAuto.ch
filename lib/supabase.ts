import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "example-anon-key"

// Create a mock client for build time
class MockSupabase {
  auth = {
    signUp: () => ({ data: {}, error: null }),
    signInWithPassword: () => ({ data: {}, error: null }),
    signOut: () => ({ error: null }),
    getUser: () => ({ data: { user: null }, error: null }),
    updateUser: () => ({ data: {}, error: null }),
    onAuthStateChange: (callback: any) => {
      callback('SIGNED_OUT', null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };
  
  from() {
    return {
      select: () => this,
      insert: () => this,
      update: () => this,
      delete: () => this,
      eq: () => this,
      neq: () => this,
      gt: () => this,
      lt: () => this,
      gte: () => this,
      lte: () => this,
      like: () => this,
      ilike: () => this,
      is: () => this,
      in: () => this,
      contains: () => this,
      containedBy: () => this,
      rangeGt: () => this,
      rangeLt: () => this,
      rangeGte: () => this,
      rangeLte: () => this,
      textSearch: () => this,
      filter: () => this,
      or: () => this,
      and: () => this,
      not: () => this,
      match: () => this,
      single: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null }),
      order: () => this,
      limit: () => this,
      range: () => this,
      then: () => Promise.resolve({ data: [], error: null }),
    };
  }
  
  rpc() {
    return { data: null, error: null };
  }
}

// Create a single supabase client for interacting with your database
export const supabase = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview'
  ? new MockSupabase() as any
  : createClient<Database>(supabaseUrl, supabaseAnonKey)

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
