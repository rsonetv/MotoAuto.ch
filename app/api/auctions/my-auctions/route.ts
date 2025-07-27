import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { 
  myAuctionsQuerySchema,
  calculateAuctionState,
  calculateTimeRemaining,
  calculateNextMinBid,
  calculateCommission,
  type MyAuctionsQuery
} from "@/lib/schemas/auctions-api-schema"
import { 
  withAuth, 
  validateQueryParams,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type MyAuction = Database['public']['Tables']['listings']['Row'] & {
  categories: {
    name_en: string
    name_de: string
    name_fr: string
    name_pl: string
    slug: string
  }
  auctions: {
    id: string
    starting_price: number
    reserve_met: boolean
    winner_id: string | null
    winning_bid: number | null
    total_bids: number
    unique_bidders: number
    extended_count: number
    max_extensions: number
    ended_at: string | null
    payment_due_date: string | null
    payment_received: boolean
    pickup_arranged: boolean
  }
}

/**
 * GET /api/auctions/my-auctions
 * Get user's auction listings (seller view)
 * 
 * Features:
 * - Complete auction management for sellers
 * - Financial information (commissions, payments)
 * - Auction performance analytics
 * - Status filtering and date ranges
 * - Swiss market compliance
 * - Seller dashboard data
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Validate query parameters
      const validation = validateQueryParams(searchParams, myAuctionsQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: MyAuctionsQuery = validation.data
      const supabase = createServerComponentClient()

      // Build the base query for user's auctions
      let dbQuery = supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          brand,
          model,
          year,
          mileage,
          price,
          currency,
          location,
          postal_code,
          canton,
          images,
          auction_end_time,
          current_bid,
          bid_count,
          min_bid_increment,
          reserve_price,
          auto_extend_minutes,
          views,
          favorites_count,
          contact_count,
          status,
          created_at,
          updated_at,
          published_at,
          categories:category_id (
            name_en,
            name_de,
            name_fr,
            name_pl,
            slug
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
            ended_at,
            payment_due_date,
            payment_received,
            pickup_arranged
          )
        `)
        .eq('user_id', user.id)
        .eq('is_auction', true)

      // Apply status filter
      if (query.status) {
        // Map auction states to listing statuses
        switch (query.status) {
          case 'draft':
            dbQuery = dbQuery.eq('status', 'draft')
            break
          case 'active':
          case 'extended':
            dbQuery = dbQuery.eq('status', 'active')
            break
          case 'ended':
            dbQuery = dbQuery.in('status', ['sold', 'expired'])
            break
          case 'cancelled':
            dbQuery = dbQuery.eq('status', 'suspended')
            break
        }
      }

      // Apply date filters
      if (query.created_after) {
        dbQuery = dbQuery.gte('created_at', query.created_after)
      }
      if (query.created_before) {
        dbQuery = dbQuery.lte('created_at', query.created_before)
      }
      if (query.ended_after) {
        dbQuery = dbQuery.gte('auctions.ended_at', query.ended_after)
      }
      if (query.ended_before) {
        dbQuery = dbQuery.lte('auctions.ended_at', query.ended_before)
      }

      // Apply sorting
      const sortColumn = query.sort_by
      const sortOrder = query.sort_order === 'asc' ? { ascending: true } : { ascending: false }
      
      if (sortColumn === 'auction_end_time') {
        dbQuery = dbQuery.order('auction_end_time', { ...sortOrder, nullsFirst: false })
      } else if (sortColumn === 'current_bid') {
        dbQuery = dbQuery.order('current_bid', sortOrder)
      } else if (sortColumn === 'bid_count') {
        dbQuery = dbQuery.order('bid_count', sortOrder)
      } else {
        dbQuery = dbQuery.order(sortColumn, sortOrder)
      }

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_auction', true)

      if (countError) {
        console.error('Error getting my auctions count:', countError)
        return createErrorResponse('Failed to get auctions count', 500)
      }

      // Apply pagination
      const offset = (query.page - 1) * query.limit
      dbQuery = dbQuery.range(offset, offset + query.limit - 1)

      // Execute the query
      const { data: auctions, error } = await dbQuery

      if (error) {
        console.error('Error fetching my auctions:', error)
        return createErrorResponse('Failed to fetch your auctions', 500)
      }

      // Transform the data with seller-specific information
      const transformedAuctions = (auctions as MyAuction[]).map(auction => {
        const auctionState = calculateAuctionState(
          auction.auction_end_time || '',
          auction.auctions.extended_count,
          auction.status
        )
        
        const timeRemaining = auction.auction_end_time 
          ? calculateTimeRemaining(auction.auction_end_time)
          : 0
        
        const nextMinBid = calculateNextMinBid(auction.current_bid, auction.min_bid_increment)

        // Calculate financial information
        const finalPrice = auction.auctions.winning_bid || auction.current_bid
        const commission = calculateCommission(finalPrice)
        const netAmount = finalPrice - commission

        // Calculate performance metrics
        const bidParticipationRate = auction.views > 0 
          ? (auction.auctions.unique_bidders / auction.views) * 100 
          : 0
        
        const averageBidAmount = auction.bid_count > 0 
          ? finalPrice / auction.bid_count 
          : 0

        return {
          id: auction.auctions.id,
          listing_id: auction.id,
          title: auction.title,
          description: auction.description,
          brand: auction.brand,
          model: auction.model,
          year: auction.year,
          mileage: auction.mileage,
          
          // Pricing information
          starting_price: auction.auctions.starting_price,
          reserve_price: auction.reserve_price,
          current_bid: auction.current_bid,
          winning_bid: auction.auctions.winning_bid,
          currency: auction.currency,
          
          // Location
          location: auction.location,
          postal_code: auction.postal_code,
          canton: auction.canton,
          
          // Media
          images: auction.images,
          
          // Auction details
          auction_end_time: auction.auction_end_time,
          bid_count: auction.bid_count,
          min_bid_increment: auction.min_bid_increment,
          reserve_met: auction.auctions.reserve_met,
          auto_extend_minutes: auction.auto_extend_minutes,
          extended_count: auction.auctions.extended_count,
          max_extensions: auction.auctions.max_extensions,
          
          // Calculated fields
          auction_state: auctionState,
          time_remaining_seconds: timeRemaining,
          next_min_bid: nextMinBid,
          
          // Winner information
          winner_id: auction.auctions.winner_id,
          has_winner: !!auction.auctions.winner_id,
          
          // Payment and fulfillment
          payment_due_date: auction.auctions.payment_due_date,
          payment_received: auction.auctions.payment_received,
          pickup_arranged: auction.auctions.pickup_arranged,
          
          // Financial calculations
          commission_amount: commission,
          commission_rate: 0.05,
          net_amount: netAmount,
          estimated_payout: auctionState === 'ended' && auction.auctions.payment_received 
            ? netAmount 
            : null,
          
          // Performance metrics
          views: auction.views,
          favorites_count: auction.favorites_count,
          contact_count: auction.contact_count,
          unique_bidders: auction.auctions.unique_bidders,
          total_bids: auction.auctions.total_bids,
          bid_participation_rate: Math.round(bidParticipationRate * 100) / 100,
          average_bid_amount: Math.round(averageBidAmount * 100) / 100,
          
          // Status indicators
          needs_attention: (
            (auctionState === 'ended' && !auction.auctions.payment_received) ||
            (auction.auctions.payment_received && !auction.auctions.pickup_arranged) ||
            (timeRemaining > 0 && timeRemaining <= 3600 && auction.bid_count === 0)
          ),
          
          // Action items
          action_required: getActionRequired(auction, auctionState),
          
          // Timestamps
          created_at: auction.created_at,
          updated_at: auction.updated_at,
          published_at: auction.published_at,
          ended_at: auction.auctions.ended_at,
          
          // Relations
          categories: auction.categories
        }
      })

      // Calculate summary statistics for the seller dashboard
      const summary = {
        total_auctions: totalCount || 0,
        active_auctions: transformedAuctions.filter(a => 
          a.auction_state === 'active' || a.auction_state === 'extended'
        ).length,
        ended_auctions: transformedAuctions.filter(a => a.auction_state === 'ended').length,
        draft_auctions: transformedAuctions.filter(a => a.auction_state === 'draft').length,
        
        // Financial summary
        total_revenue: transformedAuctions
          .filter(a => a.auction_state === 'ended' && a.winning_bid)
          .reduce((sum, a) => sum + (a.winning_bid || 0), 0),
        total_commission: transformedAuctions
          .filter(a => a.auction_state === 'ended' && a.winning_bid)
          .reduce((sum, a) => sum + a.commission_amount, 0),
        pending_payments: transformedAuctions
          .filter(a => a.auction_state === 'ended' && !a.payment_received)
          .length,
        
        // Performance metrics
        total_views: transformedAuctions.reduce((sum, a) => sum + a.views, 0),
        total_bids: transformedAuctions.reduce((sum, a) => sum + a.total_bids, 0),
        total_bidders: transformedAuctions.reduce((sum, a) => sum + a.unique_bidders, 0),
        average_final_price: transformedAuctions.length > 0 
          ? transformedAuctions.reduce((sum, a) => sum + a.current_bid, 0) / transformedAuctions.length 
          : 0,
        
        // Attention items
        needs_attention: transformedAuctions.filter(a => a.needs_attention).length,
        action_required: transformedAuctions.filter(a => a.action_required.length > 0).length
      }

      // Calculate pagination metadata
      const total = totalCount || 0
      const totalPages = Math.ceil(total / query.limit)
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

      // Return response with seller dashboard data
      return createSuccessResponse(
        {
          auctions: transformedAuctions,
          summary,
          pagination: paginationMeta,
          filters: {
            status: query.status,
            created_after: query.created_after,
            created_before: query.created_before,
            ended_after: query.ended_after,
            ended_before: query.ended_before,
            sort_by: query.sort_by,
            sort_order: query.sort_order
          }
        },
        200
      )

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions/my-auctions:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * Helper function to determine what actions are required for an auction
 */
function getActionRequired(auction: MyAuction, auctionState: string): string[] {
  const actions: string[] = []
  
  if (auctionState === 'draft') {
    actions.push('Publish auction')
  }
  
  if (auctionState === 'ended' && auction.auctions.winner_id && !auction.auctions.payment_received) {
    actions.push('Follow up on payment')
  }
  
  if (auction.auctions.payment_received && !auction.auctions.pickup_arranged) {
    actions.push('Arrange pickup/delivery')
  }
  
  if (auctionState === 'active' || auctionState === 'extended') {
    const timeRemaining = auction.auction_end_time 
      ? calculateTimeRemaining(auction.auction_end_time)
      : 0
    
    if (timeRemaining <= 3600 && auction.bid_count === 0) { // 1 hour remaining, no bids
      actions.push('Consider promoting auction')
    }
  }
  
  return actions
}