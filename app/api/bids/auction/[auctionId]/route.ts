import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { withOptionalAuth, validateQueryParams, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { auctionBidsQuerySchema, type AuctionBidsQuery } from "@/lib/schemas/bids-api-schema"
import { BidStatus } from "@/lib/database.types"

/**
 * GET /api/bids/auction/[auctionId] - Get bid history for a specific auction
 * 
 * Features:
 * - Paginated bid history with user details
 * - Optional inclusion of retracted bids
 * - Sorting by bid placement time
 * - Privacy protection (only show necessary user info)
 * - Swiss market compliance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { auctionId: string } }
) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const { searchParams } = new URL(req.url)
      const auctionId = params.auctionId

      // Validate auction ID format
      if (!auctionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(auctionId)) {
        return createErrorResponse('Invalid auction ID format', 400)
      }

      // Validate query parameters
      const validation = validateQueryParams(searchParams, auctionBidsQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: AuctionBidsQuery = validation.data
      const supabase = createServerComponentClient()

      // First, verify the auction exists and get auction details
      const { data: auctionInfo, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          id,
          listing_id,
          listings!inner (
            id,
            title,
            brand,
            model,
            year,
            current_bid,
            bid_count,
            auction_end_time,
            status,
            user_id
          )
        `)
        .eq('id', auctionId)
        .single()

      if (auctionError || !auctionInfo) {
        return createErrorResponse('Auction not found', 404)
      }

      // Build status filter for bids
      let statusFilter = ''
      if (!query.include_retracted) {
        statusFilter = `AND status != '${BidStatus.RETRACTED}'`
      }

      // Get total count of bids
      const { count: totalCount, error: countError } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('auction_id', auctionId)
        .neq(query.include_retracted ? 'id' : 'status', query.include_retracted ? null : BidStatus.RETRACTED)

      if (countError) {
        console.error('Error getting bid count:', countError)
        return createErrorResponse('Failed to get bid count', 500)
      }

      // Calculate pagination
      const total = totalCount || 0
      const totalPages = Math.ceil(total / query.limit)
      const offset = (query.page - 1) * query.limit

      // Get bids with user details
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
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name,
            rating,
            rating_count
          )
        `)
        .eq('auction_id', auctionId)

      // Apply status filter
      if (!query.include_retracted) {
        bidsQuery = bidsQuery.neq('status', BidStatus.RETRACTED)
      }

      // Apply sorting and pagination
      bidsQuery = bidsQuery
        .order('placed_at', { ascending: query.sort_order === 'asc' })
        .range(offset, offset + query.limit - 1)

      const { data: bids, error: bidsError } = await bidsQuery

      if (bidsError) {
        console.error('Error fetching bids:', bidsError)
        return createErrorResponse('Failed to fetch bid history', 500)
      }

      // Transform bids data to include auction info and protect sensitive data
      const transformedBids = (bids || []).map((bid: any) => {
        // Only show max_auto_bid to the bid owner or auction seller
        const canSeeAutoBidDetails = user && (
          bid.user_id === user.id || 
          auctionInfo.listings[0]?.user_id === user.id
        )

        return {
          id: bid.id,
          listing_id: bid.listing_id,
          auction_id: bid.auction_id,
          user_id: bid.user_id,
          amount: bid.amount,
          is_auto_bid: bid.is_auto_bid,
          max_auto_bid: canSeeAutoBidDetails ? bid.max_auto_bid : null,
          auto_bid_active: bid.auto_bid_active,
          status: bid.status,
          placed_at: bid.placed_at,
          created_at: bid.created_at,
          profiles: {
            full_name: bid.profiles?.full_name || 'Anonymous',
            avatar_url: bid.profiles?.avatar_url,
            is_dealer: bid.profiles?.is_dealer || false,
            dealer_name: bid.profiles?.dealer_name,
            rating: bid.profiles?.rating || 0,
            rating_count: bid.profiles?.rating_count || 0
          }
        }
      })

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

      // Return response with bid history
      return createSuccessResponse(
        {
          data: transformedBids,
          pagination: paginationMeta,
          auction: {
            id: auctionInfo.id,
            listing_id: auctionInfo.listing_id,
            title: auctionInfo.listings[0]?.title,
            brand: auctionInfo.listings[0]?.brand,
            model: auctionInfo.listings[0]?.model,
            year: auctionInfo.listings[0]?.year,
            current_bid: auctionInfo.listings[0]?.current_bid,
            bid_count: auctionInfo.listings[0]?.bid_count,
            auction_end_time: auctionInfo.listings[0]?.auction_end_time,
            status: auctionInfo.listings[0]?.status
          },
          filters: {
            include_retracted: query.include_retracted,
            sort_order: query.sort_order
          }
        },
        200
      )

    } catch (error: any) {
      console.error('Error in GET /api/bids/auction/[auctionId]:', error)
      return createErrorResponse('Internal server error', 500, {
        details: error.message
      })
    }
  })
}
