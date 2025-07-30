import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  commissionCalculationSchema,
  type CommissionCalculationInput 
} from "@/lib/schemas/payments-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import { calculateCommission } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type Auction = Database['public']['Tables']['auctions']['Row']
type Listing = Database['public']['Tables']['listings']['Row']

interface CommissionParams {
  params: {
    auctionId: string
  }
}

/**
 * GET /api/payments/commission/[auctionId]
 * Calculate auction commission for a specific auction
 */
export async function GET(request: NextRequest, { params }: CommissionParams) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const auctionId = params.auctionId
      const { searchParams } = new URL(req.url)
      
      // Optional override parameters
      const commissionRateOverride = searchParams.get('commission_rate')
      const maxCommissionOverride = searchParams.get('max_commission')
      const saleAmountOverride = searchParams.get('sale_amount')

      const supabase = await createServerComponentClient(req)

      // Fetch auction with related listing data
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          *,
          listings:listing_id (
            id,
            user_id,
            title,
            brand,
            model,
            year,
            price,
            currency,
            current_bid,
            status,
            is_auction,
            auction_end_time
          )
        `)
        .eq('id', auctionId)
        .single()

      if (auctionError || !auction) {
        return createErrorResponse('Auction not found', 404)
      }

      // Check if user owns the auction or is admin
      const isOwner = auction.listings?.user_id === user.id
      const isAdmin = profile.email?.includes('@motoauto.ch') || false

      if (!isOwner && !isAdmin) {
        return createErrorResponse('Access denied. You can only view commission for your own auctions.', 403)
      }

      // Determine sale amount
      let saleAmount: number
      if (saleAmountOverride) {
        saleAmount = parseFloat(saleAmountOverride)
        if (isNaN(saleAmount) || saleAmount <= 0) {
          return createErrorResponse('Invalid sale amount override', 400)
        }
      } else if (auction.winning_bid && auction.winning_bid > 0) {
        saleAmount = auction.winning_bid
      } else if (auction.listings?.current_bid && auction.listings.current_bid > 0) {
        saleAmount = auction.listings.current_bid
      } else {
        return createErrorResponse('No sale amount available. Auction may not have ended or have any bids.', 400)
      }

      // Commission parameters
      const commissionRate = commissionRateOverride ? 
        parseFloat(commissionRateOverride) : 0.05 // 5% default
      const maxCommission = maxCommissionOverride ? 
        parseFloat(maxCommissionOverride) : 500 // 500 CHF max

      // Validate commission parameters
      if (commissionRate < 0 || commissionRate > 1) {
        return createErrorResponse('Commission rate must be between 0 and 1', 400)
      }
      if (maxCommission <= 0) {
        return createErrorResponse('Maximum commission must be positive', 400)
      }

      // Calculate commission
      const commissionAmount = calculateCommission(saleAmount, commissionRate, maxCommission)

      // Check if commission has already been paid
      const { data: existingPayment, error: paymentError } = await supabase
        .from('payments')
        .select('id, amount, status, created_at')
        .eq('listing_id', auction.listing_id)
        .eq('payment_type', 'commission')
        .eq('status', 'completed')
        .single()

      // Get auction status information
      const auctionEnded = auction.ended_at ? new Date(auction.ended_at) < new Date() : false
      const hasWinner = auction.winner_id !== null
      const paymentDue = auction.payment_due_date ? new Date(auction.payment_due_date) : null
      const paymentOverdue = paymentDue ? new Date() > paymentDue : false

      // Calculate Swiss VAT if applicable
      const vatRate = 0.077 // 7.7% Swiss VAT
      const vatAmount = commissionAmount * vatRate
      const totalWithVat = commissionAmount + vatAmount

      return createSuccessResponse({
        auction_id: auctionId,
        listing_id: auction.listing_id,
        auction_details: {
          title: auction.listings?.title,
          brand: auction.listings?.brand,
          model: auction.listings?.model,
          year: auction.listings?.year,
          starting_price: auction.starting_price,
          current_bid: auction.listings?.current_bid,
          winning_bid: auction.winning_bid,
          winner_id: auction.winner_id,
          ended_at: auction.ended_at,
          payment_due_date: auction.payment_due_date,
          payment_received: auction.payment_received
        },
        commission_calculation: {
          sale_amount: saleAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          max_commission: maxCommission,
          currency: auction.listings?.currency || 'CHF',
          is_capped: commissionAmount >= maxCommission,
          calculated_at: new Date().toISOString()
        },
        swiss_tax_info: {
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total_with_vat: totalWithVat,
          vat_applicable: true // Swiss VAT applies to commission services
        },
        payment_status: {
          commission_paid: !!existingPayment,
          payment_id: existingPayment?.id || null,
          payment_amount: existingPayment?.amount || null,
          payment_date: existingPayment?.created_at || null,
          payment_due: paymentDue?.toISOString() || null,
          payment_overdue: paymentOverdue,
          days_until_due: paymentDue ? Math.ceil((paymentDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
        },
        auction_status: {
          ended: auctionEnded,
          has_winner: hasWinner,
          reserve_met: auction.reserve_met,
          total_bids: auction.total_bids,
          unique_bidders: auction.unique_bidders
        }
      }, 200)

    } catch (error) {
      console.error('Unexpected error in GET /api/payments/commission/[auctionId]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * POST /api/payments/commission/[auctionId]
 * Calculate commission with custom parameters
 */
export async function POST(request: NextRequest, { params }: CommissionParams) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const auctionId = params.auctionId
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, commissionCalculationSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid commission calculation data: ${validation.error}`, 400)
      }

      const calculationData: CommissionCalculationInput = validation.data
      const supabase = await createServerComponentClient(req)

      // Verify auction exists and user has access
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          *,
          listings:listing_id (
            id,
            user_id,
            title,
            brand,
            model,
            year,
            currency,
            current_bid,
            status
          )
        `)
        .eq('id', auctionId)
        .single()

      if (auctionError || !auction) {
        return createErrorResponse('Auction not found', 404)
      }

      // Check access permissions
      const isOwner = auction.listings?.user_id === user.id
      const isAdmin = profile.email?.includes('@motoauto.ch') || false

      if (!isOwner && !isAdmin) {
        return createErrorResponse('Access denied', 403)
      }

      // Validate that the provided auction_id matches the URL parameter
      if (calculationData.auction_id !== auctionId) {
        return createErrorResponse('Auction ID mismatch', 400)
      }

      // Calculate commission with provided parameters
      const commissionAmount = calculateCommission(
        calculationData.sale_amount,
        calculationData.commission_rate,
        calculationData.max_commission
      )

      // Calculate Swiss VAT
      const vatRate = 0.077
      const vatAmount = commissionAmount * vatRate
      const totalWithVat = commissionAmount + vatAmount

      // Store calculation for audit trail
      const calculationRecord = {
        auction_id: auctionId,
        listing_id: auction.listing_id,
        sale_amount: calculationData.sale_amount,
        commission_rate: calculationData.commission_rate,
        commission_amount: commissionAmount,
        max_commission: calculationData.max_commission,
        currency: calculationData.currency,
        calculated_by: user.id,
        calculated_at: new Date().toISOString(),
        calculation_method: 'api_custom',
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_with_vat: totalWithVat
      }

      // You could store this in a commission_calculations table for audit
      console.log('Commission calculation performed:', calculationRecord)

      // Check if this would create a payment intent
      const shouldCreatePayment = body.create_payment_intent === true

      let paymentIntentInfo = null
      if (shouldCreatePayment && !auction.payment_received) {
        // This would integrate with the payment intent creation
        paymentIntentInfo = {
          suggested_amount: commissionAmount,
          currency: calculationData.currency,
          payment_type: 'commission',
          listing_id: auction.listing_id,
          description: `Commission payment for auction: ${auction.listings?.title}`,
          next_step: 'Create payment intent via /api/payments/create-intent'
        }
      }

      return createSuccessResponse({
        auction_id: auctionId,
        listing_id: auction.listing_id,
        calculation_details: calculationRecord,
        commission_breakdown: {
          sale_amount: calculationData.sale_amount,
          commission_rate: calculationData.commission_rate * 100, // Convert to percentage
          commission_amount: commissionAmount,
          max_commission: calculationData.max_commission,
          is_capped: commissionAmount >= calculationData.max_commission,
          effective_rate: (commissionAmount / calculationData.sale_amount) * 100
        },
        swiss_compliance: {
          vat_rate: vatRate * 100, // Convert to percentage
          vat_amount: vatAmount,
          net_commission: commissionAmount,
          gross_commission: totalWithVat,
          currency: calculationData.currency
        },
        payment_info: paymentIntentInfo,
        audit_trail: {
          calculated_by: user.id,
          calculated_at: calculationRecord.calculated_at,
          calculation_method: 'api_custom',
          user_email: profile.email
        }
      }, 201)

    } catch (error) {
      console.error('Unexpected error in POST /api/payments/commission/[auctionId]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * PUT /api/payments/commission/[auctionId]
 * Update commission payment status (admin only)
 */
export async function PUT(request: NextRequest, { params }: CommissionParams) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const auctionId = params.auctionId
      const body = await req.json()

      // Check admin permissions
      const isAdmin = profile.email?.includes('@motoauto.ch') || false
      if (!isAdmin) {
        return createErrorResponse('Admin access required', 403)
      }

      const supabase = await createServerComponentClient(req)

      // Validate auction exists
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('id, listing_id, payment_received, payment_due_date')
        .eq('id', auctionId)
        .single()

      if (auctionError || !auction) {
        return createErrorResponse('Auction not found', 404)
      }

      // Update payment status
      const updates: any = {}
      if (body.payment_received !== undefined) {
        updates.payment_received = body.payment_received
      }
      if (body.payment_due_date !== undefined) {
        updates.payment_due_date = body.payment_due_date
      }

      if (Object.keys(updates).length === 0) {
        return createErrorResponse('No valid updates provided', 400)
      }

      const { data: updatedAuction, error: updateError } = await supabase
        .from('auctions')
        .update(updates)
        .eq('id', auctionId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating auction payment status:', updateError)
        return createErrorResponse('Failed to update payment status', 500)
      }

      return createSuccessResponse({
        auction_id: auctionId,
        updated_fields: updates,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }, 200)

    } catch (error) {
      console.error('Unexpected error in PUT /api/payments/commission/[auctionId]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}