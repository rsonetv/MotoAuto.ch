import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { 
  confirmPaymentSchema,
  type ConfirmPaymentInput 
} from "@/lib/schemas/payments-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import { confirmPaymentIntent, retrievePaymentIntent } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type Payment = Database['public']['Tables']['payments']['Row']

/**
 * POST /api/payments/confirm
 * Confirm payment and activate services
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, confirmPaymentSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid confirmation data: ${validation.error}`, 400)
      }

      const confirmData: ConfirmPaymentInput = validation.data
      const supabase = createServerComponentClient()

      // Find the payment record by Stripe payment intent ID
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          listings:listing_id (
            id,
            title,
            user_id,
            status,
            package_id
          ),
          packages:package_id (
            id,
            name_en,
            duration_days,
            features
          )
        `)
        .eq('payment_provider_id', confirmData.payment_intent_id)
        .eq('user_id', user.id)
        .single()

      if (paymentError || !payment) {
        return createErrorResponse('Payment not found or access denied', 404)
      }

      // Check if payment is already completed
      if (payment.status === 'completed') {
        return createErrorResponse('Payment already completed', 400)
      }

      // Check if payment is in a valid state for confirmation
      if (!['pending', 'processing'].includes(payment.status)) {
        return createErrorResponse(`Payment cannot be confirmed in ${payment.status} state`, 400)
      }

      try {
        // Confirm payment with Stripe
        const stripePaymentIntent = await confirmPaymentIntent(
          confirmData.payment_intent_id,
          {
            paymentMethodId: confirmData.payment_method_id,
            returnUrl: confirmData.return_url,
            receiptEmail: confirmData.receipt_email || profile.email
          }
        )

        // Update payment status based on Stripe response
        let paymentStatus: 'processing' | 'completed' | 'failed' = 'processing'
        let completedAt: string | null = null
        let failureReason: string | null = null

        if (stripePaymentIntent.status === 'succeeded') {
          paymentStatus = 'completed'
          completedAt = new Date().toISOString()
        } else if (stripePaymentIntent.status === 'payment_failed') {
          paymentStatus = 'failed'
          failureReason = 'Payment failed during confirmation'
        }

        // Update payment record
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            status: paymentStatus,
            payment_method: stripePaymentIntent.payment_method?.type || null,
            completed_at: completedAt,
            failure_reason: failureReason,
            metadata: {
              ...payment.metadata,
              stripe_status: stripePaymentIntent.status,
              confirmed_at: new Date().toISOString(),
              confirmation_method: 'api'
            }
          })
          .eq('id', payment.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating payment status:', updateError)
          return createErrorResponse('Failed to update payment status', 500)
        }

        // If payment is completed, activate the associated services
        if (paymentStatus === 'completed') {
          await activatePaymentServices(supabase, payment, user.id)
        }

        // Return confirmation response
        return createSuccessResponse({
          payment_id: payment.id,
          payment_intent_id: stripePaymentIntent.id,
          status: stripePaymentIntent.status,
          amount: payment.amount,
          currency: payment.currency,
          payment_method: stripePaymentIntent.payment_method?.type,
          client_secret: stripePaymentIntent.client_secret,
          next_action: stripePaymentIntent.next_action,
          // Service activation info
          services_activated: paymentStatus === 'completed' ? {
            payment_type: payment.payment_type,
            listing_id: payment.listing_id,
            package_id: payment.package_id,
            activated_at: completedAt
          } : null,
          // Swiss compliance info
          receipt_info: {
            receipt_email: confirmData.receipt_email || profile.email,
            invoice_generation: paymentStatus === 'completed' ? 'pending' : null
          }
        }, 200)

      } catch (stripeError: any) {
        console.error('Stripe payment confirmation failed:', stripeError)
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: stripeError.message || 'Payment confirmation failed',
            failed_at: new Date().toISOString()
          })
          .eq('id', payment.id)

        return createErrorResponse(
          `Payment confirmation failed: ${stripeError.message || 'Unknown error'}`,
          400
        )
      }

    } catch (error) {
      console.error('Unexpected error in POST /api/payments/confirm:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * Activate services after successful payment
 */
async function activatePaymentServices(
  supabase: any,
  payment: Payment & { listings?: any; packages?: any },
  userId: string
) {
  try {
    switch (payment.payment_type) {
      case 'listing_fee':
      case 'premium_package':
      case 'featured_listing':
        // Activate listing with package benefits
        if (payment.listing_id) {
          const updateData: any = {
            status: 'active',
            published_at: new Date().toISOString()
          }

          // Set expiration date based on package
          if (payment.packages) {
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + payment.packages.duration_days)
            updateData.expires_at = expirationDate.toISOString()
          }

          await supabase
            .from('listings')
            .update(updateData)
            .eq('id', payment.listing_id)
            .eq('user_id', userId)
        }
        break

      case 'commission':
        // Mark auction as payment received
        if (payment.listing_id) {
          // Find the auction for this listing
          const { data: auction } = await supabase
            .from('auctions')
            .select('id')
            .eq('listing_id', payment.listing_id)
            .single()

          if (auction) {
            await supabase
              .from('auctions')
              .update({
                payment_received: true,
                payment_due_date: null
              })
              .eq('id', auction.id)
          }

          // Update listing status to sold
          await supabase
            .from('listings')
            .update({
              status: 'sold',
              sold_at: new Date().toISOString()
            })
            .eq('id', payment.listing_id)
        }
        break

      default:
        console.log(`No specific activation needed for payment type: ${payment.payment_type}`)
    }

    // Update user profile statistics
    await supabase
      .from('profiles')
      .update({
        total_sales: supabase.raw('total_sales + 1')
      })
      .eq('id', userId)

    console.log(`Services activated for payment ${payment.id}`)
  } catch (error) {
    console.error('Error activating payment services:', error)
    // Don't throw error - payment was successful, service activation is secondary
  }
}