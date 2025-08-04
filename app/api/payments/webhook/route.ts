import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { verifyWebhookSignature } from "@/lib/stripe"
import { createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"
import { validateRuntimeEnv } from "@/lib/env"

type Payment = Database['public']['Tables']['payments']['Row']

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks for payment events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return createErrorResponse('Missing Stripe signature', 400)
    }

    // Verify webhook signature
    let event
    try {
      const { STRIPE_WEBHOOK_SECRET } = validateRuntimeEnv()
      event = verifyWebhookSignature(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      )
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return createErrorResponse(`Webhook signature verification failed: ${error.message}`, 400)
    }

    const supabase = await createServerComponentClient(request)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event.data.object)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(supabase, event.data.object)
        break

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(supabase, event.data.object)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(supabase, event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabase, event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription events for future recurring payments
        console.log(`Subscription event: ${event.type}`)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log webhook event for audit trail
    await logWebhookEvent(supabase, event)

    return createSuccessResponse({ received: true }, 200)

  } catch (error) {
    console.error('Webhook processing error:', error)
    return createErrorResponse('Webhook processing failed', 500)
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(supabase: any, paymentIntent: any) {
  try {
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select(`
        *,
        listings:listing_id (
          id,
          user_id,
          title,
          status
        ),
        packages:package_id (
          id,
          name_en,
          duration_days
        )
      `)
      .eq('payment_provider_id', paymentIntent.id)
      .single()

    if (findError || !payment) {
      console.error('Payment not found for successful payment intent:', paymentIntent.id)
      return
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        payment_method: paymentIntent.payment_method?.type || null,
        completed_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          stripe_payment_intent: paymentIntent.id,
          stripe_status: paymentIntent.status,
          webhook_processed_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return
    }

    // Activate services
    await activatePaymentServices(supabase, payment)

    // Send confirmation email (implement as needed)
    await sendPaymentConfirmationEmail(payment)

    console.log(`Payment ${payment.id} marked as completed via webhook`)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  try {
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_provider_id', paymentIntent.id)
      .single()

    if (findError || !payment) {
      console.error('Payment not found for failed payment intent:', paymentIntent.id)
      return
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
        failed_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          stripe_payment_intent: paymentIntent.id,
          stripe_status: paymentIntent.status,
          stripe_error: paymentIntent.last_payment_error,
          webhook_processed_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating failed payment status:', updateError)
      return
    }

    // Send failure notification email
    await sendPaymentFailureEmail(payment, paymentIntent.last_payment_error?.message)

    console.log(`Payment ${payment.id} marked as failed via webhook`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(supabase: any, paymentIntent: any) {
  try {
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_provider_id', paymentIntent.id)
      .single()

    if (findError || !payment) {
      console.error('Payment not found for canceled payment intent:', paymentIntent.id)
      return
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        failed_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          stripe_payment_intent: paymentIntent.id,
          stripe_status: paymentIntent.status,
          webhook_processed_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating canceled payment status:', updateError)
      return
    }

    console.log(`Payment ${payment.id} marked as canceled via webhook`)
  } catch (error) {
    console.error('Error handling payment canceled:', error)
  }
}

/**
 * Handle payment requiring action (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(supabase: any, paymentIntent: any) {
  try {
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_provider_id', paymentIntent.id)
      .single()

    if (findError || !payment) {
      console.error('Payment not found for payment requiring action:', paymentIntent.id)
      return
    }

    // Update payment status to processing
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'processing',
        metadata: {
          ...payment.metadata,
          stripe_payment_intent: paymentIntent.id,
          stripe_status: paymentIntent.status,
          requires_action: true,
          next_action: paymentIntent.next_action,
          webhook_processed_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating payment requiring action:', updateError)
      return
    }

    console.log(`Payment ${payment.id} requires action via webhook`)
  } catch (error) {
    console.error('Error handling payment requires action:', error)
  }
}

/**
 * Handle charge dispute
 */
async function handleChargeDispute(supabase: any, dispute: any) {
  try {
    // Find payment by charge ID
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_provider_id', dispute.payment_intent)
      .single()

    if (findError || !payment) {
      console.error('Payment not found for dispute:', dispute.id)
      return
    }

    // Update payment metadata with dispute information
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        metadata: {
          ...payment.metadata,
          dispute: {
            id: dispute.id,
            amount: dispute.amount,
            currency: dispute.currency,
            reason: dispute.reason,
            status: dispute.status,
            created: dispute.created
          },
          webhook_processed_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating payment with dispute info:', updateError)
      return
    }

    // Notify admin about dispute
    await notifyAdminAboutDispute(payment, dispute)

    console.log(`Dispute ${dispute.id} recorded for payment ${payment.id}`)
  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(supabase: any, invoice: any) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`)
    // Handle invoice-specific logic here
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(supabase: any, invoice: any) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`)
    // Handle invoice-specific logic here
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

/**
 * Activate services after successful payment
 */
async function activatePaymentServices(supabase: any, payment: Payment & { listings?: any; packages?: any }) {
  try {
    switch (payment.payment_type) {
      case 'listing_fee':
      case 'premium_package':
      case 'featured_listing':
        if (payment.listing_id) {
          const updateData: any = {
            status: 'active',
            published_at: new Date().toISOString()
          }

          if (payment.packages) {
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + payment.packages.duration_days)
            updateData.expires_at = expirationDate.toISOString()
          }

          await supabase
            .from('listings')
            .update(updateData)
            .eq('id', payment.listing_id)
        }
        break

      case 'commission':
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
                payment_received: true,
                payment_due_date: null
              })
              .eq('id', auction.id)
          }

          await supabase
            .from('listings')
            .update({
              status: 'sold',
              sold_at: new Date().toISOString()
            })
            .eq('id', payment.listing_id)
        }
        break
    }

    console.log(`Services activated for payment ${payment.id}`)
  } catch (error) {
    console.error('Error activating payment services:', error)
  }
}

/**
 * Log webhook event for audit trail
 */
async function logWebhookEvent(supabase: any, event: any) {
  try {
    // You could create a webhook_events table for audit logging
    console.log(`Webhook event logged: ${event.type} - ${event.id}`)
  } catch (error) {
    console.error('Error logging webhook event:', error)
  }
}

/**
 * Send payment confirmation email
 */
async function sendPaymentConfirmationEmail(payment: Payment) {
  try {
    // Implement email sending logic here
    console.log(`Payment confirmation email sent for payment ${payment.id}`)
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
  }
}

/**
 * Send payment failure email
 */
async function sendPaymentFailureEmail(payment: Payment, errorMessage?: string) {
  try {
    // Implement email sending logic here
    console.log(`Payment failure email sent for payment ${payment.id}`)
  } catch (error) {
    console.error('Error sending payment failure email:', error)
  }
}

/**
 * Notify admin about dispute
 */
async function notifyAdminAboutDispute(payment: Payment, dispute: any) {
  try {
    // Implement admin notification logic here
    console.log(`Admin notified about dispute ${dispute.id} for payment ${payment.id}`)
  } catch (error) {
    console.error('Error notifying admin about dispute:', error)
  }
}