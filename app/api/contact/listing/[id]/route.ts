import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withOptionalAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { createListingContactSchema, CreateListingContactInput } from "@/lib/schemas/contact-api-schema"
import { verifyListingContactRecaptcha, getClientIP, logRecaptchaVerification } from "@/lib/recaptcha"
import { performSecurityChecks, logSecurityEvent, createRateLimitHeaders } from "@/lib/rate-limit"
import { sendContactConfirmation, sendListingInquiryNotification } from "@/lib/email"
import { getErrorMessage, getSuccessMessage } from "@/lib/i18n/contact-translations"
import { ContactMessageInsert } from "@/lib/database.types"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/contact/listing/[id]
 * Submit a contact form for a specific listing
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withOptionalAuth(request, async (request, { user, profile }) => {
    try {
      const listingId = params.id

      // Validate listing ID format
      if (!listingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId)) {
        return createErrorResponse("Invalid listing ID format", 400)
      }

      // Parse request body
      const body = await request.json()
      
      // Add listing_id to the body for validation
      body.listing_id = listingId

      // Validate input data
      let validatedData: CreateListingContactInput
      try {
        validatedData = createListingContactSchema.parse(body)
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

      // Create Supabase client
      const supabase = await createServerComponentClient(req)

      // Verify listing exists and is active
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            preferred_language,
            is_dealer,
            dealer_name
          )
        `)
        .eq('id', listingId)
        .eq('status', 'active')
        .single()

      if (listingError || !listing) {
        return createErrorResponse(
          "Listing not found or not available for contact",
          404,
          { listing_id: listingId }
        )
      }

      // Prevent users from contacting their own listings
      if (user && listing.user_id === user.id) {
        return createErrorResponse(
          "You cannot contact yourself about your own listing",
          400,
          { listing_id: listingId }
        )
      }

      // Get client information
      const clientIP = getClientIP(request) || '127.0.0.1'
      const userAgent = request.headers.get('user-agent') || ''

      // Verify reCAPTCHA
      const recaptchaResult = await verifyListingContactRecaptcha(
        validatedData.recaptcha_token,
        clientIP
      )

      // Log reCAPTCHA verification
      logRecaptchaVerification(recaptchaResult, {
        action: 'listing_contact',
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
        // Log security events
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

      // Prepare contact message data
      const contactMessageData: ContactMessageInsert = {
        user_id: user?.id || null,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        category: 'listing_inquiry',
        listing_id: listingId,
        language: validatedData.language,
        ip_address: clientIP,
        user_agent: userAgent,
        recaptcha_score: recaptchaResult.score || null,
        recaptcha_action: recaptchaResult.action || null,
        metadata: {
          inquiry_type: validatedData.inquiry_type,
          preferred_contact_method: validatedData.preferred_contact_method,
          preferred_contact_time: validatedData.preferred_contact_time,
          listing_details: {
            title: listing.title,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            price: listing.price
          },
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
        console.error('Failed to insert listing contact message:', insertError)
        return createErrorResponse(
          getErrorMessage('server_error', validatedData.language),
          500,
          { database_error: insertError.message }
        )
      }

      // Send confirmation email to inquirer (async, don't wait)
      sendContactConfirmation(contactMessage, listing).catch(error => {
        console.error('Failed to send confirmation email:', error)
      })

      // Send notification to listing owner (async, don't wait)
      if (listing.profiles) {
        sendListingInquiryNotification(
          contactMessage,
          listing,
          listing.profiles
        ).catch(error => {
          console.error('Failed to send listing inquiry notification:', error)
        })
      }

      // Update listing contact count (async, don't wait)
      supabase
        .from('listings')
        .update({ contact_count: (listing.contact_count || 0) + 1 })
        .eq('id', listingId)
        .then(() => {})
        .catch((error: any) => {
          console.error('Failed to update listing contact count:', error)
        })

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
            listing_id: listingId,
            listing_title: listing.title,
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
      console.error('Listing contact form submission error:', error)
      
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
 * GET /api/contact/listing/[id]
 * Get listing information for contact form
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const listingId = params.id

    // Validate listing ID format
    if (!listingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId)) {
      return createErrorResponse("Invalid listing ID format", 400)
    }

    // Create Supabase client
    const supabase = await createServerComponentClient(req)

    // Get listing information
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        brand,
        model,
        year,
        price,
        currency,
        images,
        location,
        status,
        profiles:user_id (
          full_name,
          is_dealer,
          dealer_name
        )
      `)
      .eq('id', listingId)
      .eq('status', 'active')
      .single()

    if (listingError || !listing) {
      return createErrorResponse(
        "Listing not found or not available for contact",
        404,
        { listing_id: listingId }
      )
    }

    return createSuccessResponse({
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        currency: listing.currency,
        image: listing.images?.[0] || null,
        location: listing.location,
        seller: {
          name: Array.isArray(listing.profiles) ? listing.profiles[0]?.full_name || 'Anonymous' : listing.profiles?.full_name || 'Anonymous',
          is_dealer: Array.isArray(listing.profiles) ? listing.profiles[0]?.is_dealer || false : listing.profiles?.is_dealer || false,
          dealer_name: Array.isArray(listing.profiles) ? listing.profiles[0]?.dealer_name : listing.profiles?.dealer_name
        }
      }
    })

  } catch (error) {
    console.error('Listing contact info error:', error)
    return createErrorResponse(
      'Failed to load listing information',
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}