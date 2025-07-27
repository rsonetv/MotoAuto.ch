import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { withAuth, validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { autoBidSetupSchema, validateSwissUser, calculateMinBidIncrement, type AutoBidSetup } from "@/lib/schemas/bids-api-schema"
import { BidStatus } from "@/lib/database.types"

/**
 * POST /api/bids/auto-bid - Set up automatic bidding
 * 
 * Features:
 * - Swiss market compliance (user verification required)
 * - Maximum bid amount validation
 * - Automatic initial bid placement
 * - Duplicate auto-bid prevention
 * - Auction status validation
 * - Seller self-bidding prevention
 * - Integration with existing bid system
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }) => {
    try {
      // Parse and validate request body
      const body = await request.json()
      const validation = validateRequestBody(body, autoBidSetupSchema)
      
      if (!validation.success) {
        return createErrorResponse(validation.error, 400)
      }

      const autoBidData = validation.data as AutoBidSetup
      const supabase = createServerComponentClient()

      // Validate Swiss user requirements
      const userValidation = validateSwissUser(profile)
      if (!userValidation.valid) {
        return createErrorResponse(userValidation.error!, 403)
      }

      // Check if user already has an active auto-bid for this auction
      const { data: existingAutoBid, error: existingError } = await supabase
        .from('bids')
        .select('id')
        .eq('listing_id', autoBidData.listing_id)
        .eq('user_id', user.id)
        .eq('is_auto_bid', true)
        .eq('auto_bid_active', true)
        .neq('status', BidStatus.RETRACTED)
        .single()

      if (existingAutoBid) {
        return createErrorResponse('You already have an active auto-bid for this auction', 400)
      }

      // Get current auction state for validation
      const { data: auctionData, error: auctionError } = await supabase
        .from('listings')
        .select(`
          id,
          current_bid,
          min_bid_increment,
          auction_end_time,
          status,
          user_id,
          auctions!inner (
            id,
            reserve_price
          )
        `)
        .eq('id', autoBidData.listing_id)
        .eq('is_auction', true)
        .single()

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found', 404)
      }

      // Prevent seller from setting up auto-bid on own auction
      if (auctionData.user_id === user.id) {
        return createErrorResponse('Cannot set up auto-bid on your own auction', 403)
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

      // Calculate minimum required bid
      const minIncrement = auctionData.min_bid_increment || calculateMinBidIncrement(auctionData.current_bid)
      const nextMinBid = auctionData.current_bid + minIncrement
      const initialBidAmount = autoBidData.initial_bid || nextMinBid

      // Validate bid amounts
      if (initialBidAmount > autoBidData.max_amount) {
        return createErrorResponse('Initial bid amount cannot exceed maximum auto-bid amount', 400)
      }

      if (initialBidAmount < nextMinBid) {
        return createErrorResponse(`Initial bid must be at least ${nextMinBid.toFixed(2)} CHF`, 400)
      }

      if (autoBidData.max_amount < nextMinBid) {
        return createErrorResponse(`Maximum auto-bid amount must be at least ${nextMinBid.toFixed(2)} CHF`, 400)
      }

      // Create auto-bid record
      const { data: autoBid, error: autoBidError } = await supabase
        .from('bids')
        .insert({
          listing_id: autoBidData.listing_id,
          auction_id: autoBidData.auction_id,
          user_id: user.id,
          amount: initialBidAmount,
          is_auto_bid: true,
          max_auto_bid: autoBidData.max_amount,
          auto_bid_active: true,
          status: BidStatus.ACTIVE,
          placed_at: now.toISOString()
        })
        .select()
        .single()

      if (autoBidError || !autoBid) {
        console.error('Error creating auto-bid:', autoBidError)
        return createErrorResponse('Failed to set up auto-bid', 500)
      }

      // If initial bid amount equals current minimum required bid, place it immediately
      let bidPlaced = false
      let auctionUpdated = null

      if (initialBidAmount >= nextMinBid && initialBidAmount > auctionData.current_bid) {
        // Update previous bids to outbid status
        await supabase
          .from('bids')
          .update({ status: BidStatus.OUTBID })
          .eq('listing_id', autoBidData.listing_id)
          .in('status', [BidStatus.WINNING, BidStatus.ACTIVE])
          .neq('id', autoBid.id)

        // Update the auto-bid to winning status
        await supabase
          .from('bids')
          .update({ status: BidStatus.WINNING })
          .eq('id', autoBid.id)

        // Update listing current bid
        await supabase
          .from('listings')
          .update({
            current_bid: initialBidAmount,
            bid_count: auctionData.current_bid === 0 ? 1 : auctionData.current_bid + 1
          })
          .eq('id', autoBidData.listing_id)

        // Check if reserve price is met
        const reserveMet = !auctionData.auctions.reserve_price || initialBidAmount >= auctionData.auctions.reserve_price

        // Update auction statistics
        await supabase
          .from('auctions')
          .update({
            reserve_met: reserveMet,
            total_bids: auctionData.current_bid === 0 ? 1 : auctionData.current_bid + 1
          })
          .eq('listing_id', autoBidData.listing_id)

        bidPlaced = true
        auctionUpdated = {
          current_bid: initialBidAmount,
          bid_count: auctionData.current_bid === 0 ? 1 : auctionData.current_bid + 1,
          next_min_bid: initialBidAmount + minIncrement,
          reserve_met: reserveMet
        }
      }

      // Prepare response
      const response = {
        success: true,
        auto_bid: {
          id: autoBid.id,
          listing_id: autoBid.listing_id,
          auction_id: autoBid.auction_id,
          user_id: autoBid.user_id,
          max_auto_bid: autoBid.max_auto_bid,
          auto_bid_active: autoBid.auto_bid_active,
          current_bid_amount: bidPlaced ? initialBidAmount : null,
          created_at: autoBid.created_at,
          updated_at: autoBid.updated_at || autoBid.created_at
        },
        initial_bid_placed: bidPlaced,
        auction_updated: auctionUpdated
      }

      return createSuccessResponse(response, 201)

    } catch (error: any) {
      console.error('Auto-bid setup error:', error)
      
      // Handle specific business logic errors
      if (error.message.includes('Auction not found')) {
        return createErrorResponse(error.message, 404)
      }
      
      if (error.message.includes('already have an active auto-bid') ||
          error.message.includes('Cannot set up auto-bid on your own auction')) {
        return createErrorResponse(error.message, 403)
      }
      
      if (error.message.includes('Auction is not active') ||
          error.message.includes('Auction has ended') ||
          error.message.includes('must be at least')) {
        return createErrorResponse(error.message, 400)
      }

      return createErrorResponse(
        'Failed to set up auto-bid. Please try again.',
        500,
        { details: error.message }
      )
    }
  })
}