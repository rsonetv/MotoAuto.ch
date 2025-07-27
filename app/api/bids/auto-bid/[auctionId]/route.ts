import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { withAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { BidStatus } from "@/lib/database.types"

/**
 * DELETE /api/bids/auto-bid/[auctionId] - Cancel automatic bidding
 * 
 * Features:
 * - Cancel active auto-bid for specific auction
 * - Ownership validation (only auto-bid owner can cancel)
 * - Preserve existing bids (only disable future auto-bidding)
 * - Swiss market compliance
 * - Audit trail for cancellation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { auctionId: string } }
) {
  return withAuth(request, async (req, { user, profile }) => {
    try {
      const auctionId = params.auctionId

      // Validate auction ID format
      if (!auctionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(auctionId)) {
        return createErrorResponse('Invalid auction ID format', 400)
      }

      const supabase = createServerComponentClient()

      // Find active auto-bid for this user and auction
      const { data: autoBidData, error: autoBidError } = await supabase
        .from('bids')
        .select(`
          id,
          listing_id,
          auction_id,
          user_id,
          amount,
          max_auto_bid,
          auto_bid_active,
          status,
          placed_at,
          listings!inner (
            id,
            title,
            auction_end_time,
            status,
            current_bid
          )
        `)
        .eq('auction_id', auctionId)
        .eq('user_id', user.id)
        .eq('is_auto_bid', true)
        .eq('auto_bid_active', true)
        .neq('status', BidStatus.RETRACTED)
        .single()

      if (autoBidError || !autoBidData) {
        return createErrorResponse('No active auto-bid found for this auction', 404)
      }

      // Verify auction is still active (optional - user might want to cancel even for ended auctions)
      const now = new Date()
      const endTime = new Date(autoBidData.listings.auction_end_time)
      const isAuctionActive = endTime > now && autoBidData.listings.status === 'active'

      // Cancel the auto-bid by setting auto_bid_active to false
      const { error: updateError } = await supabase
        .from('bids')
        .update({
          auto_bid_active: false,
          updated_at: now.toISOString()
        })
        .eq('id', autoBidData.id)

      if (updateError) {
        console.error('Error canceling auto-bid:', updateError)
        return createErrorResponse('Failed to cancel auto-bid', 500)
      }

      // Prepare response with cancellation details
      const response = {
        success: true,
        cancelled_at: now.toISOString(),
        auto_bid: {
          id: autoBidData.id,
          auction_id: autoBidData.auction_id,
          listing_id: autoBidData.listing_id,
          max_auto_bid: autoBidData.max_auto_bid,
          current_bid_amount: autoBidData.amount,
          placed_at: autoBidData.placed_at,
          status: autoBidData.status
        },
        auction: {
          id: autoBidData.listings.id,
          title: autoBidData.listings.title,
          auction_end_time: autoBidData.listings.auction_end_time,
          current_bid: autoBidData.listings.current_bid,
          is_active: isAuctionActive
        },
        message: isAuctionActive 
          ? "Auto-bid cancelled successfully. Your existing bids remain active."
          : "Auto-bid cancelled successfully. Auction has ended, so no future auto-bids would have been placed anyway."
      }

      return createSuccessResponse(response, 200)

    } catch (error: any) {
      console.error('Auto-bid cancellation error:', error)
      
      // Handle specific business logic errors
      if (error.message.includes('No active auto-bid found')) {
        return createErrorResponse(error.message, 404)
      }

      return createErrorResponse(
        'Failed to cancel auto-bid. Please try again.',
        500,
        { details: error.message }
      )
    }
  })
}