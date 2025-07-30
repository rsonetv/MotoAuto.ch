import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withAuth, validateQueryParams, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { myBidsQuerySchema, type MyBidsQuery } from "@/lib/schemas/bids-api-schema"
import { BidStatus } from "@/lib/database.types"

/**
 * GET /api/bids/my-bids - Get user's bidding history and current bids
 * 
 * Features:
 * - Paginated user bid history with auction details
 * - Filter by bid status (active, outbid, winning, won, lost, retracted)
 * - Filter by auction status (active, ended, all)
 * - Include/exclude auto-bids
 * - Sort by placement time, amount, or auction end time
 * - Swiss market compliance
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }) => {
    try {
      const { searchParams } = new URL(req.url)

      // Validate query parameters
      const validation = validateQueryParams(searchParams, myBidsQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: MyBidsQuery = validation.data
      const supabase = await createServerComponentClient(req)

      // Build base query for user's bids
      let bidsQuery = supabase
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
          placed_at,
          created_at,
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
            profiles:user_id (
              full_name,
              is_dealer,
              dealer_name
            )
          )
        `)
        .eq('user_id', user.id)

      // Apply status filter
      if (query.status) {
        bidsQuery = bidsQuery.eq('status', query.status)
      }

      // Apply auction status filter
      const now = new Date().toISOString()
      if (query.auction_status === 'active') {
        bidsQuery = bidsQuery
          .gt('listings.auction_end_time', now)
          .eq('listings.status', 'active')
      } else if (query.auction_status === 'ended') {
        bidsQuery = bidsQuery.or(`listings.auction_end_time.lte.${now},listings.status.neq.active`)
      }

      // Apply auto-bid filter
      if (!query.include_auto_bids) {
        bidsQuery = bidsQuery.eq('is_auto_bid', false)
      }

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq(query.status ? 'status' : 'id', query.status || user.id) // Conditional filter

      if (countError) {
        console.error('Error getting bid count:', countError)
        return createErrorResponse('Failed to get bid count', 500)
      }

      // Calculate pagination
      const total = totalCount || 0
      const totalPages = Math.ceil(total / query.limit)
      const offset = (query.page - 1) * query.limit

      // Apply sorting
      let orderColumn = 'placed_at'
      if (query.sort_by === 'amount') {
        orderColumn = 'amount'
      } else if (query.sort_by === 'auction_end_time') {
        orderColumn = 'listings.auction_end_time'
      }

      bidsQuery = bidsQuery
        .order(orderColumn, { ascending: query.sort_order === 'asc' })
        .range(offset, offset + query.limit - 1)

      const { data: bids, error: bidsError } = await bidsQuery

      if (bidsError) {
        console.error('Error fetching user bids:', bidsError)
        return createErrorResponse('Failed to fetch your bid history', 500)
      }

      // Transform bids data to include auction status and user-friendly information
      const transformedBids = (bids || []).map((bid: any) => {
        const listing = bid.listings
        const now = new Date()
        const endTime = new Date(listing.auction_end_time)
        const isAuctionActive = endTime > now && listing.status === 'active'
        
        // Determine if user is currently winning
        const isWinning = bid.status === BidStatus.WINNING && isAuctionActive
        const hasWon = bid.status === BidStatus.WON || (bid.status === BidStatus.WINNING && !isAuctionActive)
        
        // Calculate time remaining for active auctions
        const timeRemaining = isAuctionActive ? Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000)) : 0

        return {
          id: bid.id,
          listing_id: bid.listing_id,
          auction_id: bid.auction_id,
          amount: bid.amount,
          is_auto_bid: bid.is_auto_bid,
          max_auto_bid: bid.max_auto_bid, // User can see their own max auto-bid
          auto_bid_active: bid.auto_bid_active,
          status: bid.status,
          placed_at: bid.placed_at,
          created_at: bid.created_at,
          
          // Auction/listing details
          auction: {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            images: listing.images,
            auction_end_time: listing.auction_end_time,
            current_bid: listing.current_bid,
            bid_count: listing.bid_count,
            min_bid_increment: listing.min_bid_increment,
            reserve_price: listing.reserve_price,
            status: listing.status,
            location: listing.location,
            postal_code: listing.postal_code,
            canton: listing.canton,
            
            // Seller info
            seller: {
              full_name: listing.profiles?.full_name || 'Anonymous',
              is_dealer: listing.profiles?.is_dealer || false,
              dealer_name: listing.profiles?.dealer_name
            }
          },
          
          // Calculated fields
          is_auction_active: isAuctionActive,
          is_winning: isWinning,
          has_won: hasWon,
          time_remaining_seconds: timeRemaining,
          is_outbid: bid.status === BidStatus.OUTBID,
          can_retract: isAuctionActive && 
                      bid.status !== BidStatus.RETRACTED && 
                      bid.status !== BidStatus.WON &&
                      (new Date().getTime() - new Date(bid.placed_at).getTime()) <= 5 * 60 * 1000 // 5 minutes
        }
      })

      // Calculate summary statistics
      const activeBids = transformedBids.filter((bid: any) => bid.is_auction_active && bid.status !== BidStatus.RETRACTED).length
      const winningBids = transformedBids.filter((bid: any) => bid.is_winning).length
      const wonAuctions = transformedBids.filter((bid: any) => bid.has_won).length
      const totalBidAmount = transformedBids.reduce((sum: number, bid: any) => sum + bid.amount, 0)

      // Calculate pagination metadata
      const hasNext = query.page < totalPages
      const hasPrev = query.page > 1

      const paginationMeta = {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }

      // Return response with user's bid history
      return createSuccessResponse(
        {
          data: transformedBids,
          pagination: paginationMeta,
          summary: {
            active_bids: activeBids,
            winning_bids: winningBids,
            won_auctions: wonAuctions,
            total_bid_amount: totalBidAmount,
            total_bids: total
          },
          filters: {
            status: query.status,
            auction_status: query.auction_status,
            include_auto_bids: query.include_auto_bids,
            sort_by: query.sort_by,
            sort_order: query.sort_order
          }
        },
        200
      )

    } catch (error: any) {
      console.error('Error in GET /api/bids/my-bids:', error)
      return createErrorResponse('Internal server error', 500, {
        details: error.message
      })
    }
  })
}