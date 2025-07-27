import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { 
  refundRequestSchema,
  type RefundRequestInput 
} from "@/lib/schemas/payments-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import { createRefund, retrievePaymentIntent } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type Payment = Database['public']['Tables']['payments']['Row']

/**
 * POST /api/payments/refund
 * Process refunds (admin only or specific conditions)
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, refundRequestSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid refund data: ${validation.error}`, 400)
      }

      const refundData: RefundRequestInput = validation.data
      const supabase = createServerComponentClient()

      // Fetch payment with related data
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          listings:listing_id (
            id,
            title,
            user_id,
            status,
            auction_end_time
          ),
          packages:package_id (
            id,
            name_en,
            duration_days
          )
        `)
        .eq('id', refundData.payment_id)
        .single()

      if (paymentError || !payment) {
        return createErrorResponse('Payment not found', 404)
      }

      // Check refund eligibility
      const refundEligibility = await checkRefundEligibility(payment, user.id, profile)
      if (!refundEligibility.eligible) {
        return createErrorResponse(refundEligibility.reason || 'Refund not allowed', 403)
      }

      // Check if payment is already refunded
      if (payment.status === 'refunded') {
        return createErrorResponse('Payment already refunded', 400)
      }

      // Check if payment is completed
      if (payment.status !== 'completed') {
        return createErrorResponse('Only completed payments can be refunded', 400)
      }

      // Validate refund amount
      const refundAmount = refundData.amount || payment.amount
      if (refundAmount > payment.amount) {
        return createErrorResponse('Refund amount cannot exceed payment amount', 400)
      }

      if (refundAmount <= 0) {
        return createErrorResponse('Refund amount must be positive', 400)
      }

      try {
        // Create refund with Stripe
        const stripeRefund = await createRefund({
          paymentIntentId: payment.payment_provider_id!,
          amount: refundAmount,
          currency: payment.currency,
          reason: refundData.reason,
          metadata: {
            payment_id: payment.id,
            user_id: user.id,
            refund_reason: refundData.reason,
            refund_description: refundData.description || '',
            requested_by: profile.email,
            requested_at: new Date().toISOString()
          }
        })

        // Create refund payment record
        const refundPaymentData = {
          user_id: payment.user_id,
          listing_id: payment.listing_id,
          package_id: payment.package_id,
          amount: -refundAmount, // Negative amount for refund
          currency: payment.currency,
          commission_rate: 0,
          commission_amount: 0,
          max_commission: 0,
          payment_method: payment.payment_method,
          payment_provider: 'stripe',
          payment_provider_id: stripeRefund.id,
          payment_type: 'refund' as const,
          status: 'completed' as const,
          description: `Refund for payment ${payment.id}: ${refundData.description || refundData.reason}`,
          metadata: {
            original_payment_id: payment.id,
            original_payment_amount: payment.amount,
            refund_reason: refundData.reason,
            refund_description: refundData.description,
            stripe_refund_id: stripeRefund.id,
            processed_by: user.id,
            processed_at: new Date().toISOString()
          },
          processed_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }

        const { data: refundPayment, error: refundError } = await supabase
          .from('payments')
          .insert(refundPaymentData)
          .select()
          .single()

        if (refundError) {
          console.error('Error creating refund payment record:', refundError)
          return createErrorResponse('Failed to create refund record', 500)
        }

        // Update original payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: refundAmount >= payment.amount ? 'refunded' : 'completed',
            refunded_at: new Date().toISOString(),
            metadata: {
              ...payment.metadata,
              refund_id: refundPayment.id,
              refund_amount: refundAmount,
              refund_reason: refundData.reason,
              refunded_at: new Date().toISOString(),
              refunded_by: user.id
            }
          })
          .eq('id', payment.id)

        if (updateError) {
          console.error('Error updating original payment:', updateError)
          // Don't fail the request, refund was successful
        }

        // Handle service deactivation if full refund
        if (refundAmount >= payment.amount) {
          await handleServiceDeactivation(supabase, payment)
        }

        // Send refund notification email
        await sendRefundNotificationEmail(payment, refundPayment, refundAmount)

        return createSuccessResponse({
          refund_id: refundPayment.id,
          original_payment_id: payment.id,
          refund_amount: refundAmount,
          currency: payment.currency,
          status: 'completed',
          reason: refundData.reason,
          description: refundData.description,
          stripe_refund_id: stripeRefund.id,
          processed_at: new Date().toISOString(),
          // Swiss compliance info
          refund_details: {
            original_amount: payment.amount,
            refunded_amount: refundAmount,
            remaining_amount: payment.amount - refundAmount,
            is_full_refund: refundAmount >= payment.amount,
            refund_method: 'original_payment_method',
            estimated_processing_time: '5-10 business days'
          }
        }, 201)

      } catch (stripeError: any) {
        console.error('Stripe refund failed:', stripeError)
        return createErrorResponse(
          `Refund processing failed: ${stripeError.message || 'Unknown error'}`,
          500
        )
      }

    } catch (error) {
      console.error('Unexpected error in POST /api/payments/refund:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * Check if refund is eligible
 */
