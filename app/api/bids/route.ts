import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withAuth, validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { placeBidSchema, validateSwissUser, checkBidRateLimit, calculateMinBidIncrement } from "@/lib/schemas/bids-api-schema"
import { BidStatus } from "@/lib/database.types"
import type { PlaceBid } from "@/lib/schemas/bids-api-schema"

/**
 * POST /api/bids - Place a new bid on an auction
 * 
 * Features:
 * - Comprehensive bid validation (amount, increment, auction status)
 * - Swiss market compliance (user verification, CHF currency)
 * - Auto-bidding support with maximum bid limits
 * - Auction extension logic for last-minute bids
 * - Rate limiting and fraud prevention
 * - Real-time notification preparation
 * - Automatic outbid handling
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      // Parse and validate request body
      const body = await request.json()
      const validation = validateRequestBody(body, placeBidSchema)
      
      if (!validation.success) {
        return createErrorResponse(validation.error, 400)
      }

      const bidData = validation.data as PlaceBid

      // Validate Swiss user requirements
      const userValidation = validateSwissUser(profile)
      if (!userValidation.valid) {
        return createErrorResponse(userValidation.error!, 403)
      }

      // Check rate limiting (max 5 bids per minute)
      // Get recent bids for rate limiting
      const supabase = await createServerComponentClient(req)
      const { data: recentBids } = await supabase
        .from('bids')
        .select('placed_at')
        .eq('user_id', user.id)
        .gte('placed_at', new Date(Date.now() - 60 * 1000).toISOString())
        .order('placed_at', { ascending: false })
      
      const recentBidsFormatted = recentBids?.map((bid: any) => ({ placed_at: bid.placed_at })) || []
      const rateLimitCheck = checkBidRateLimit(recentBidsFormatted, 5)
      
      if (!rateLimitCheck.allowed) {
        return createErrorResponse(rateLimitCheck.error!, 429, {
          waitTime: rateLimitCheck.waitTime
        })
      }

      // Get client IP and user agent for tracking
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      // Get current auction data for validation
      const { data: auctionData, error: auctionError } = await supabase
        .from('listings')
        .select(`
          id,
          current_bid,
          bid_count,
          min_bid_increment,
          auction_end_time,
          auto_extend_minutes,
          user_id,
          status,
          auctions!inner (
            id,
            extended_count,
            max_extensions,
            reserve_price,
            reserve_met
          )
        `)
        .eq('id', bidData.listing_id)
        .eq('is_auction', true)
        .single()

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found or not active', 404)
      }

      // Validate auction is still active
      const now = new Date()
      const endTime = new Date(auctionData.auction_end_time)
      
      if (auctionData.status !== 'active') {
        return createErrorResponse('Auction is not active', 400)
      }
      
      if (endTime <= now) {
        return createErrorResponse('Auction has ended', 400)
      }

      // Prevent seller from bidding on own auction
      if (auctionData.user_id === user.id) {
        return createErrorResponse('Cannot bid on your own auction', 403)
      }

      // Validate bid amount meets minimum increment
      const minIncrement = auctionData.min_bid_increment || calculateMinBidIncrement(auctionData.current_bid)
      const nextMinBid = auctionData.current_bid + minIncrement
      
      if (bidData.amount < nextMinBid) {
        return createErrorResponse(`Bid must be at least ${nextMinBid.toFixed(2)} CHF`, 400)
      }

      // Check for duplicate bid amount from same user
      const { data: existingBid } = await supabase
        .from('bids')
        .select('id')
        .eq('listing_id', bidData.listing_id)
        .eq('user_id', user.id)
        .eq('amount', bidData.amount)
        .neq('status', BidStatus.RETRACTED)
        .single()
      
      if (existingBid) {
        return createErrorResponse('You have already placed a bid for this amount', 400)
      }

      // Update status of previous bids to outbid
      await supabase
        .from('bids')
        .update({ status: BidStatus.OUTBID })
        .eq('listing_id', bidData.listing_id)
        .in('status', [BidStatus.WINNING, BidStatus.ACTIVE])

      // Check if auction should be extended (bid placed in last 5 minutes)
      const timeUntilEnd = endTime.getTime() - now.getTime()
      const fiveMinutes = 5 * 60 * 1000
      const shouldExtend = timeUntilEnd <= fiveMinutes &&
                          auctionData.auctions.extended_count < auctionData.auctions.max_extensions

      let newEndTime: string | undefined
      let extendedCount = auctionData.auctions.extended_count

      if (shouldExtend) {
        const extensionMinutes = auctionData.auto_extend_minutes || 5
        newEndTime = new Date(endTime.getTime() + extensionMinutes * 60 * 1000).toISOString()
        extendedCount += 1

        // Update auction end time and extension count
        await supabase
          .from('listings')
          .update({ auction_end_time: newEndTime })
          .eq('id', bidData.listing_id)

        await supabase
          .from('auctions')
          .update({ extended_count: extendedCount })
          .eq('listing_id', bidData.listing_id)
      }

      // Insert the new bid
      const { data: newBid, error: bidError } = await supabase
        .from('bids')
        .insert({
          listing_id: bidData.listing_id,
          auction_id: bidData.auction_id,
          user_id: user.id,
          amount: bidData.amount,
          is_auto_bid: bidData.is_auto_bid || false,
          max_auto_bid: bidData.max_auto_bid,
          auto_bid_active: bidData.is_auto_bid || false,
          status: BidStatus.WINNING,
          ip_address: clientIP,
          user_agent: userAgent,
          placed_at: now.toISOString()
        })
        .select()
        .single()

      if (bidError || !newBid) {
        return createErrorResponse('Failed to place bid', 500)
      }

      // Update listing statistics
      const newBidCount = auctionData.bid_count + 1
      await supabase
        .from('listings')
        .update({
          current_bid: bidData.amount,
          bid_count: newBidCount
        })
        .eq('id', bidData.listing_id)

      // Check if reserve price is met
      const reserveMet = !auctionData.auctions.reserve_price || bidData.amount >= auctionData.auctions.reserve_price

      // Update auction statistics
      await supabase
        .from('auctions')
        .update({
          reserve_met: reserveMet,
          total_bids: newBidCount
        })
        .eq('listing_id', bidData.listing_id)

      // Prepare response
      const response = {
        success: true,
        bid: newBid,
        auction_updated: {
          current_bid: bidData.amount,
          bid_count: newBidCount,
          next_min_bid: bidData.amount + minIncrement,
          auction_extended: shouldExtend,
          new_end_time: newEndTime
        }
      }

      return createSuccessResponse(response, 201)

    } catch (error: any) {
      console.error('Bid placement error:', error)
      
      // Handle specific business logic errors
      if (error.message.includes('Auction not found') ||
          error.message.includes('Auction is not active') ||
          error.message.includes('Auction has ended')) {
        return createErrorResponse(error.message, 404)
      }
      
      if (error.message.includes('Cannot bid on your own auction') ||
          error.message.includes('already placed a bid')) {
        return createErrorResponse(error.message, 403)
      }
      
      if (error.message.includes('Bid must be at least')) {
        return createErrorResponse(error.message, 400)
      }

      return createErrorResponse(
        'Failed to place bid. Please try again.',
        500,
        { details: error.message }
      )
    }
  })
}