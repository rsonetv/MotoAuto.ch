import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { EmailPreferences, EmailPreferenceUpdate } from '@/lib/database/email.types'

/**
 * GET /api/email/preferences
 * Get user's email preferences
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    try {
      // Get user's email preferences
      const { data: preferences, error } = await supabaseAdmin
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Failed to get email preferences:', error)
        return NextResponse.json(
          { error: 'Failed to get email preferences' },
          { status: 500 }
        )
      }

      // If no preferences exist, create default ones
      if (!preferences) {
        const defaultPreferences: Partial<EmailPreferences> = {
          user_id: user.id,
          // Auction notifications - enabled by default
          auction_notifications: true,
          outbid_notifications: true,
          auction_ending_notifications: true,
          auction_won_notifications: true,
          auction_extended_notifications: true,
          
          // Watchlist notifications - enabled by default
          watchlist_notifications: true,
          watchlist_updates: true,
          watchlist_ending_soon: true,
          
          // Account notifications - enabled by default
          account_notifications: true,
          registration_confirmations: true,
          password_reset_notifications: true,
          profile_update_notifications: true,
          security_notifications: true,
          
          // Payment notifications - enabled by default
          payment_notifications: true,
          payment_confirmations: true,
          invoice_notifications: true,
          refund_notifications: true,
          commission_notifications: true,
          
          // Contact notifications - enabled by default
          contact_notifications: true,
          contact_confirmations: true,
          contact_responses: true,
          listing_inquiries: true,
          
          // Marketing notifications - disabled by default (requires explicit consent)
          marketing_notifications: false,
          newsletter_subscription: false,
          promotional_emails: false,
          feature_announcements: false,
          
          // Frequency settings
          notification_frequency: 'immediate' as const,
          digest_frequency: 'weekly' as const,
          
          // Language and format preferences
          preferred_language: 'de' as const, // Default to German for Swiss market
          email_format: 'html' as const,
          
          // Unsubscribe management
          unsubscribe_token: crypto.randomUUID(),
          is_unsubscribed: false,
          
          // Swiss compliance
          consent_given: true,
          consent_date: new Date().toISOString(),
          data_retention_consent: true,
          marketing_consent: false // Requires explicit opt-in
        }

        const { data: newPreferences, error: createError } = await supabaseAdmin
          .from('email_preferences')
          .insert(defaultPreferences)
          .select()
          .single()

        if (createError) {
          console.error('Failed to create default email preferences:', createError)
          return NextResponse.json(
            { error: 'Failed to create email preferences' },
            { status: 500 }
          )
        }

        return NextResponse.json({ preferences: newPreferences })
      }

      return NextResponse.json({ preferences })

    } catch (error) {
      console.error('Email preferences GET error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/email/preferences
 * Update user's email preferences
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    try {
      const body = await request.json()
      const updates: EmailPreferenceUpdate = body.preferences

      if (!updates || typeof updates !== 'object') {
        return NextResponse.json(
          { error: 'Invalid preferences data' },
          { status: 400 }
        )
      }

      // Validate preference keys
      const validKeys = [
        // Notification categories
        'auction_notifications', 'outbid_notifications', 'auction_ending_notifications',
        'auction_won_notifications', 'auction_extended_notifications',
        'watchlist_notifications', 'watchlist_updates', 'watchlist_ending_soon',
        'account_notifications', 'registration_confirmations', 'password_reset_notifications',
        'profile_update_notifications', 'security_notifications',
        'payment_notifications', 'payment_confirmations', 'invoice_notifications',
        'refund_notifications', 'commission_notifications',
        'contact_notifications', 'contact_confirmations', 'contact_responses', 'listing_inquiries',
        'marketing_notifications', 'newsletter_subscription', 'promotional_emails', 'feature_announcements',
        
        // Frequency settings
        'notification_frequency', 'digest_frequency',
        
        // Language and format preferences
        'preferred_language', 'email_format',
        
        // Swiss compliance
        'marketing_consent'
      ]

      const invalidKeys = Object.keys(updates).filter(key => !validKeys.includes(key))
      if (invalidKeys.length > 0) {
        return NextResponse.json(
          { error: `Invalid preference keys: ${invalidKeys.join(', ')}` },
          { status: 400 }
        )
      }

      // Validate enum values
      if (updates.notification_frequency && !['immediate', 'daily', 'weekly', 'disabled'].includes(updates.notification_frequency as string)) {
        return NextResponse.json(
          { error: 'Invalid notification_frequency value' },
          { status: 400 }
        )
      }

      if (updates.digest_frequency && !['daily', 'weekly', 'monthly', 'disabled'].includes(updates.digest_frequency as string)) {
        return NextResponse.json(
          { error: 'Invalid digest_frequency value' },
          { status: 400 }
        )
      }

      if (updates.preferred_language && !['de', 'fr', 'pl', 'en'].includes(updates.preferred_language as string)) {
        return NextResponse.json(
          { error: 'Invalid preferred_language value' },
          { status: 400 }
        )
      }

      if (updates.email_format && !['html', 'text', 'both'].includes(updates.email_format as string)) {
        return NextResponse.json(
          { error: 'Invalid email_format value' },
          { status: 400 }
        )
      }

      // Special handling for marketing consent - update consent date if enabling
      const updateData = { ...updates }
      if (updates.marketing_consent === true) {
        updateData.consent_date = new Date().toISOString()
      }

      // Update preferences
      const { data: updatedPreferences, error } = await supabaseAdmin
        .from('email_preferences')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update email preferences:', error)
        return NextResponse.json(
          { error: 'Failed to update email preferences' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        preferences: updatedPreferences,
        message: 'Email preferences updated successfully'
      })

    } catch (error) {
      console.error('Email preferences PUT error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/email/preferences/unsubscribe-all
 * Unsubscribe user from all emails
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    try {
      const body = await request.json()
      const { reason, feedback } = body

      // Update preferences to unsubscribe from all
      const { error } = await supabaseAdmin
        .from('email_preferences')
        .update({
          is_unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
          unsubscribe_reason: reason || 'User requested',
          
          // Disable all notifications
          auction_notifications: false,
          watchlist_notifications: false,
          account_notifications: false,
          payment_notifications: false,
          contact_notifications: false,
          marketing_notifications: false,
          
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to unsubscribe user:', error)
        return NextResponse.json(
          { error: 'Failed to unsubscribe' },
          { status: 500 }
        )
      }

      // Log unsubscribe event
      await supabaseAdmin
        .from('email_unsubscribes')
        .insert({
          email: user.email || '',
          user_id: user.id,
          unsubscribe_token: crypto.randomUUID(),
          unsubscribe_type: 'all',
          reason: reason || 'User requested',
          feedback: feedback || null,
          is_resubscribed: false
        })

      return NextResponse.json({ 
        message: 'Successfully unsubscribed from all emails'
      })

    } catch (error) {
      console.error('Unsubscribe all error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}