import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  favoriteActionSchema,
  type FavoriteAction 
} from "@/lib/schemas/listings-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  isValidUUID,
  type AuthContext
} from "@/lib/auth-middleware"

/**
 * POST /api/listings/[id]/favorite
 * Add or remove listing from user's favorites
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { id } = params
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        return createErrorResponse('Invalid listing ID format', 400)
      }

      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, favoriteActionSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid action: ${validation.error}`, 400)
      }

      const { action }: FavoriteAction = validation.data
      const supabase = await createServerComponentClient(req)

      // Verify listing exists and is active
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, user_id, status, title')
        .eq('id', id)
        .single()

      if (listingError || !listing) {
        return createErrorResponse('Listing not found', 404)
      }

      // Prevent users from favoriting their own listings
      if (listing.user_id === user.id) {
        return createErrorResponse('You cannot favorite your own listings', 400)
      }

      // Only allow favoriting active listings
      if (listing.status !== 'active') {
        return createErrorResponse('You can only favorite active listings', 400)
      }

      // Check if favorite already exists
      const { data: existingFavorite, error: favoriteCheckError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single()

      if (favoriteCheckError && favoriteCheckError.code !== 'PGRST116') {
        console.error('Error checking existing favorite:', favoriteCheckError)
        return createErrorResponse('Failed to check favorite status', 500)
      }

      const favoriteExists = !!existingFavorite

      if (action === 'add') {
        if (favoriteExists) {
          return createErrorResponse('Listing is already in your favorites', 400)
        }

        // Use transaction to ensure atomicity
        const { error: transactionError } = await supabase.rpc('add_listing_favorite', {
          p_user_id: user.id,
          p_listing_id: id
        })

        if (transactionError) {
          console.error('Error adding favorite:', transactionError)
          if (transactionError.code === '23505') {
            return createErrorResponse('Listing is already in your favorites', 409)
          }
          return createErrorResponse('Failed to add to favorites', 500)
        }

        return createSuccessResponse(
          {
            listing_id: id,
            action: 'added',
            is_favorited: true
          },
          200,
          { message: 'Added to favorites successfully' }
        )

      } else if (action === 'remove') {
        if (!favoriteExists) {
          return createErrorResponse('Listing is not in your favorites', 400)
        }

        // Use transaction to ensure atomicity
        const { error: transactionError } = await supabase.rpc('remove_listing_favorite', {
          p_user_id: user.id,
          p_listing_id: id
        })

        if (transactionError) {
          console.error('Error removing favorite:', transactionError)
          return createErrorResponse('Failed to remove from favorites', 500)
        }

        return createSuccessResponse(
          {
            listing_id: id,
            action: 'removed',
            is_favorited: false
          },
          200,
          { message: 'Removed from favorites successfully' }
        )
      }

      return createErrorResponse('Invalid action', 400)

    } catch (error) {
      console.error('Unexpected error in POST /api/listings/[id]/favorite:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * GET /api/listings/[id]/favorite
 * Check if listing is in user's favorites
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { id } = params
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        return createErrorResponse('Invalid listing ID format', 400)
      }

      const supabase = await createServerComponentClient(req)

      // Check if favorite exists
      const { data: favorite, error: favoriteError } = await supabase
        .from('user_favorites')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single()

      if (favoriteError && favoriteError.code !== 'PGRST116') {
        console.error('Error checking favorite status:', favoriteError)
        return createErrorResponse('Failed to check favorite status', 500)
      }

      const isFavorited = !!favorite

      return createSuccessResponse(
        {
          listing_id: id,
          is_favorited: isFavorited,
          ...(favorite && { favorited_at: favorite.created_at })
        },
        200
      )

    } catch (error) {
      console.error('Unexpected error in GET /api/listings/[id]/favorite:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * DELETE /api/listings/[id]/favorite
 * Remove listing from user's favorites (alternative to POST with remove action)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { id } = params
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        return createErrorResponse('Invalid listing ID format', 400)
      }

      const supabase = await createServerComponentClient(req)

      // Check if favorite exists
      const { data: existingFavorite, error: favoriteCheckError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single()

      if (favoriteCheckError && favoriteCheckError.code !== 'PGRST116') {
        console.error('Error checking existing favorite:', favoriteCheckError)
        return createErrorResponse('Failed to check favorite status', 500)
      }

      if (!existingFavorite) {
        return createErrorResponse('Listing is not in your favorites', 400)
      }

      // Use transaction to ensure atomicity
      const { error: transactionError } = await supabase.rpc('remove_listing_favorite', {
        p_user_id: user.id,
        p_listing_id: id
      })

      if (transactionError) {
        console.error('Error removing favorite:', transactionError)
        return createErrorResponse('Failed to remove from favorites', 500)
      }

      return createSuccessResponse(
        {
          listing_id: id,
          action: 'removed',
          is_favorited: false
        },
        200,
        { message: 'Removed from favorites successfully' }
      )

    } catch (error) {
      console.error('Unexpected error in DELETE /api/listings/[id]/favorite:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}