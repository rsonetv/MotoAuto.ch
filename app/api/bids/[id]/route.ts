import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { withOptionalAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { BidStatus } from "@/lib/database.types"

/**
 * GET /api/bids/[id] - Get specific bid details
 * 
 * Features:
 * - Detailed bid information with auction context
 * - Privacy protection (sensitive data only for bid owner/seller)
 * - User and auction details
 * - Swiss market compliance
 * - Bid status and timing information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const bidId = params.id

      // Validate bid ID format
      if (!bidId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bidId)) {
        return createErrorResponse('Invalid bid ID format', 400)
      }

      const supabase = createServerComponentClient()

      // Get bid details with full auction and user information
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select(`
          id,
          listing_id,
          auction_id,
          user_id,
          amount,
          is_auto_bid,
          max_auto_bid,
          auto_bid_active,
          status,
          ip_address,
          user_agent,
          placed_at,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name,
            rating,
            rating_count,
            location,
            canton
          ),
          listings!inner (
            id,
            title,
            description,
            brand,
            model,
            year,
            images,
            auction_end_time,
            current_bid,
            bid_count,
            min_bid_increment,
            reserve_price,
            status,
            location,
            postal_code,
            canton,
            user_id,
            profiles:user_id (
              full_name,
              is_dealer,
              dealer_name
            ),
            auctions!inner (
              id,
              starting_price,
              reserve_met,
              winner_id,
              winning_bid,
              total_bids,
              unique_bidders,
              extended_count,
              max_extensions,
              ended_at
            )
          )
        `)
        .eq('id', bidId)
        .single()

      if (bidError || !bidData) {
        return createErrorResponse('Bid not found', 404)
      }

      // Check access permissions
      const isBidOwner = user && bidData.user_id === user.id
      const isAuctionSeller = user && bidData.listings[0]?.user_id === user.id
      const hasAccess = isBidOwner || isAuctionSeller

      // Calculate auction status and timing
      const now = new Date()
      const endTime = new Date(bidData.listings[0]?.auction_end_time)
      const isAuctionActive = endTime > now && bidData.listings[0]?.status === 'active'
      const timeRemaining = isAuctionActive ? Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000)) : 0

      // Determine bid status context
      const isWinning = bidData.status === BidStatus.WINNING && isAuctionActive
      const hasWon = bidData.status === BidStatus.WON || (bidData.status === BidStatus.WINNING && !isAuctionActive)
      const isOutbid = bidData.status === BidStatus.OUTBID
      const isRetracted = bidData.status === BidStatus.RETRACTED

      // Check if bid can be retracted (only for bid owner)
      const canRetract = isBidOwner && 
                        isAuctionActive && 
                        !isRetracted && 
                        bidData.status !== BidStatus.WON &&
                        (now.getTime() - new Date(bidData.placed_at).getTime()) <= 5 * 60 * 1000 // 5 minutes

      // Prepare response with appropriate privacy protection
      const response = {
        id: bidData.id,
        listing_id: bidData.listing_id,
        auction_id: bidData.auction_id,
        user_id: bidData.user_id,
        amount: bidData.amount,
        is_auto_bid: bidData.is_auto_bid,
        max_auto_bid: hasAccess ? bidData.max_auto_bid : null, // Only show to bid owner or seller
        auto_bid_active: bidData.auto_bid_active,
        status: bidData.status,
        placed_at: bidData.placed_at,
        created_at: bidData.created_at,

        // Bidder information (limited for privacy)
        bidder: {
          full_name: bidData.profiles?.[0]?.full_name || 'Anonymous',
          avatar_url: bidData.profiles?.[0]?.avatar_url,
          is_dealer: bidData.profiles?.[0]?.is_dealer || false,
          dealer_name: bidData.profiles?.[0]?.dealer_name,
          rating: bidData.profiles?.[0]?.rating || 0,
          rating_count: bidData.profiles?.[0]?.rating_count || 0,
          location: hasAccess ? bidData.profiles?.[0]?.location : null, // Only show to authorized users
          canton: bidData.profiles?.[0]?.canton
        },

        // Auction/listing details
        auction: {
          id: bidData.listings[0]?.id,
          title: bidData.listings[0]?.title,
          description: bidData.listings[0]?.description,
          brand: bidData.listings[0]?.brand,
          model: bidData.listings[0]?.model,
          year: bidData.listings[0]?.year,
          images: bidData.listings[0]?.images,
          auction_end_time: bidData.listings[0]?.auction_end_time,
          current_bid: bidData.listings[0]?.current_bid,
          bid_count: bidData.listings[0]?.bid_count,
          min_bid_increment: bidData.listings[0]?.min_bid_increment,
          reserve_price: isAuctionSeller ? bidData.listings[0]?.reserve_price : null, // Only show to seller
          status: bidData.listings[0]?.status,
          location: bidData.listings[0]?.location,
          postal_code: bidData.listings[0]?.postal_code,
          canton: bidData.listings[0]?.canton,

          // Seller information
          seller: {
            full_name: bidData.listings[0]?.profiles?.[0]?.full_name || 'Anonymous',
            is_dealer: bidData.listings[0]?.profiles?.[0]?.is_dealer || false,
            dealer_name: bidData.listings[0]?.profiles?.[0]?.dealer_name
          },

          // Auction statistics
          starting_price: bidData.listings[0]?.auctions?.[0]?.starting_price,
          reserve_met: bidData.listings[0]?.auctions?.[0]?.reserve_met,
          winner_id: bidData.listings[0]?.auctions?.[0]?.winner_id,
          winning_bid: bidData.listings[0]?.auctions?.[0]?.winning_bid,
          total_bids: bidData.listings[0]?.auctions?.[0]?.total_bids,
          unique_bidders: bidData.listings[0]?.auctions?.[0]?.unique_bidders,
          extended_count: bidData.listings[0]?.auctions?.[0]?.extended_count,
          max_extensions: bidData.listings[0]?.auctions?.[0]?.max_extensions,
          ended_at: bidData.listings[0]?.auctions?.[0]?.ended_at
        },

        // Calculated status information
        is_auction_active: isAuctionActive,
        is_winning: isWinning,
        has_won: hasWon,
        is_outbid: isOutbid,
        is_retracted: isRetracted,
        can_retract: canRetract,
        time_remaining_seconds: timeRemaining,

        // Technical details (only for authorized users)
        technical: hasAccess ? {
          ip_address: bidData.ip_address,
          user_agent: bidData.user_agent
        } : null,

        // Access permissions
        permissions: {
          is_bid_owner: isBidOwner,
          is_auction_seller: isAuctionSeller,
          can_see_details: hasAccess
        }
      }

      return createSuccessResponse(response, 200)

    } catch (error: any) {
      console.error('Error in GET /api/bids/[id]:', error)
      return createErrorResponse('Internal server error', 500, {
        details: error.message
      })
    }
  })
}