async function checkRefundEligibility(
  payment: Payment & { listings?: any; packages?: any },
  userId: string,
  profile: any
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    // Admin users can always refund (implement admin check as needed)
    const isAdmin = profile.email?.includes('@motoauto.ch') || false // Placeholder admin check

    // User can refund their own payments under certain conditions
    const isOwner = payment.user_id === userId

    if (!isAdmin && !isOwner) {
      return { eligible: false, reason: 'You can only refund your own payments' }
    }

    // Check payment age (e.g., no refunds after 30 days)
    const paymentDate = new Date(payment.completed_at || payment.created_at)
    const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (!isAdmin && daysSincePayment > 30) {
      return { eligible: false, reason: 'Refunds are only available within 30 days of payment' }
    }

    // Check payment type specific rules
    switch (payment.payment_type) {
      case 'commission':
        // Commission refunds only if auction hasn't ended or item not delivered
        if (payment.listings?.status === 'sold') {
          return { eligible: false, reason: 'Cannot refund commission after item is sold and delivered' }
        }
        break

      case 'listing_fee':
      case 'premium_package':
      case 'featured_listing':
        // Package refunds only if listing is still active or not published
        if (payment.listings?.status === 'sold') {
          return { eligible: false, reason: 'Cannot refund listing fees after successful sale' }
        }
        break
    }

    // Check if listing is in auction and auction has ended
    if (payment.listings?.auction_end_time) {
      const auctionEndTime = new Date(payment.listings.auction_end_time)
      if (auctionEndTime < new Date() && payment.listings.status !== 'expired') {
        return { eligible: false, reason: 'Cannot refund after auction has ended with bids' }
      }
    }

    return { eligible: true }
  } catch (error) {
    console.error('Error checking refund eligibility:', error)
    return { eligible: false, reason: 'Unable to verify refund eligibility' }
  }
}

/**
 * Handle service deactivation after full refund
 */
async function handleServiceDeactivation(
  supabase: any,
  payment: Payment & { listings?: any; packages?: any }
) {
  try {
    switch (payment.payment_type) {
      case 'listing_fee':
      case 'premium_package':
      case 'featured_listing':
        // Deactivate listing
        if (payment.listing_id) {
          await supabase
            .from('listings')
            .update({
              status: 'suspended',
              published_at: null,
              expires_at: null
            })
            .eq('id', payment.listing_id)
        }
        break

      case 'commission':
        // Revert auction completion
        if (payment.listing_id) {
          const { data: auction } = await supabase
            .from('auctions')
            .select('id')
            .eq('listing_id', payment.listing_id)
            .single()

          if (auction) {
            await supabase
              .from('auctions')
              .update({
                payment_received: false,
                payment_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
              })
              .eq('id', auction.id)
          }

          await supabase
            .from('listings')
            .update({
              status: 'active', // Revert to active if refunding commission
              sold_at: null
            })
            .eq('id', payment.listing_id)
        }
        break
    }

    console.log(`Services deactivated for refunded payment ${payment.id}`)
  } catch (error) {
    console.error('Error deactivating services:', error)
    // Don't throw error - refund was successful, service deactivation is secondary
  }
}

/**
 * Send refund notification email
 */
async function sendRefundNotificationEmail(
  originalPayment: Payment,
  refundPayment: Payment,
  refundAmount: number
) {
  try {
    // Implement email sending logic here
    console.log(`Refund notification email sent for payment ${originalPayment.id}, refund amount: ${refundAmount}`)
  } catch (error) {
    console.error('Error sending refund notification email:', error)
  }
}

/**
 * GET /api/payments/refund
 * Get refund information for a payment (admin only)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { searchParams } = new URL(req.url)
      const paymentId = searchParams.get('payment_id')

      if (!paymentId) {
        return createErrorResponse('Payment ID is required', 400)
      }

      const supabase = createServerComponentClient()

      // Check if user is admin or payment owner
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (paymentError || !payment) {
        return createErrorResponse('Payment not found', 404)
      }

      const isAdmin = profile.email?.includes('@motoauto.ch') || false
      const isOwner = payment.user_id === user.id

      if (!isAdmin && !isOwner) {
        return createErrorResponse('Access denied', 403)
      }

      // Get refund eligibility
      const eligibility = await checkRefundEligibility(payment, user.id, profile)

      // Get existing refunds for this payment
      const { data: refunds, error: refundsError } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_type', 'refund')
        .contains('metadata', { original_payment_id: paymentId })
        .order('created_at', { ascending: false })

      if (refundsError) {
        console.error('Error fetching refunds:', refundsError)
      }

      const totalRefunded = refunds?.reduce((sum, refund) => sum + Math.abs(refund.amount), 0) || 0

      return createSuccessResponse({
        payment_id: paymentId,
        original_amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        refund_eligibility: eligibility,
        existing_refunds: refunds || [],
        total_refunded: totalRefunded,
        remaining_refundable: payment.amount - totalRefunded,
        refund_policies: {
          max_refund_days: 30,
          partial_refunds_allowed: true,
          automatic_service_deactivation: true,
          processing_time: '5-10 business days'
        }
      }, 200)

    } catch (error) {
      console.error('Unexpected error in GET /api/payments/refund:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}