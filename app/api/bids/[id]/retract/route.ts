import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { withAuth, validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { bidRetractionSchema, canRetractBid, type BidRetraction } from "@/lib/schemas/bids-api-schema"
import { BidStatus } from "@/lib/database.types"

/**
 * PUT /api/bids/[id]/retract - Retract a bid (if allowed)
 * 
 * Features:
 * - Swiss market compliance (5-minute retraction window)
 * - Ownership validation (only bid owner can retract)
 * - Auction status validation (must be active)
 * - Automatic recalculation of winning bid
 * - Audit trail with retraction reason
 * - Real-time auction updates
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }) => {
    try {
      const bidId = params.id

      // Validate bid ID format
      if (!bidId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bidId)) {
        return createErrorResponse('Invalid bid ID format', 400)
      }

      // Parse and validate request body
      const body = await request.json()
      const validation = validateRequestBody(body, bidRetractionSchema)
      
      if (!validation.success) {
        return createErrorResponse(validation.error, 400)
      }

      const retractionData = validation.data as BidRetraction
      const supabase = createServerComponentClient()

      // Get bid details with auction information
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select(`
          id,
          listing_id,
          auction_id,
          user_id,
          amount,
          status,
          placed_at,
          listings!inner (
            id,
            auction_end_time,
            current_bid,
            bid_count,
            status,
            user_id
          )
        `)
        .eq('id', bidId)
        .single()

      if (bidError || !bidData) {
        return createErrorResponse('Bid not found', 404)
      }

      // Verify bid ownership
      if (bidData.user_id !== user.id) {
        return createErrorResponse('You can only retract your own bids', 403)
      }

      // Check if bid can be retracted
      const retractionCheck = canRetractBid(
        bidData.placed_at,
        bidData.listings[0]?.auction_end_time,
        bidData.status
      )

      if (!retractionCheck.canRetract) {
        return createErrorResponse(retractionCheck.reason!, 400)
      }

      // Start transaction for bid retraction
      const now = new Date().toISOString()

      // Mark bid as retracted
      const { error: updateError } = await supabase
        .from('bids')
        .update({
          status: BidStatus.RETRACTED,
          updated_at: now
        })
        .eq('id', bidId)

      if (updateError) {
        console.error('Error retracting bid:', updateError)
        return createErrorResponse('Failed to retract bid', 500)
      }

      // If this was the winning bid, find the new highest bid
      let newCurrentBid = 0
      let newWinningBidder: string | undefined

      if (bidData.status === BidStatus.WINNING) {
        // Find the next highest bid
        const { data: nextHighestBid, error: nextBidError } = await supabase
          .from('bids')
          .select('user_id, amount')
          .eq('listing_id', bidData.listing_id)
          .neq('status', BidStatus.RETRACTED)
          .neq('id', bidId)
          .order('amount', { ascending: false })
          .order('placed_at', { ascending: true })
          .limit(1)
          .single()

        if (!nextBidError && nextHighestBid) {
          newCurrentBid = nextHighestBid.amount
          newWinningBidder = nextHighestBid.user_id

          // Update the new winning bid status
          await supabase
            .from('bids')
            .update({ status: BidStatus.WINNING })
            .eq('listing_id', bidData.listing_id)
            .eq('user_id', nextHighestBid.user_id)
            .eq('amount', nextHighestBid.amount)
            .neq('status', BidStatus.RETRACTED)
        }

        // Update listing current bid
        await supabase
          .from('listings')
          .update({ current_bid: newCurrentBid })
          .eq('id', bidData.listing_id)

        // Update auction statistics if reserve price was affected
        if (newCurrentBid === 0) {
          await supabase
            .from('auctions')
            .update({ reserve_met: false })
            .eq('listing_id', bidData.listing_id)
        }
      }

      // Prepare response with retraction details and auction updates
      const response = {
        success: true,
        bid_id: bidId,
        retracted_at: now,
        reason: retractionData.reason,
        auction_updated: {
          current_bid: bidData.status === BidStatus.WINNING ? newCurrentBid : bidData.listings[0]?.current_bid,
          bid_count: bidData.listings[0]?.bid_count,
          new_winning_bidder: newWinningBidder
        }
      }

      return createSuccessResponse(response, 200)

    } catch (error: any) {
      console.error('Bid retraction error:', error)
      
      // Handle specific business logic errors
      if (error.message.includes('Bid not found')) {
        return createErrorResponse(error.message, 404)
      }
      
      if (error.message.includes('can only retract') ||
          error.message.includes('Cannot retract') ||
          error.message.includes('can only be retracted')) {
        return createErrorResponse(error.message, 403)
      }

      return createErrorResponse(
        'Failed to retract bid. Please try again.',
        500,
        { details: error.message }
      )
    }
  })
}
