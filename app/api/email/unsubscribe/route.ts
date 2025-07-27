import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { UnsubscribeRequest } from '@/lib/database/email.types'

/**
 * GET /api/email/unsubscribe?token=xxx&type=xxx&category=xxx
 * Handle unsubscribe via email link (one-click unsubscribe)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category')
    const campaignId = searchParams.get('campaign')

    if (!token) {
      return new NextResponse(
        generateUnsubscribePage('Error', 'Invalid unsubscribe link. Missing token.', false),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Validate type
    if (!['all', 'category', 'campaign'].includes(type)) {
      return new NextResponse(
        generateUnsubscribePage('Error', 'Invalid unsubscribe type.', false),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Find user by unsubscribe token
    const { data: preferences, error: findError } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id, is_unsubscribed')
      .eq('unsubscribe_token', token)
      .single()

    if (findError || !preferences) {
      return new NextResponse(
        generateUnsubscribePage('Error', 'Invalid or expired unsubscribe link.', false),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Check if already unsubscribed
    if (preferences.is_unsubscribed && type === 'all') {
      return new NextResponse(
        generateUnsubscribePage(
          'Already Unsubscribed', 
          'You have already been unsubscribed from all emails.',
          true
        ),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Perform unsubscribe based on type
    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    let successMessage = ''

    switch (type) {
      case 'all':
        updateData = {
          ...updateData,
          is_unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
          unsubscribe_reason: 'Email link',
          // Disable all notifications
          auction_notifications: false,
          watchlist_notifications: false,
          account_notifications: false,
          payment_notifications: false,
          contact_notifications: false,
          marketing_notifications: false
        }
        successMessage = 'You have been successfully unsubscribed from all emails.'
        break

      case 'category':
        if (!category) {
          return new NextResponse(
            generateUnsubscribePage('Error', 'Category not specified for category unsubscribe.', false),
            {
              status: 400,
              headers: { 'Content-Type': 'text/html' }
            }
          )
        }

        // Map category to preference fields
        const categoryMappings: Record<string, string[]> = {
          'auction': ['auction_notifications', 'outbid_notifications', 'auction_ending_notifications', 'auction_won_notifications', 'auction_extended_notifications'],
          'watchlist': ['watchlist_notifications', 'watchlist_updates', 'watchlist_ending_soon'],
          'account': ['account_notifications', 'registration_confirmations', 'password_reset_notifications', 'profile_update_notifications', 'security_notifications'],
          'payment': ['payment_notifications', 'payment_confirmations', 'invoice_notifications', 'refund_notifications', 'commission_notifications'],
          'contact': ['contact_notifications', 'contact_confirmations', 'contact_responses', 'listing_inquiries'],
          'marketing': ['marketing_notifications', 'newsletter_subscription', 'promotional_emails', 'feature_announcements']
        }

        const fieldsToDisable = categoryMappings[category]
        if (!fieldsToDisable) {
          return new NextResponse(
            generateUnsubscribePage('Error', 'Invalid category specified.', false),
            {
              status: 400,
              headers: { 'Content-Type': 'text/html' }
            }
          )
        }

        // Disable category-specific notifications
        fieldsToDisable.forEach(field => {
          updateData[field] = false
        })

        successMessage = `You have been unsubscribed from ${category} notifications.`
        break

      case 'campaign':
        // For campaign unsubscribe, we just log it but don't change preferences
        // The actual filtering happens in the email service
        successMessage = 'You have been unsubscribed from this specific campaign.'
        break
    }

    // Update preferences
    const { error: updateError } = await supabaseAdmin
      .from('email_preferences')
      .update(updateData)
      .eq('unsubscribe_token', token)

    if (updateError) {
      console.error('Failed to update unsubscribe preferences:', updateError)
      return new NextResponse(
        generateUnsubscribePage('Error', 'Failed to process unsubscribe request. Please try again.', false),
        {
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Log unsubscribe event
    await supabaseAdmin
      .from('email_unsubscribes')
      .insert({
        email: '', // Will be filled by trigger or separate query
        user_id: preferences.user_id,
        unsubscribe_token: token,
        unsubscribe_type: type as 'all' | 'category' | 'campaign',
        category: category || null,
        campaign_id: campaignId || null,
        reason: 'Email link',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || '',
        is_resubscribed: false
      })

    // Return success page
    return new NextResponse(
      generateUnsubscribePage('Unsubscribed Successfully', successMessage, true),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    )

  } catch (error) {
    console.error('Unsubscribe GET error:', error)
    return new NextResponse(
      generateUnsubscribePage('Error', 'An unexpected error occurred. Please try again later.', false),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}

/**
 * POST /api/email/unsubscribe
 * Handle unsubscribe via API (programmatic unsubscribe)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, type, category, campaignId, reason, feedback }: UnsubscribeRequest = body

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      )
    }

    if (!type || !['all', 'category', 'campaign'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe type' },
        { status: 400 }
      )
    }

    if (type === 'category' && !category) {
      return NextResponse.json(
        { error: 'Category required for category unsubscribe' },
        { status: 400 }
      )
    }

    if (type === 'campaign' && !campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID required for campaign unsubscribe' },
        { status: 400 }
      )
    }

    // Find user by unsubscribe token
    const { data: preferences, error: findError } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id, is_unsubscribed')
      .eq('unsubscribe_token', token)
      .single()

    if (findError || !preferences) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 404 }
      )
    }

    // Perform unsubscribe logic (same as GET method)
    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    let successMessage = ''

    switch (type) {
      case 'all':
        updateData = {
          ...updateData,
          is_unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
          unsubscribe_reason: reason || 'API request',
          auction_notifications: false,
          watchlist_notifications: false,
          account_notifications: false,
          payment_notifications: false,
          contact_notifications: false,
          marketing_notifications: false
        }
        successMessage = 'Successfully unsubscribed from all emails'
        break

      case 'category':
        const categoryMappings: Record<string, string[]> = {
          'auction': ['auction_notifications', 'outbid_notifications', 'auction_ending_notifications', 'auction_won_notifications', 'auction_extended_notifications'],
          'watchlist': ['watchlist_notifications', 'watchlist_updates', 'watchlist_ending_soon'],
          'account': ['account_notifications', 'registration_confirmations', 'password_reset_notifications', 'profile_update_notifications', 'security_notifications'],
          'payment': ['payment_notifications', 'payment_confirmations', 'invoice_notifications', 'refund_notifications', 'commission_notifications'],
          'contact': ['contact_notifications', 'contact_confirmations', 'contact_responses', 'listing_inquiries'],
          'marketing': ['marketing_notifications', 'newsletter_subscription', 'promotional_emails', 'feature_announcements']
        }

        const fieldsToDisable = categoryMappings[category!]
        if (!fieldsToDisable) {
          return NextResponse.json(
            { error: 'Invalid category specified' },
            { status: 400 }
          )
        }

        fieldsToDisable.forEach(field => {
          updateData[field] = false
        })

        successMessage = `Successfully unsubscribed from ${category} notifications`
        break

      case 'campaign':
        successMessage = 'Successfully unsubscribed from campaign'
        break
    }

    // Update preferences
    const { error: updateError } = await supabaseAdmin
      .from('email_preferences')
      .update(updateData)
      .eq('unsubscribe_token', token)

    if (updateError) {
      console.error('Failed to update unsubscribe preferences:', updateError)
      return NextResponse.json(
        { error: 'Failed to process unsubscribe request' },
        { status: 500 }
      )
    }

    // Log unsubscribe event
    await supabaseAdmin
      .from('email_unsubscribes')
      .insert({
        email: '', // Will be filled by trigger or separate query
        user_id: preferences.user_id,
        unsubscribe_token: token,
        unsubscribe_type: type,
        category: category || null,
        campaign_id: campaignId || null,
        reason: reason || 'API request',
        feedback: feedback || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || '',
        is_resubscribed: false
      })

    return NextResponse.json({
      success: true,
      message: successMessage
    })

  } catch (error) {
    console.error('Unsubscribe POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate HTML page for unsubscribe results
 */
