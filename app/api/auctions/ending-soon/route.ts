import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  endingSoonQuerySchema,
  calculateAuctionState,
  calculateTimeRemaining,
  calculateNextMinBid,
  type EndingSoonQuery
} from "@/lib/schemas/auctions-api-schema"
import { 
  withOptionalAuth, 
  validateQueryParams,
  createErrorResponse,
  createSuccessResponse
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type EndingSoonAuction = Database['public']['Tables']['listings']['Row'] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
    is_dealer: boolean
    dealer_name: string | null
  }
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
    extended_count: number
    max_extensions: number
    unique_bidders: number
  }
}

/**
 * GET /api/auctions/ending-soon
 * Get auctions ending within specified timeframe
 * 
 * Features:
 * - Configurable time window (default 24 hours)
 * - Include/exclude extended auctions
 * - Sorted by ending time (soonest first)
 * - Real-time countdown calculations
 * - Swiss market features
 * - Optimized for auction monitoring
 */
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Validate query parameters
      const validation = validateQueryParams(searchParams, endingSoonQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: EndingSoonQuery = validation.data
      const supabase = await createServerComponentClient(req)

      // Calculate the time window
      const now = new Date()
      const endTime = new Date(now.getTime() + (query.hours * 60 * 60 * 1000))

      // Build the query for auctions ending soon
      let dbQuery = supabase
        .from('listings')
        .select(`
          id,
          title,
          brand,
          model,
          year,
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
          status,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name
          ),
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
            extended_count,
            max_extensions,
            unique_bidders
          )
        `)
        .eq('is_auction', true)
        .eq('status', 'active')
        .gt('auction_end_time', now.toISOString())
        .lte('auction_end_time', endTime.toISOString())

      // Filter by extension status if specified
      if (!query.include_extended) {
        dbQuery = dbQuery.eq('auctions.extended_count', 0)
      }

      // Order by ending time (soonest first)
      dbQuery = dbQuery
        .order('auction_end_time', { ascending: true })
        .limit(query.limit)

      // Execute the query
      const { data: auctions, error } = await dbQuery

      if (error) {
        console.error('Error fetching ending soon auctions:', error)
        return createErrorResponse('Failed to fetch ending soon auctions', 500)
      }

      // Transform the data with real-time calculations
      const transformedAuctions = (auctions as EndingSoonAuction[]).map(auction => {
        const auctionState = calculateAuctionState(
          auction.auction_end_time || '',
          auction.auctions.extended_count,
          auction.status
        )
        
        const timeRemaining = auction.auction_end_time 
          ? calculateTimeRemaining(auction.auction_end_time)
          : 0
        
        const nextMinBid = calculateNextMinBid(auction.current_bid, auction.min_bid_increment)

        // Calculate urgency level
        let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low'
        if (timeRemaining <= 300) { // 5 minutes
          urgencyLevel = 'critical'
        } else if (timeRemaining <= 1800) { // 30 minutes
          urgencyLevel = 'high'
        } else if (timeRemaining <= 3600) { // 1 hour
          urgencyLevel = 'medium'
        }

        return {
          id: auction.auctions.id,
          listing_id: auction.id,
          title: auction.title,
          brand: auction.brand,
          model: auction.model,
          year: auction.year,
          price: auction.auctions.starting_price,
          currency: auction.currency,
          location: auction.location,
          postal_code: auction.postal_code,
          canton: auction.canton,
          images: auction.images.slice(0, 3), // Limit images for performance
          
          // Auction-specific fields
          auction_end_time: auction.auction_end_time,
          current_bid: auction.current_bid,
          bid_count: auction.bid_count,
          min_bid_increment: auction.min_bid_increment,
          has_reserve_price: auction.reserve_price !== null,
          reserve_met: auction.auctions.reserve_met,
          auto_extend_minutes: auction.auto_extend_minutes,
          extended_count: auction.auctions.extended_count,
          max_extensions: auction.auctions.max_extensions,
          
          // Calculated fields
          auction_state: auctionState,
          time_remaining_seconds: timeRemaining,
          time_remaining_formatted: formatTimeRemaining(timeRemaining),
          next_min_bid: nextMinBid,
          urgency_level: urgencyLevel,
          
          // Statistics
          views: auction.views,
          favorites_count: auction.favorites_count,
          unique_bidders: auction.auctions.unique_bidders,
          
          // Relations
          profiles: auction.profiles,
          categories: auction.categories,
          
          // User interaction (if authenticated)
          ...(user && {
            is_owner: auction.user_id === user.id,
            can_bid: auction.user_id !== user.id
          })
        }
      })

      // Group auctions by urgency for better UX
      const groupedAuctions = {
        critical: transformedAuctions.filter(a => a.urgency_level === 'critical'),
        high: transformedAuctions.filter(a => a.urgency_level === 'high'),
        medium: transformedAuctions.filter(a => a.urgency_level === 'medium'),
        low: transformedAuctions.filter(a => a.urgency_level === 'low')
      }

      // Calculate summary statistics
      const summary = {
        total_auctions: transformedAuctions.length,
        ending_in_5_minutes: groupedAuctions.critical.length,
        ending_in_30_minutes: groupedAuctions.critical.length + groupedAuctions.high.length,
        ending_in_1_hour: transformedAuctions.filter(a => a.time_remaining_seconds <= 3600).length,
        total_active_bids: transformedAuctions.reduce((sum, a) => sum + a.bid_count, 0),
        average_current_bid: transformedAuctions.length > 0 
          ? transformedAuctions.reduce((sum, a) => sum + a.current_bid, 0) / transformedAuctions.length 
          : 0,
        with_reserve: transformedAuctions.filter(a => a.has_reserve_price).length,
        reserve_met: transformedAuctions.filter(a => a.reserve_met).length
      }

      // Prepare response
      const responseData = {
        auctions: transformedAuctions,
        grouped: groupedAuctions,
        summary,
        query_params: {
          hours: query.hours,
          limit: query.limit,
          include_extended: query.include_extended
        },
        generated_at: now.toISOString(),
        next_update_recommended: new Date(now.getTime() + 30000).toISOString() // 30 seconds
      }

      // Set cache headers for frequent updates
      const response = createSuccessResponse(responseData, 200)
      response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30')
      response.headers.set('Vary', 'Authorization')
      
      return response

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions/ending-soon:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * Helper function to format time remaining in human-readable format
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ended'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}