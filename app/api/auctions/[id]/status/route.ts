import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  calculateAuctionState,
  calculateTimeRemaining,
  calculateNextMinBid,
  canExtendAuction
} from "@/lib/schemas/auctions-api-schema"
import { 
  withOptionalAuth, 
  createErrorResponse,
  createSuccessResponse
} from "@/lib/auth-middleware"

/**
 * GET /api/auctions/[id]/status
 * Get real-time auction status for live updates
 * 
 * Features:
 * - Real-time auction state calculation
 * - Time remaining in seconds
 * - Current bid and next minimum bid
 * - Extension capabilities
 * - Reserve price status
 * - Optimized for frequent polling
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const auctionId = params.id

      // Validate auction ID format
      if (!auctionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(auctionId)) {
        return createErrorResponse('Invalid auction ID format', 400)
      }

      const supabase = await createServerComponentClient(req)

      // Get auction status with minimal data for performance
      const { data: auction, error } = await supabase
        .from('auctions')
        .select(`
          id,
          listing_id,
          reserve_met,
          extended_count,
          max_extensions,
          ended_at,
          listings!inner (
            auction_end_time,
            current_bid,
            bid_count,
            min_bid_increment,
            reserve_price,
            status,
            user_id
          )
        `)
        .eq('id', auctionId)
        .single()

      if (error || !auction) {
        return createErrorResponse('Auction not found', 404)
      }

      const listing = auction.listings

      // Get the most recent bid time for extension calculation
      const { data: lastBid } = await supabase
        .from('bids')
        .select('placed_at')
        .eq('auction_id', auctionId)
        .order('placed_at', { ascending: false })
        .limit(1)
        .single()

      // Calculate real-time auction state
      const auctionState = calculateAuctionState(
        listing.auction_end_time || '',
        auction.extended_count,
        listing.status
      )
      
      const timeRemaining = listing.auction_end_time 
        ? calculateTimeRemaining(listing.auction_end_time)
        : 0
      
      const nextMinBid = calculateNextMinBid(listing.current_bid, listing.min_bid_increment)

      const canExtend = listing.auction_end_time ? canExtendAuction(
        listing.auction_end_time,
        auction.extended_count,
        auction.max_extensions,
        lastBid?.placed_at
      ) : false

      // Check if user is the owner (for additional status info)
      const isOwner = user && listing.user_id === user.id

      // Prepare status response
      const statusData = {
        id: auctionId,
        listing_id: auction.listing_id,
        auction_state: auctionState,
        auction_end_time: listing.auction_end_time,
        current_bid: listing.current_bid,
        bid_count: listing.bid_count,
        reserve_met: auction.reserve_met,
        has_reserve_price: listing.reserve_price !== null,
        extended_count: auction.extended_count,
        max_extensions: auction.max_extensions,
        time_remaining_seconds: timeRemaining,
        next_min_bid: nextMinBid,
        can_extend: canExtend,
        last_bid_time: lastBid?.placed_at || null,
        
        // Additional info for owner
        ...(isOwner && {
          reserve_price: listing.reserve_price,
          ending_soon: timeRemaining > 0 && timeRemaining <= 300, // 5 minutes
          needs_attention: auctionState === 'ended' && !auction.ended_at
        }),
        
        // Bidding status for authenticated users
        ...(user && !isOwner && {
          can_bid: auctionState === 'active' || auctionState === 'extended',
          minimum_bid_amount: nextMinBid
        }),
        
        updated_at: new Date().toISOString()
      }

      // Set appropriate cache headers for real-time updates
      const response = createSuccessResponse(statusData, 200)
      
      // Short cache for status endpoint to allow frequent updates
      response.headers.set('Cache-Control', 'public, max-age=5, s-maxage=5')
      response.headers.set('Vary', 'Authorization')
      
      return response

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions/[id]/status:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}