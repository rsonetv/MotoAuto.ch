import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { 
  createPaymentIntentSchema,
  type CreatePaymentIntentInput 
} from "@/lib/schemas/payments-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import { createPaymentIntent, calculateCommission } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type Payment = Database['public']['Tables']['payments']['Row']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']

/**
 * POST /api/payments/create-intent
 * Create Stripe payment intent for packages and commissions
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, createPaymentIntentSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid payment data: ${validation.error}`, 400)
      }

      const paymentData: CreatePaymentIntentInput = validation.data
      const supabase = createServerComponentClient()

      // Validate listing if provided
      let listing = null
      if (paymentData.listing_id) {
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('id, user_id, price, currency, title, is_auction')
          .eq('id', paymentData.listing_id)
          .single()

        if (listingError || !listingData) {
          return createErrorResponse('Invalid listing ID', 400)
        }

        // Check if user owns the listing (for commission payments)
        if (paymentData.payment_type === 'commission' && listingData.user_id !== user.id) {
          return createErrorResponse('You can only pay commission for your own listings', 403)
        }

        listing = listingData
      }

      // Validate package if provided
      let packageData = null
      if (paymentData.package_id) {
        const { data: pkg, error: packageError } = await supabase
          .from('packages')
          .select('id, name_en, price_chf, duration_days, is_active')
          .eq('id', paymentData.package_id)
          .eq('is_active', true)
          .single()

        if (packageError || !pkg) {
          return createErrorResponse('Invalid or inactive package', 400)
        }

        packageData = pkg
      }

      // Calculate commission if it's a commission payment
      let commissionAmount = 0
      let commissionRate = 0.05 // 5% default
      let maxCommission = 500 // 500 CHF max

      if (paymentData.payment_type === 'commission' && listing) {
        commissionAmount = calculateCommission(paymentData.amount, commissionRate, maxCommission)
        
        // Ensure the payment amount matches the calculated commission
        if (Math.abs(paymentData.amount - commissionAmount) > 0.01) {
          return createErrorResponse(
            `Payment amount (${paymentData.amount}) does not match calculated commission (${commissionAmount})`,
            400
          )
        }
      }

      // Create payment record in database
      const paymentInsert: PaymentInsert = {
        user_id: user.id,
        listing_id: paymentData.listing_id || null,
        package_id: paymentData.package_id || null,
        amount: paymentData.amount,
        currency: paymentData.currency,
        commission_rate: paymentData.payment_type === 'commission' ? commissionRate : 0,
        commission_amount: commissionAmount,
        max_commission: maxCommission,
        payment_type: paymentData.payment_type,
        status: 'pending',
        description: paymentData.description || null,
        metadata: {
          ...paymentData.metadata,
          user_email: profile.email,
          user_name: profile.full_name,
          created_via: 'api',
          ...(listing && {
            listing_title: listing.title,
            listing_price: listing.price,
            listing_currency: listing.currency
          }),
          ...(packageData && {
            package_name: packageData.name_en,
            package_price: packageData.price_chf,
            package_duration: packageData.duration_days
          })
        }
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentInsert)
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
        return createErrorResponse('Failed to create payment record', 500)
      }

      // Create Stripe payment intent
      try {
        const stripePaymentIntent = await createPaymentIntent({
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentMethods: paymentData.payment_methods,
          metadata: {
            payment_id: payment.id,
            user_id: user.id,
            payment_type: paymentData.payment_type,
            ...(paymentData.listing_id && { listing_id: paymentData.listing_id }),
            ...(paymentData.package_id && { package_id: paymentData.package_id })
          },
          description: paymentData.description || `${paymentData.payment_type} payment for MotoAuto.ch`,
          customerEmail: paymentData.invoice_data?.customer_email || profile.email,
          automaticPaymentMethods: paymentData.automatic_payment_methods?.enabled ?? true
        })

        // Update payment record with Stripe payment intent ID
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            payment_provider: 'stripe',
            payment_provider_id: stripePaymentIntent.id,
            processed_at: new Date().toISOString()
          })
          .eq('id', payment.id)

        if (updateError) {
          console.error('Error updating payment with Stripe ID:', updateError)
          // Don't fail the request, just log the error
        }

        // Return success response with client secret
        return createSuccessResponse({
          payment_id: payment.id,
          client_secret: stripePaymentIntent.client_secret,
          payment_intent_id: stripePaymentIntent.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: stripePaymentIntent.status,
          payment_method_types: stripePaymentIntent.payment_method_types,
          metadata: stripePaymentIntent.metadata,
          created: stripePaymentIntent.created,
          // Swiss market specific information
          commission_info: paymentData.payment_type === 'commission' ? {
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            max_commission: maxCommission,
            sale_amount: listing?.price || 0
          } : undefined,
          package_info: packageData ? {
            name: packageData.name_en,
            price: packageData.price_chf,
            duration_days: packageData.duration_days
          } : undefined
        }, 201)

      } catch (stripeError: any) {
        console.error('Stripe payment intent creation failed:', stripeError)
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: stripeError.message || 'Stripe payment intent creation failed',
            failed_at: new Date().toISOString()
          })
          .eq('id', payment.id)

        return createErrorResponse(
          `Payment intent creation failed: ${stripeError.message || 'Unknown error'}`,
          500
        )
      }

    } catch (error) {
      console.error('Unexpected error in POST /api/payments/create-intent:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}