import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  withAuth, 
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"

/**
 * GET /api/user/favorites
 * Get user's favorite listings and auctions with detailed information
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const supabase = await createServerComponentClient(req)
      const url = new URL(req.url)
      
      // Parse query parameters
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
      const offset = (page - 1) * limit

      // Get user's favorites with full listing details
      const { data: favorites, error: favoritesError } = await supabase
        .from('user_favorites')
        .select(`
          id,
          created_at as favorited_at,
          listings!inner (
            id,
            title,
            description,
            brand,
            model,
            year,
            price,
            currency,
            current_bid,
            bid_count,
            location,
            postal_code,
            canton,
            country,
            images,
            is_auction,
            auction_end_time,
            status,
            views,
            favorites_count,
            mileage,
            fuel_type,
            transmission,
            color,
            condition,
            created_at,
            profiles!listings_user_id_fkey (
              full_name,
              avatar_url,
              is_dealer,
              dealer_name
            ),
            categories!listings_category_id_fkey (
              name_en,
              name_de,
              name_fr,
              name_pl,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError)
        return createErrorResponse('Failed to fetch favorites', 500)
      }

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        console.error('Error counting favorites:', countError)
        return createErrorResponse('Failed to count favorites', 500)
      }

      // Transform the data to match the expected format
      const transformedFavorites = favorites?.map((fav: any) => ({
        id: fav.id,
        listing_id: fav.listings.id,
        auction_id: fav.listings.is_auction ? fav.listings.id : undefined,
        title: fav.listings.title,
        brand: fav.listings.brand,
        model: fav.listings.model,
        year: fav.listings.year,
        price: fav.listings.price,
        currency: fav.listings.currency,
        current_bid: fav.listings.current_bid,
        bid_count: fav.listings.bid_count,
        location: fav.listings.location,
        canton: fav.listings.canton,
        images: fav.listings.images || [],
        is_auction: fav.listings.is_auction,
        auction_end_time: fav.listings.auction_end_time,
        status: fav.listings.status,
        views: fav.listings.views,
        favorites_count: fav.listings.favorites_count,
        mileage: fav.listings.mileage,
        fuel_type: fav.listings.fuel_type,
        transmission: fav.listings.transmission,
        color: fav.listings.color,
        condition: fav.listings.condition,
        created_at: fav.listings.created_at,
        favorited_at: fav.favorited_at,
        profiles: fav.listings.profiles,
        categories: fav.listings.categories
      })) || []

      // Calculate pagination info
      const totalPages = Math.ceil((totalCount || 0) / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      return createSuccessResponse({
        favorites: transformedFavorites,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages,
          hasNext,
          hasPrev
        }
      }, 200)

    } catch (error) {
      console.error('Unexpected error in GET /api/user/favorites:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * DELETE /api/user/favorites
 * Bulk remove favorites by listing IDs
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const body = await req.json()
      const { listing_ids } = body

      if (!Array.isArray(listing_ids) || listing_ids.length === 0) {
        return createErrorResponse('listing_ids array is required', 400)
      }

      // Validate all IDs are UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      for (const id of listing_ids) {
        if (!uuidRegex.test(id)) {
          return createErrorResponse(`Invalid listing ID format: ${id}`, 400)
        }
      }

      const supabase = await createServerComponentClient(req)

      // Remove favorites
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .in('listing_id', listing_ids)

      if (deleteError) {
        console.error('Error removing favorites:', deleteError)
        return createErrorResponse('Failed to remove favorites', 500)
      }

      // Update favorites count on listings
      for (const listingId of listing_ids) {
        const { error: updateError } = await supabase
          .rpc('decrement_favorites_count', { listing_id: listingId })

        if (updateError) {
          console.error(`Error updating favorites count for listing ${listingId}:`, updateError)
          // Don't fail the request for this
        }
      }

      return createSuccessResponse({
        removed_count: listing_ids.length,
        listing_ids
      }, 200, {
        message: `Successfully removed ${listing_ids.length} favorites`
      })

    } catch (error) {
      console.error('Unexpected error in DELETE /api/user/favorites:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}