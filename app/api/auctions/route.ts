import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  auctionsQuerySchema,
  calculateAuctionState,
  calculateTimeRemaining,
  calculateNextMinBid,
  type AuctionsQuery
} from "@/lib/schemas/auctions-api-schema"
import { 
  withOptionalAuth, 
  validateQueryParams, 
  createErrorResponse,
  createSuccessResponse
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type AuctionWithRelations = Database['public']['Tables']['listings']['Row'] & {
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
    winner_id: string | null
    winning_bid: number | null
    total_bids: number
    unique_bidders: number
    extended_count: number
    max_extensions: number
    ended_at: string | null
  }
}

/**
 * GET /api/auctions
 * Fetch active auctions with filtering, pagination, and search
 * 
 * Features:
 * - 7-day duration auctions
 * - 5-minute auto-extensions
 * - Reserve price support
 * - Swiss market features (CHF, cantons, multilingual)
 * - Real-time auction state calculation
 */
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Validate query parameters
      const validation = validateQueryParams(searchParams, auctionsQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: AuctionsQuery = validation.data
      const supabase = await createServerComponentClient(req)

      // Build the base query with joins for auction listings only
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
          status,
          created_at,
          updated_at,
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
            winner_id,
            winning_bid,
            total_bids,
            unique_bidders,
            extended_count,
            max_extensions,
            ended_at
          )
        `)
        .eq('is_auction', true) // Only auction listings

      // Apply auction state filter
      const now = new Date().toISOString()
      switch (query.auction_state) {
        case 'draft':
          dbQuery = dbQuery.eq('status', 'draft')
          break
        case 'active':
          dbQuery = dbQuery
            .eq('status', 'active')
            .gt('auction_end_time', now)
          break
        case 'extended':
          dbQuery = dbQuery
            .eq('status', 'active')
            .gt('auction_end_time', now)
            .gt('auctions.extended_count', 0)
          break
        case 'ended':
          dbQuery = dbQuery.or(`status.eq.sold,status.eq.expired,auction_end_time.lte.${now}`)
          break
        case 'cancelled':
          dbQuery = dbQuery.eq('status', 'suspended')
          break
      }

      // Apply category filter
      if (query.category_id) {
        dbQuery = dbQuery.eq('category_id', query.category_id)
      }

      // Apply brand filter
      if (query.brand) {
        dbQuery = dbQuery.ilike('brand', `%${query.brand}%`)
      }

      // Apply model filter
      if (query.model) {
        dbQuery = dbQuery.ilike('model', `%${query.model}%`)
      }

      // Apply fuel type filter
      if (query.fuel_type) {
        dbQuery = dbQuery.eq('fuel_type', query.fuel_type)
      }

      // Apply transmission filter
      if (query.transmission) {
        dbQuery = dbQuery.eq('transmission', query.transmission)
      }

      // Apply condition filter
      if (query.condition) {
        dbQuery = dbQuery.eq('condition', query.condition)
      }

      // Apply reserve price filters
      if (query.has_reserve !== undefined) {
        if (query.has_reserve) {
          dbQuery = dbQuery.not('reserve_price', 'is', null)
        } else {
          dbQuery = dbQuery.is('reserve_price', null)
        }
      }

      if (query.reserve_met !== undefined) {
        dbQuery = dbQuery.eq('auctions.reserve_met', query.reserve_met)
      }

      // Apply ending within hours filter
      if (query.ending_within_hours) {
        const endTime = new Date()
        endTime.setHours(endTime.getHours() + query.ending_within_hours)
        dbQuery = dbQuery
          .gt('auction_end_time', now)
          .lte('auction_end_time', endTime.toISOString())
      }

      // Apply bid range filters
      if (query.bid_min !== undefined) {
        dbQuery = dbQuery.gte('current_bid', query.bid_min)
      }
      if (query.bid_max !== undefined) {
        dbQuery = dbQuery.lte('current_bid', query.bid_max)
      }

      // Apply year range filters
      if (query.year_min !== undefined) {
        dbQuery = dbQuery.gte('year', query.year_min)
      }
      if (query.year_max !== undefined) {
        dbQuery = dbQuery.lte('year', query.year_max)
      }

      // Apply mileage range filters
      if (query.mileage_min !== undefined) {
        dbQuery = dbQuery.gte('mileage', query.mileage_min)
      }
      if (query.mileage_max !== undefined) {
        dbQuery = dbQuery.lte('mileage', query.mileage_max)
      }

      // Apply location filters
      if (query.location) {
        dbQuery = dbQuery.ilike('location', `%${query.location}%`)
      }
      if (query.canton) {
        dbQuery = dbQuery.eq('canton', query.canton)
      }
      if (query.postal_code) {
        dbQuery = dbQuery.eq('postal_code', query.postal_code)
      }

      // Apply search filter (searches across title, brand, model, description)
      if (query.search) {
        dbQuery = dbQuery.or(`
          title.ilike.%${query.search}%,
          brand.ilike.%${query.search}%,
          model.ilike.%${query.search}%,
          description.ilike.%${query.search}%
        `)
      }

      // Apply sorting
      const sortColumn = query.sort_by
      const sortOrder = query.sort_order === 'asc' ? { ascending: true } : { ascending: false }
      
      if (sortColumn === 'auction_end_time') {
        // Special handling for auction end time - nulls last
        dbQuery = dbQuery.order('auction_end_time', { ...sortOrder, nullsFirst: false })
      } else if (sortColumn === 'current_bid') {
        dbQuery = dbQuery.order('current_bid', sortOrder)
      } else if (sortColumn === 'bid_count') {
        dbQuery = dbQuery.order('bid_count', sortOrder)
      } else {
        dbQuery = dbQuery.order(sortColumn, sortOrder)
      }

      // Get total count for pagination (simplified count query)
      const { count: totalCount, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_auction', true)
        .eq('status', query.auction_state === 'draft' ? 'draft' : 'active')

      if (countError) {
        console.error('Error getting auctions count:', countError)
        return createErrorResponse('Failed to get auctions count', 500)
      }

      // Apply pagination
      const offset = (query.page - 1) * query.limit
      dbQuery = dbQuery.range(offset, offset + query.limit - 1)

      // Execute the query
      const { data: auctions, error } = await dbQuery

      if (error) {
        console.error('Error fetching auctions:', error)
        return createErrorResponse('Failed to fetch auctions', 500)
      }

      // Transform the data to include calculated auction states and time remaining
      const transformedAuctions = (auctions as unknown as AuctionWithRelations[]).map(auction => {
        const auctionState = calculateAuctionState(
          auction.auction_end_time || '',
          auction.auctions.extended_count,
          auction.status
        )
        
        const timeRemaining = auction.auction_end_time 
          ? calculateTimeRemaining(auction.auction_end_time)
          : 0
        
        const nextMinBid = calculateNextMinBid(auction.current_bid, auction.min_bid_increment)

        return {
          id: auction.auctions.id,
          listing_id: auction.id,
          title: auction.title,
          description: auction.description,
          brand: auction.brand,
          model: auction.model,
          year: auction.year,
          price: auction.auctions.starting_price, // Starting price from auctions table
          currency: auction.currency,
          location: auction.location,
          postal_code: auction.postal_code,
          canton: auction.canton,
          images: auction.images,
          
          // Auction-specific fields
          auction_end_time: auction.auction_end_time,
          current_bid: auction.current_bid,
          bid_count: auction.bid_count,
          min_bid_increment: auction.min_bid_increment,
          reserve_price: auction.reserve_price,
          reserve_met: auction.auctions.reserve_met,
          auto_extend_minutes: auction.auto_extend_minutes,
          extended_count: auction.auctions.extended_count,
          max_extensions: auction.auctions.max_extensions,
          
          // Calculated auction state
          auction_state: auctionState,
          time_remaining_seconds: timeRemaining,
          next_min_bid: nextMinBid,
          
          // Statistics
          views: auction.views,
          favorites_count: auction.favorites_count,
          unique_bidders: auction.auctions.unique_bidders,
          
          // Timestamps
          created_at: auction.created_at,
          updated_at: auction.updated_at,
          ended_at: auction.auctions.ended_at,
          
          // Relations
          profiles: auction.profiles,
          categories: auction.categories,
        }
      })

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

      // Return paginated response
      return createSuccessResponse(
        {
          data: transformedAuctions,
          pagination: paginationMeta,
          filters: {
            auction_state: query.auction_state,
            category_id: query.category_id,
            brand: query.brand,
            model: query.model,
            fuel_type: query.fuel_type,
            transmission: query.transmission,
            condition: query.condition,
            has_reserve: query.has_reserve,
            reserve_met: query.reserve_met,
            ending_within_hours: query.ending_within_hours,
            bid_range: query.bid_min || query.bid_max ? {
              min: query.bid_min,
              max: query.bid_max
            } : undefined,
            year_range: query.year_min || query.year_max ? {
              min: query.year_min,
              max: query.year_max
            } : undefined,
            mileage_range: query.mileage_min || query.mileage_max ? {
              min: query.mileage_min,
              max: query.mileage_max
            } : undefined,
            location: query.location,
            canton: query.canton,
            postal_code: query.postal_code,
            search: query.search,
            sort_by: query.sort_by,
            sort_order: query.sort_order
          }
        },
        200
      )

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}