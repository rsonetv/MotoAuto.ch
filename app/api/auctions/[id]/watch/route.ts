import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  watchlistActionSchema,
  type WatchlistAction
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
 * POST /api/auctions/[id]/watch
 * Add or remove auction from user's watchlist
 * 
 * Features:
 * - Add/remove auctions from watchlist
 * - Prevent watching own auctions
 * - Return updated watchlist count
 * - Support for notifications (future enhancement)
 * - Secure transaction handling to prevent SQL injection
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

      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, watchlistActionSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid request data: ${validation.error}`, 400)
      }

      const { action }: WatchlistAction = validation.data
      const supabase = await createServerComponentClient(req)

      // First, get the auction to verify it exists and get the listing_id
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          listing_id,
          listings!inner (
            id,
            user_id,
            title,
            status,
            is_auction
          )
        `)
        .eq('id', auctionId)
        .single()

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found', 404)
      }

      const listing = auctionData.listings as any
      
      // Prevent users from watching their own auctions
      if (listing.user_id === user.id) {
        return createErrorResponse('Cannot watch your own auction', 400)
      }

      // Check if auction is still active
      if (!listing.is_auction || listing.status !== 'active') {
        return createErrorResponse('Can only watch active auctions', 400)
      }

      if (action === 'add') {
        // Use secure RPC function to add to watchlist with atomic operations
        const { error: addError } = await supabase.rpc('add_auction_to_watchlist', {
          p_user_id: user.id,
          p_listing_id: listing.id,
          p_auction_id: auctionId
        })

        if (addError) {
          console.error('Error adding to watchlist:', addError)
          // Check if it's a duplicate key error (already watching)
          if (addError.code === '23505') {
            return createErrorResponse('Auction is already in your watchlist', 409)
          }
          return createErrorResponse('Failed to add auction to watchlist', 500)
        }

      } else if (action === 'remove') {
        // Use secure RPC function to remove from watchlist with atomic operations
        const { error: removeError } = await supabase.rpc('remove_auction_from_watchlist', {
          p_user_id: user.id,
          p_listing_id: listing.id,
          p_auction_id: auctionId
        })

        if (removeError) {
          console.error('Error removing from watchlist:', removeError)
          return createErrorResponse('Failed to remove auction from watchlist', 500)
        }
      } else {
        return createErrorResponse('Invalid action. Must be "add" or "remove"', 400)
      }

      // Get the updated total watchlist count for the user
      const { count: totalWatched, error: countError } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        console.error('Error getting watchlist count:', countError)
      }

      // Prepare response
      const responseData = {
        success: true,
        action: action === 'add' ? 'added' as const : 'removed' as const,
        auction_id: auctionId,
        listing_id: listing.id,
        auction_title: listing.title,
        total_watched: totalWatched || 0
      }

      return createSuccessResponse(
        responseData,
        200,
        { 
          message: action === 'add' 
            ? 'Auction added to watchlist successfully' 
            : 'Auction removed from watchlist successfully'
        }
      )

    } catch (error) {
      console.error('Unexpected error in POST /api/auctions/[id]/watch:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * GET /api/auctions/[id]/watch
 * Check if auction is in user's watchlist
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

      const supabase = await createServerComponentClient(req)

      // Get the auction to get the listing_id
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('listing_id')
        .eq('id', auctionId)
        .single()

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found', 404)
      }

      // Check if user has this auction in watchlist
      const { data: watchData, error: watchError } = await supabase
        .from('user_favorites')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('listing_id', auctionData.listing_id)
        .single()

      if (watchError && watchError.code !== 'PGRST116') {
        console.error('Error checking watchlist status:', watchError)
        return createErrorResponse('Failed to check watchlist status', 500)
      }

      const isWatched = !!watchData
      const watchedSince = watchData?.created_at || null

      // Get total watchlist count
      const { count: totalWatched, error: countError } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        console.error('Error getting watchlist count:', countError)
      }

      return createSuccessResponse({
        auction_id: auctionId,
        listing_id: auctionData.listing_id,
        is_watched: isWatched,
        watched_since: watchedSince,
        total_watched: totalWatched || 0
      }, 200)

    } catch (error) {
      console.error('Unexpected error in GET /api/auctions/[id]/watch:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * DELETE /api/auctions/[id]/watch
 * Remove auction from user's watchlist (alternative to POST with remove action)
 */
export async function DELETE(
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

      const supabase = await createServerComponentClient(req)

      // Get the auction to verify it exists and get the listing_id
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('listing_id')
        .eq('id', auctionId)
        .single()

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found', 404)
      }

      // Check if favorite exists
      const { data: existingFavorite, error: favoriteCheckError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', auctionData.listing_id)
        .single()

      if (favoriteCheckError && favoriteCheckError.code !== 'PGRST116') {
        console.error('Error checking existing favorite:', favoriteCheckError)
        return createErrorResponse('Failed to check watchlist status', 500)
      }

      if (!existingFavorite) {
        return createErrorResponse('Auction is not in your watchlist', 400)
      }

      // Use secure RPC function to remove from watchlist with atomic operations
      const { error: removeError } = await supabase.rpc('remove_auction_from_watchlist', {
        p_user_id: user.id,
        p_listing_id: auctionData.listing_id,
        p_auction_id: auctionId
      })

      if (removeError) {
        console.error('Error removing from watchlist:', removeError)
        return createErrorResponse('Failed to remove auction from watchlist', 500)
      }

      // Get updated total watchlist count
      const { count: totalWatched, error: countError } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        console.error('Error getting watchlist count:', countError)
      }

      return createSuccessResponse(
        {
          auction_id: auctionId,
          listing_id: auctionData.listing_id,
          action: 'removed',
          is_watched: false,
          total_watched: totalWatched || 0
        },
        200,
        { message: 'Auction removed from watchlist successfully' }
      )

    } catch (error) {
      console.error('Unexpected error in DELETE /api/auctions/[id]/watch:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}