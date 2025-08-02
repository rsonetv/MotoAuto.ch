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
import type { Database } from "@/lib/database.types"

type BidWithProfile = Database['public']['Tables']['bids']['Row'] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
    is_dealer: boolean
    dealer_name: string | null
  } | null
}

type AuctionWithDetails = Database['public']['Tables']['listings']['Row'] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
    is_dealer: boolean
    dealer_name: string | null
    location: string | null
    canton: string | null
    rating: number
    rating_count: number
  } | null
  categories: {
    name_en: string
    name_de: string
    name_fr: string
    name_pl: string
    slug: string
  } | null
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
  }[]
  bids: BidWithProfile[]
}

/**
 * GET /api/auctions/[id]
 * Get specific auction details with bid history
 *
 * Features:
 * - Complete auction information
 * - Bid history with bidder details (anonymized for privacy)
 * - Real-time auction status
 * - Reserve price status (hidden amount)
 * - Extension history and capabilities
 * - Seller information
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

      // First, get the auction from the auctions table to get the listing_id
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('listing_id')
        .eq('id', auctionId)
        .single()

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found', 404)
      }

      // Get the complete auction details with all relations
      const { data: auction, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name,
            location,
            canton,
            rating,
            rating_count
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
            ended_at,
            payment_due_date,
            payment_received,
            pickup_arranged
          )
        `)
        .eq('id', auctionData.listing_id)
        .eq('is_auction', true)
        .single()

      if (error || !auction || !auction.auctions || !Array.isArray(auction.auctions) || auction.auctions.length === 0) {
        return createErrorResponse('Auction not found', 404)
      }

      const auctionDetails = auction.auctions[0];

      // Get bid history - limit to recent bids for performance
      // Show more details to auction owner, less to others for privacy
      const isOwner = user && auction.user_id === user.id
      const bidLimit = isOwner ? 100 : 50 // Show more bids to owner

      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          is_auto_bid,
          status,
          placed_at,
          user_id,
          profiles (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name
          )
        `)
        .eq('auction_id', auctionId)
        .in('status', ['active', 'outbid', 'winning', 'won'])
        .order('placed_at', { ascending: false })
        .limit(bidLimit)

      if (bidsError) {
        console.error('Error fetching bids:', bidsError)
        // Don't fail the request, just return empty bids
      }

      // Calculate auction state and timing
      const auctionState = calculateAuctionState(
        auction.auction_end_time || '',
        auctionDetails.extended_count,
        auction.status
      )
      
      const timeRemaining = auction.auction_end_time
        ? calculateTimeRemaining(auction.auction_end_time)
        : 0
      
      const nextMinBid = calculateNextMinBid(auction.current_bid, auction.min_bid_increment)

      // Get the last bid time for extension calculation
      const lastBidTime = bids && bids.length > 0 ? bids[0].placed_at : null
      
      const canExtend = auction.auction_end_time ? canExtendAuction(
        auction.auction_end_time,
        auctionDetails.extended_count,
        auctionDetails.max_extensions,
        lastBidTime || undefined
      ) : false

      // Anonymize bidder information for privacy (except for owner and the bidder themselves)
      const processedBids = (bids as unknown as BidWithProfile[] || []).map((bid, index) => {
        const isBidder = user && bid.user_id === user.id
        const showFullDetails = isOwner || isBidder
        
        return {
          id: bid.id,
          amount: bid.amount,
          is_auto_bid: bid.is_auto_bid,
          status: bid.status,
          placed_at: bid.placed_at,
          profiles: showFullDetails ? bid.profiles : {
            full_name: `Bidder ${String.fromCharCode(65 + (index % 26))}`, // Anonymous names like "Bidder A", "Bidder B"
            avatar_url: null,
            is_dealer: bid.profiles?.is_dealer || false,
            dealer_name: bid.profiles?.is_dealer ? 'Dealer' : null
          }
        }
      })

      // Check if user has this auction in watchlist
      let isWatched = false
      if (user) {
        const { data: watchData } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', auction.id)
          .single()
        
        isWatched = !!watchData
      }

      // Prepare response data
      const responseData = {
        id: auctionDetails.id,
        listing_id: auction.id,
        title: auction.title,
        description: auction.description,
        brand: auction.brand,
        model: auction.model,
        year: auction.year,
        mileage: auction.mileage,
        engine_capacity: auction.engine_capacity,
        power_hp: auction.power_hp,
        power_kw: auction.power_kw,
        fuel_type: auction.fuel_type,
        transmission: auction.transmission,
        drivetrain: auction.drivetrain,
        color: auction.color,
        interior_color: auction.interior_color,
        vin: isOwner ? auction.vin : null, // Only show VIN to owner
        condition: auction.condition,
        accident_free: auction.accident_free,
        owners_count: auction.owners_count,
        has_service_book: auction.has_service_book,
        last_service_km: auction.last_service_km,
        last_service_date: auction.last_service_date,
        
        // Pricing and location
        price: auctionDetails.starting_price,
        currency: auction.currency,
        location: auction.location,
        postal_code: auction.postal_code,
        canton: auction.canton,
        country: auction.country,
        
        // Media
        images: auction.images,
        video_url: auction.video_url,
        features: auction.features,
        equipment: auction.equipment,
        
        // Auction-specific fields
        auction_end_time: auction.auction_end_time,
        current_bid: auction.current_bid,
        bid_count: auction.bid_count,
        min_bid_increment: auction.min_bid_increment,
        reserve_price: isOwner ? auction.reserve_price : null, // Only show reserve price to owner
        has_reserve_price: auction.reserve_price !== null,
        reserve_met: auctionDetails.reserve_met,
        auto_extend_minutes: auction.auto_extend_minutes,
        extended_count: auctionDetails.extended_count,
        max_extensions: auctionDetails.max_extensions,
        
        // Calculated fields
        auction_state: auctionState,
        time_remaining_seconds: timeRemaining,
        next_min_bid: nextMinBid,
        can_extend: canExtend,
        
        // Winner information (only after auction ends)
        winner_id: auctionState === 'ended' ? auctionDetails.winner_id : null,
        winning_bid: auctionState === 'ended' ? auctionDetails.winning_bid : null,
        
        // Payment and pickup status (only for winner and seller)
        payment_due_date: (isOwner || (user && auctionDetails.winner_id === user.id))
          ? auctionDetails.payment_due_date : null,
        payment_received: isOwner ? auctionDetails.payment_received : null,
        pickup_arranged: isOwner ? auctionDetails.pickup_arranged : null,
        
        // Statistics
        views: auction.views,
        favorites_count: auction.favorites_count,
        unique_bidders: auctionDetails.unique_bidders,
        
        // User interaction
        is_watched: isWatched,
        is_owner: isOwner,
        can_bid: user && !isOwner && auctionState === 'active',
        
        // Timestamps
        created_at: auction.created_at,
        updated_at: auction.updated_at,
        published_at: auction.published_at,
        ended_at: auctionDetails.ended_at,
        
        // Relations
        profiles: auction.profiles,
        categories: auction.categories,
        
        // Bid history
        bids: processedBids,
        
        // Commission information (for transparency)
        commission_rate: 0.05,
        max_commission_chf: 500,
        estimated_commission: Math.min(auction.current_bid * 0.05, 500)
      }

      return createSuccessResponse(responseData, 200)

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions/[id]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}