// ✅ Sign out route

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      logger.error('Sign out error:', error)
    } else {
      logger.info('User signed out successfully')
    }
    
    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url))
  } catch (error) {
    logger.error('Sign out exception:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}