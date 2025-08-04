import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withOptionalAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { createContactMessageSchema, CreateContactMessageInput } from "@/lib/schemas/contact-api-schema"
import { verifyContactFormRecaptcha, getClientIP, logRecaptchaVerification } from "@/lib/recaptcha"
import { performSecurityChecks, logSecurityEvent, createRateLimitHeaders } from "@/lib/rate-limit"
import { sendContactConfirmation, sendAdminNotification } from "@/lib/email"
import { getErrorMessage, getSuccessMessage } from "@/lib/i18n/contact-translations"
import { ContactMessageInsert } from "@/lib/database.types"

/**
 * POST /api/contact
 * Submit a new contact form message with reCAPTCHA verification
 */
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (request, { user, profile }) => {
    try {
      // Parse request body
      const body = await request.json()
      
      // Validate input data
      let validatedData: CreateContactMessageInput
      try {
        validatedData = createContactMessageSchema.parse(body)
      } catch (error: any) {
        return createErrorResponse(
          "Invalid input data",
          400,
          { 
            validation_errors: error?.issues || [],
            message: "Please check your form data and try again"
          }
        )
      }

      // Get client information
      const clientIP = getClientIP(request) || '127.0.0.1'
      const userAgent = request.headers.get('user-agent') || ''

      // Verify reCAPTCHA
      const recaptchaResult = await verifyContactFormRecaptcha(
        validatedData.recaptcha_token,
        clientIP
      )

      // Log reCAPTCHA verification
      logRecaptchaVerification(recaptchaResult, {
        action: 'contact_form',
        ip: clientIP,
        userAgent,
        userId: user?.id
      })

      if (!recaptchaResult.success) {
        logSecurityEvent('recaptcha_failed', {
          ipAddress: clientIP,
          email: validatedData.email,
          userAgent,
          reason: recaptchaResult.message,
          score: recaptchaResult.score
        })

        return createErrorResponse(
          getErrorMessage('recaptcha_failed', validatedData.language),
          400,
          { recaptcha_error: recaptchaResult.message }
        )
      }

      // Perform comprehensive security checks
      const securityCheck = await performSecurityChecks(
        request,
        {
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          phone: validatedData.phone
        },
        recaptchaResult.score
      )

      if (!securityCheck.allowed) {
        // Log security event
        if (securityCheck.rateLimitInfo && !securityCheck.rateLimitInfo.allowed) {
          logSecurityEvent('rate_limit_exceeded', {
            ipAddress: clientIP,
            email: validatedData.email,
            userAgent,
            reason: securityCheck.reason
          })
        }

        if (securityCheck.spamInfo?.isSpam) {
          logSecurityEvent('spam_detected', {
            ipAddress: clientIP,
            email: validatedData.email,
            userAgent,
            reason: securityCheck.reason,
            score: securityCheck.spamInfo.score
          })
        }

        const headers = securityCheck.rateLimitInfo 
          ? createRateLimitHeaders(securityCheck.rateLimitInfo)
          : {}

        return NextResponse.json(
          {
            error: securityCheck.reason || getErrorMessage('server_error', validatedData.language),
            details: {
              rate_limit: securityCheck.rateLimitInfo,
              spam_info: securityCheck.spamInfo
            }
          },
          { 
            status: securityCheck.rateLimitInfo?.allowed === false ? 429 : 400,
            headers
          }
        )
      }

      // Create Supabase client
      const supabase = await createServerComponentClient(request)

      // Prepare contact message data
      const contactMessageData: ContactMessageInsert = {
        user_id: user?.id || null,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        category: validatedData.category,
        listing_id: validatedData.listing_id || null,
        language: validatedData.language,
        ip_address: clientIP,
        user_agent: userAgent,
        recaptcha_score: recaptchaResult.score || null,
        recaptcha_action: recaptchaResult.action || null,
        metadata: {
          security_check: {
            spam_score: securityCheck.spamInfo?.score,
            spam_reasons: securityCheck.spamInfo?.reasons
          }
        }
      }

      // Insert contact message into database
      const { data: contactMessage, error: insertError } = await supabase
        .from('contact_messages')
        .insert(contactMessageData)
        .select()
        .single()

      if (insertError) {
        console.error('Failed to insert contact message:', insertError)
        return createErrorResponse(
          getErrorMessage('server_error', validatedData.language),
          500,
          { database_error: insertError.message }
        )
      }

      // Send confirmation email to user (async, don't wait)
      sendContactConfirmation(contactMessage).catch(error => {
        console.error('Failed to send confirmation email:', error)
      })

      // Send admin notification (async, don't wait)
      sendAdminNotification(contactMessage).catch(error => {
        console.error('Failed to send admin notification:', error)
      })

      // If this is a listing inquiry, fetch listing details and send notification to owner
      if (validatedData.listing_id && validatedData.category === 'listing_inquiry') {
        const { data: listing } = await supabase
          .from('listings')
          .select(`
            *,
            profiles:user_id (
              id,
              email,
              full_name,
              preferred_language
            )
          `)
          .eq('id', validatedData.listing_id)
          .eq('status', 'active')
          .single()

        if (listing && listing.profiles) {
          // Send notification to listing owner (async, don't wait)
          const { sendListingInquiryNotification } = await import('@/lib/email')
          sendListingInquiryNotification(
            contactMessage,
            listing,
            listing.profiles
          ).catch(error => {
            console.error('Failed to send listing inquiry notification:', error)
          })

          // Update listing contact count
          supabase
            .from('listings')
            .update({ contact_count: (listing.contact_count || 0) + 1 })
            .eq('id', validatedData.listing_id)
            .then(() => {})
        }
      }

      // Return success response
      const successMessage = getSuccessMessage(validatedData.language)
      const headers = securityCheck.rateLimitInfo 
        ? createRateLimitHeaders(securityCheck.rateLimitInfo)
        : {}

      return NextResponse.json(
        {
          success: true,
          message: successMessage.description,
          data: {
            id: contactMessage.id,
            status: contactMessage.status,
            created_at: contactMessage.created_at
          }
        },
        { 
          status: 201,
          headers
        }
      )

    } catch (error) {
      console.error('Contact form submission error:', error)
      
      // Try to get language from body for error message
      let language = 'de'
      try {
        const body = await request.clone().json()
        language = body.language || 'de'
      } catch {}

      return createErrorResponse(
        getErrorMessage('server_error', language),
        500,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    }
  })
}

/**
 * GET /api/contact
 * Get contact form configuration and reCAPTCHA settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'de'

    // Import translations
    const { getCategoryTranslations } = await import('@/lib/i18n/contact-translations')
    const { getRecaptchaConfig } = await import('@/lib/recaptcha')

    // Get contact categories
    const categories = getCategoryTranslations()

    // Get reCAPTCHA configuration
    const recaptchaConfig = getRecaptchaConfig()

    return createSuccessResponse({
      categories,
      recaptcha: {
        site_key: recaptchaConfig.siteKey,
        actions: recaptchaConfig.actions
      },
      config: {
        max_message_length: 5000,
        min_message_length: 20,
        supported_languages: ['de', 'fr', 'pl', 'en'],
        default_language: 'de'
      }
    })

  } catch (error) {
    console.error('Contact configuration error:', error)
    return createErrorResponse(
      'Failed to load contact configuration',
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}