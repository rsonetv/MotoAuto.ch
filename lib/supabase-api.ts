// This file provides the createServerClient function for use in API routes
// It follows the pattern used in Supabase SSR examples

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * This function creates a Supabase client specifically for API routes.
 * Pass the request and response objects for proper cookie handling.
 */
export async function createServerComponentClient(req?: NextRequest, res?: NextResponse) {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          // Get from request if provided
          if (req?.cookies.has(name)) {
            return req.cookies.get(name)?.value
          }
          return undefined
        },
        set(name, value, options) {
          // Set in response if provided
          if (res) {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          }
        },
        remove(name, options) {
          // Remove from response if provided
          if (res) {
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          }
        },
      },
    }
  )
}
