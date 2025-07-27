import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { 
  auctionExtensionSchema,
  calculateAuctionState,
  calculateTimeRemaining,
  canExtendAuction,
  type AuctionExtension
} from "@/lib/schemas/auctions-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  isValidUUID,
  type AuthContext
} from "@/lib/auth-middleware"

/**
 * POST /api/auctions/[id]/extend
 * Handle auction extensions (5-minute rule) with proper race condition handling
 * 
 * Features:
 * - Automatic 5-minute extensions when bids placed in last 5 minutes
 * - Manual extensions by auction owner (limited)
 * - Extension limits (max 10 extensions)
 * - Proper logging and audit trail
 * - Swiss market compliance
 * - Atomic transactions to prevent race conditions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const auctionId = params.id

      // Validate auction ID format
      if (!isValidUUID(auctionId)) {
        return createErrorResponse('Invalid auction ID format', 400)
      }

      // Parse and validate request body
      const body = await req.json()
      const validation = validateRequestBody(body, auctionExtensionSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid extension data: ${validation.error}`, 400)
      }

      const extensionData: AuctionExtension = validation.data
      const supabase = createServerComponentClient()

      // Use atomic transaction to prevent race conditions
      const { data: extensionResult, error: extensionError } = await supabase.rpc('extend_auction_atomic', {
        p_auction_id: auctionId,
        p_user_id: user.id,
        p_extension_minutes: extensionData.minutes || 5,
        p_reason: extensionData.reason || 'Manual extension by owner'
      })

      if (extensionError) {
        console.error('Error extending auction:', extensionError)
        
        // Handle specific error cases
        switch (extensionError.code) {
          case 'P0001': // Custom error from stored procedure
            return createErrorResponse(extensionError.message, 400)
          case '23505': // Unique constraint violation
            return createErrorResponse('Extension already in progress', 409)
          default:
            return createErrorResponse('Failed to extend auction', 500)
        }
      }

      if (!extensionResult || !extensionResult.success) {
        return createErrorResponse(
          extensionResult?.error_message || 'Extension not allowed',
          400
        )
      }

      // Calculate new time remaining
      const timeRemaining = calculateTimeRemaining(extensionResult.new_end_time)

      // Prepare response
      const responseData = {
        success: true,
        extended: true,
        auction_id: auctionId,
        listing_id: extensionResult.listing_id,
        previous_end_time: extensionResult.previous_end_time,
        new_end_time: extensionResult.new_end_time,
        extension_minutes: extensionResult.extension_minutes,
        extension_count: extensionResult.extension_count,
        max_extensions: extensionResult.max_extensions,
        time_remaining_seconds: timeRemaining,
        can_extend_again: extensionResult.extension_count < extensionResult.max_extensions,
        reason: extensionData.reason || 'Manual extension by owner'
      }

      return createSuccessResponse(
        responseData,
        200,
        { 
          message: `Auction extended by ${extensionResult.extension_minutes} minutes. New end time: ${new Date(extensionResult.new_end_time).toLocaleString()}`
        }
      )

    } catch (error) {
      console.error('Unexpected error in POST /api/auctions/[id]/extend:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * GET /api/auctions/[id]/extend
 * Check if auction can be extended and get extension info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const auctionId = params.id

      // Validate auction ID format
      if (!isValidUUID(auctionId)) {
        return createErrorResponse('Invalid auction ID format', 400)
      }

      const supabase = createServerComponentClient()

      // Get auction details with proper joins
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          id,
          listing_id,
          extended_count,
          max_extensions,
          listings!inner (
            user_id,
            auction_end_time,
            status,
            auto_extend_minutes
          )
        `)
        .eq('id', auctionId)
        .single()

      if (auctionError || !auction) {
        return createErrorResponse('Auction not found', 404)
      }

      const listing = auction.listings as any

      // Check if user is the auction owner
      const isOwner = listing.user_id === user.id
      if (!isOwner) {
        return createErrorResponse('Only auction owner can check extension status', 403)
      }

      // Get the most recent bid with proper error handling
      const { data: lastBid, error: bidError } = await supabase
        .from('bids')
        .select('placed_at, amount')
        .eq('auction_id', auctionId)
        .order('placed_at', { ascending: false })
        .limit(1)
        .single()

      // Don't fail if no bids exist
      if (bidError && bidError.code !== 'PGRST116') {
        console.error('Error fetching last bid:', bidError)
      }

      // Check if extension is possible
      const canExtend = listing.auction_end_time ? canExtendAuction(
        listing.auction_end_time,
        auction.extended_count,
        auction.max_extensions,
        lastBid?.placed_at
      ) : false

      const auctionState = calculateAuctionState(
        listing.auction_end_time || '',
        auction.extended_count,
        listing.status
      )

      const timeRemaining = listing.auction_end_time 
        ? calculateTimeRemaining(listing.auction_end_time)
        : 0

      // Prepare extension info
      const extensionInfo = {
        auction_id: auctionId,
        can_extend: canExtend,
        auction_state: auctionState,
        extended_count: auction.extended_count,
        max_extensions: auction.max_extensions,
        extensions_remaining: auction.max_extensions - auction.extended_count,
        time_remaining_seconds: timeRemaining,
        auto_extend_minutes: listing.auto_extend_minutes,
        last_bid_time: lastBid?.placed_at || null,
        last_bid_amount: lastBid?.amount || null,
        reasons_cannot_extend: [] as string[]
      }

      // Add reasons why extension might not be possible
      if (auctionState !== 'active' && auctionState !== 'extended') {
        extensionInfo.reasons_cannot_extend.push('Auction is not active')
      }
      if (auction.extended_count >= auction.max_extensions) {
        extensionInfo.reasons_cannot_extend.push('Maximum extensions reached')
      }
      if (!lastBid || !listing.auction_end_time) {
        extensionInfo.reasons_cannot_extend.push('No recent bidding activity')
      } else {
        const endTime = new Date(listing.auction_end_time)
        const lastBidTime = new Date(lastBid.placed_at)
        const timeSinceLastBid = endTime.getTime() - lastBidTime.getTime()
        if (timeSinceLastBid > 5 * 60 * 1000) {
          extensionInfo.reasons_cannot_extend.push('No bids in the last 5 minutes')
        }
      }

      return createSuccessResponse(extensionInfo, 200)

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions/[id]/extend:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * PATCH /api/auctions/[id]/extend
 * Automatic extension triggered by bidding system (internal use)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const auctionId = params.id

      // Validate auction ID format
      if (!isValidUUID(auctionId)) {
        return createErrorResponse('Invalid auction ID format', 400)
      }

      const supabase = createServerComponentClient()

      // Use atomic auto-extension function
      const { data: autoExtensionResult, error: autoExtensionError } = await supabase.rpc('auto_extend_auction', {
        p_auction_id: auctionId,
        p_triggered_by_user_id: user.id
      })

      if (autoExtensionError) {
        console.error('Error auto-extending auction:', autoExtensionError)
        return createErrorResponse('Failed to auto-extend auction', 500)
      }

      if (!autoExtensionResult || !autoExtensionResult.extended) {
        return createSuccessResponse({
          extended: false,
          reason: autoExtensionResult?.reason || 'Auto-extension not triggered'
        }, 200)
      }

      // Calculate new time remaining
      const timeRemaining = calculateTimeRemaining(autoExtensionResult.new_end_time)

      // Prepare response
      const responseData = {
        success: true,
        extended: true,
        auto_extended: true,
        auction_id: auctionId,
        listing_id: autoExtensionResult.listing_id,
        previous_end_time: autoExtensionResult.previous_end_time,
        new_end_time: autoExtensionResult.new_end_time,
        extension_minutes: autoExtensionResult.extension_minutes,
        extension_count: autoExtensionResult.extension_count,
        max_extensions: autoExtensionResult.max_extensions,
        time_remaining_seconds: timeRemaining,
        can_extend_again: autoExtensionResult.extension_count < autoExtensionResult.max_extensions,
        reason: 'Automatic extension due to recent bidding activity'
      }

      return createSuccessResponse(
        responseData,
        200,
        { 
          message: `Auction auto-extended by ${autoExtensionResult.extension_minutes} minutes due to recent bidding activity`
        }
      )

    } catch (error) {
      console.error('Unexpected error in PATCH /api/auctions/[id]/extend:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}