function generateUnsubscribePage(title: string, message: string, success: boolean): string {
  const statusColor = success ? '#10b981' : '#ef4444'
  const statusIcon = success ? '✓' : '✗'
  
  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - MotoAuto.ch</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        
        .status-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: ${statusColor};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
            margin: 0 auto 24px;
        }
        
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        .logo {
            font-size: 20px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        .footer {
            font-size: 14px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            margin-top: 32px;
        }
        
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.2s;
            margin-top: 16px;
        }
        
        .button:hover {
            background: #5a67d8;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 24px;
            }
            
            .title {
                font-size: 20px;
            }
            
            .status-icon {
                width: 60px;
                height: 60px;
                font-size: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-icon">${statusIcon}</div>
        <div class="logo">MotoAuto.ch</div>
        <h1 class="title">${title}</h1>
        <p class="message">${message}</p>
        
        ${success ? `
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                Sie können Ihre E-Mail-Einstellungen jederzeit in Ihrem Konto ändern.
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://motoauto.ch'}" class="button">
                Zurück zur Website
            </a>
        ` : `
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://motoauto.ch'}/kontakt" class="button">
                Kontakt Support
            </a>
        `}
        
        <div class="footer">
            <p>MotoAuto.ch - Ihr Marktplatz für Fahrzeuge in der Schweiz</p>
            <p style="margin-top: 8px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://motoauto.ch'}/datenschutz" 
                   style="color: #667eea; text-decoration: none;">Datenschutz</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://motoauto.ch'}/agb" 
                   style="color: #667eea; text-decoration: none;">AGB</a>
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}