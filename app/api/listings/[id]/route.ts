import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  updateListingSchema,
  type UpdateListingInput 
} from "@/lib/schemas/listings-api-schema"
import { 
  withOptionalAuth, 
  withAuth, 
  validateRequestBody,
  checkListingOwnership,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type ListingWithDetails = Database['public']['Tables']['listings']['Row'] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
    is_dealer: boolean
    dealer_name: string | null
    phone: string | null
    email: string
    location: string | null
    rating: number
    rating_count: number
  }
  categories: {
    name_en: string
    name_de: string
    name_fr: string
    name_pl: string
    slug: string
    parent_id: string | null
  }
  packages?: {
    name_en: string
    name_de: string
    name_fr: string
    name_pl: string
    features: any
  }
  auctions?: {
    starting_price: number
    reserve_met: boolean
    winner_id: string | null
    winning_bid: number | null
    total_bids: number
    unique_bidders: number
    extended_count: number
    ended_at: string | null
  }
  bids?: Array<{
    id: string
    amount: number
    placed_at: string
    is_auto_bid: boolean
    status: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
    }
  }>
}

/**
 * GET /api/listings/[id]
 * Get specific listing details with related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const { id } = params
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return createErrorResponse('Invalid listing ID format', 400)
      }

      const supabase = await createServerComponentClient(req)

      // Build query with comprehensive joins
      const { data: listing, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name,
            phone,
            email,
            location,
            rating,
            rating_count
          ),
          categories:category_id (
            name_en,
            name_de,
            name_fr,
            name_pl,
            slug,
            parent_id
          ),
          packages:package_id (
            name_en,
            name_de,
            name_fr,
            name_pl,
            features
          ),
          auctions (
            starting_price,
            reserve_met,
            winner_id,
            winning_bid,
            total_bids,
            unique_bidders,
            extended_count,
            ended_at
          ),
          bids (
            id,
            amount,
            placed_at,
            is_auto_bid,
            status,
            profiles:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return createErrorResponse('Listing not found', 404)
        }
        console.error('Error fetching listing:', error)
        return createErrorResponse('Failed to fetch listing', 500)
      }

      // Check if listing is accessible
      // Draft listings are only visible to the owner
      if (listing.status === 'draft' && (!user || user.id !== listing.user_id)) {
        return createErrorResponse('Listing not found', 404)
      }

      // Increment view count if not the owner
      if (!user || user.id !== listing.user_id) {
        const { error: viewError } = await supabase
          .from('listings')
          .update({ views: listing.views + 1 })
          .eq('id', id)

        if (viewError) {
          console.error('Error incrementing view count:', viewError)
          // Don't fail the request for this
        }
      }

      // Filter sensitive bid information for non-owners
      const processedListing = listing as ListingWithDetails
      if (listing.bids && (!user || user.id !== listing.user_id)) {
        // Non-owners can only see winning bids and their own bids
        processedListing.bids = listing.bids.filter((bid: any) => 
          bid.status === 'winning' || bid.status === 'won' || 
          (user && bid.user_id === user.id)
        )
      }

      // Add user-specific data if authenticated
      let userSpecificData = {}
      if (user) {
        // Check if user has favorited this listing
        const { data: favorite } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', id)
          .single()

        userSpecificData = {
          is_favorited: !!favorite,
          is_owner: user.id === listing.user_id
        }
      }

      return createSuccessResponse(
        {
          ...processedListing,
          ...userSpecificData
        },
        200
      )

    } catch (error) {
      console.error('Unexpected error in GET /api/listings/[id]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * PUT /api/listings/[id]
 * Update existing listing (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { id } = params
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return createErrorResponse('Invalid listing ID format', 400)
      }

      // Check ownership
      const isOwner = await checkListingOwnership(id, user.id)
      if (!isOwner) {
        return createErrorResponse('You can only update your own listings', 403)
      }

      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, updateListingSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid listing data: ${validation.error}`, 400)
      }

      const updateData: UpdateListingInput = validation.data
      const supabase = await createServerComponentClient(req)

      // Get current listing to check constraints
      const { data: currentListing, error: fetchError } = await supabase
        .from('listings')
        .select('status, is_auction, auction_end_time, bid_count')
        .eq('id', id)
        .single()

      if (fetchError || !currentListing) {
        return createErrorResponse('Listing not found', 404)
      }

      // Prevent certain updates on active auctions with bids
      if (currentListing.is_auction && currentListing.bid_count > 0) {
        const restrictedFields = ['price', 'auction_end_time', 'min_bid_increment', 'reserve_price']
        const hasRestrictedUpdates = restrictedFields.some(field => 
          updateData.hasOwnProperty(field)
        )
        
        if (hasRestrictedUpdates) {
          return createErrorResponse(
            'Cannot modify price, auction timing, or bid settings on auctions with existing bids',
            400
          )
        }
      }

      // Prepare update data
      const now = new Date().toISOString()
      const finalUpdateData = {
        ...updateData,
        updated_at: now
      }

      // Update the listing
      const { data: updatedListing, error: updateError } = await supabase
        .from('listings')
        .update(finalUpdateData)
        .eq('id', id)
        .select(`
          *,
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
          packages:package_id (
            name_en,
            name_de,
            name_fr,
            name_pl
          )
        `)
        .single()

      if (updateError) {
        console.error('Error updating listing:', updateError)
        return createErrorResponse('Failed to update listing', 500)
      }

      // If status changed to active, set published_at
      if (updateData.status === 'active' && currentListing.status !== 'active') {
        const { error: publishError } = await supabase
          .from('listings')
          .update({ published_at: now })
          .eq('id', id)

        if (publishError) {
          console.error('Error setting published_at:', publishError)
        }
      }

      return createSuccessResponse(
        updatedListing as ListingWithDetails,
        200,
        { message: 'Listing updated successfully' }
      )

    } catch (error) {
      console.error('Unexpected error in PUT /api/listings/[id]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * DELETE /api/listings/[id]
 * Delete listing (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { id } = params
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return createErrorResponse('Invalid listing ID format', 400)
      }

      // Check ownership
      const isOwner = await checkListingOwnership(id, user.id)
      if (!isOwner) {
        return createErrorResponse('You can only delete your own listings', 403)
      }

      const supabase = await createServerComponentClient(req)

      // Get listing details to check constraints
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('status, is_auction, bid_count, user_id')
        .eq('id', id)
        .single()

      if (fetchError || !listing) {
        return createErrorResponse('Listing not found', 404)
      }

      // Prevent deletion of active auctions with bids
      if (listing.is_auction && listing.bid_count > 0 && listing.status === 'active') {
        return createErrorResponse(
          'Cannot delete active auctions with existing bids. Please wait for the auction to end or contact support.',
          400
        )
      }

      // Delete related records first (due to foreign key constraints)
      
      // Delete bids
      const { error: bidsError } = await supabase
        .from('bids')
        .delete()
        .eq('listing_id', id)

      if (bidsError) {
        console.error('Error deleting bids:', bidsError)
        return createErrorResponse('Failed to delete listing bids', 500)
      }

      // Delete auction record
      const { error: auctionError } = await supabase
        .from('auctions')
        .delete()
        .eq('listing_id', id)

      if (auctionError) {
        console.error('Error deleting auction:', auctionError)
        // Continue - auction record might not exist
      }

      // Delete favorites
      const { error: favoritesError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('listing_id', id)

      if (favoritesError) {
        console.error('Error deleting favorites:', favoritesError)
        // Continue - favorites might not exist
      }

      // Delete the listing
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting listing:', deleteError)
        return createErrorResponse('Failed to delete listing', 500)
      }

      // Update user's listing count
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ 
          total_listings: Math.max(0, (profile.total_listings || 0) - 1)
        })
        .eq('id', user.id)

      if (updateProfileError) {
        console.error('Error updating profile listing count:', updateProfileError)
        // Don't fail the request for this
      }

      return createSuccessResponse(
        { id, deleted: true },
        200,
        { message: 'Listing deleted successfully' }
      )

    } catch (error) {
      console.error('Unexpected error in DELETE /api/listings/[id]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}