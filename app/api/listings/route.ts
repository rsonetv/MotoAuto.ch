import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  listingsQuerySchema, 
  createListingSchema,
  type ListingsQuery,
  type CreateListingInput 
} from "@/lib/schemas/listings-api-schema"
import { 
  withOptionalAuth, 
  withAuth, 
  validateQueryParams, 
  validateRequestBody,
  checkPackageAvailability,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

/**
 * Geocode an address string to latitude and longitude using Nominatim API.
 * @param address The address to geocode.
 * @returns An object with latitude and longitude, or null if not found.
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MotoAuto.ch Listing Filter' }
    });
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed", error);
    return null;
  }
}

type ListingWithRelations = Database['public']['Tables']['listings']['Row'] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
    is_dealer: boolean
    dealer_name: string | null
  }
  categories: {
    name: string
    slug: string
  }
  packages?: {
    name: string
    name_de: string | null
    name_fr: string | null
    name_en: string | null
  }
}

/**
 * GET /api/listings
 * Fetch listings with filtering, pagination, and search
 */
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req, { user, profile }) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Validate query parameters
      const validation = validateQueryParams(searchParams, listingsQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: ListingsQuery = validation.data
      const supabase = await createServerComponentClient(req)

      let listingIdsFromRadius: string[] | null = null;

      // Handle geolocation search
      if (query.location && query.radius) {
        const coords = await geocodeAddress(query.location);
        if (coords) {
          const { data: ids, error: rpcError } = await supabase.rpc('get_listing_ids_in_radius', {
            lat: coords.lat,
            long: coords.lon,
            radius_km: query.radius,
          });

          if (rpcError) {
            console.error("Error calling get_listing_ids_in_radius RPC:", rpcError);
            // We can decide to fail or just ignore the location filter
          } else {
            listingIdsFromRadius = ids ? ids.map((item: { id: string }) => item.id) : [];
            // If no listings are found in the radius, we can short-circuit
            if (listingIdsFromRadius && listingIdsFromRadius.length === 0) {
              return createSuccessResponse({ data: [], pagination: { page: 1, limit: query.limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, filters: {} }, 200);
            }
          }
        }
      }

      // Build the base query with joins
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
          views,
          status,
          is_featured,
          created_at,
          updated_at,
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name
          ),
          categories:category_id (
            name,
            slug
          ),
          packages:package_id (
            name,
            name_de,
            name_fr,
            name_en
          )
        `)

      // Apply status filter (default to active)
      dbQuery = dbQuery.eq('status', query.status)

      // If we have IDs from radius search, use them as the primary filter
      if (listingIdsFromRadius) {
        dbQuery = dbQuery.in('id', listingIdsFromRadius);
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

      // Apply auction filter

      // Apply price range filters
      if (query.price_min !== undefined) {
        dbQuery = dbQuery.gte('price', query.price_min)
      }
      if (query.price_max !== undefined) {
        dbQuery = dbQuery.lte('price', query.price_max)
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

      // Apply location filters only if not searching by radius
      if (!listingIdsFromRadius) {
        if (query.location) {
          dbQuery = dbQuery.ilike('location', `%${query.location}%`)
        }
        if (query.canton) {
          dbQuery = dbQuery.eq('canton', query.canton)
        }
        if (query.postal_code) {
          dbQuery = dbQuery.eq('postal_code', query.postal_code)
        }
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
      
      // Always sort by featured first
      dbQuery = dbQuery.order('is_featured', { ascending: false })

      if (sortColumn === 'auction_end_time') {
        // Special handling for auction end time - nulls last
        dbQuery = dbQuery.order('auction_end_time', { ...sortOrder, nullsFirst: false })
      } else {
        dbQuery = dbQuery.order(sortColumn, sortOrder)
      }

      // Get total count for pagination (before applying limit/offset)
      const { count: totalCount, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .match(
          Object.fromEntries(
            Object.entries({
              status: query.status,
              ...(query.category_id && { category_id: query.category_id }),
              ...(query.fuel_type && { fuel_type: query.fuel_type }),
              ...(query.transmission && { transmission: query.transmission }),
              ...(query.condition && { condition: query.condition }),
              ...(query.canton && { canton: query.canton }),
              ...(query.postal_code && { postal_code: query.postal_code }),
            }).filter(([_, value]) => value !== undefined)
          )
        )

      if (countError) {
        console.error('Error getting listings count:', countError)
        return createErrorResponse('Failed to get listings count', 500)
      }

      // Apply pagination
      const offset = (query.page - 1) * query.limit
      dbQuery = dbQuery.range(offset, offset + query.limit - 1)

      // Execute the query
      const { data: listings, error } = await dbQuery

      if (error) {
        console.error('Error fetching listings:', error)
        return createErrorResponse('Failed to fetch listings', 500)
      }

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
          data: listings as unknown as ListingWithRelations[],
          pagination: paginationMeta,
          filters: {
            category_id: query.category_id,
            brand: query.brand,
            model: query.model,
            fuel_type: query.fuel_type,
            transmission: query.transmission,
            condition: query.condition,
            price_range: query.price_min || query.price_max ? {
              min: query.price_min,
              max: query.price_max
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
      console.error('Unexpected error in GET /api/listings:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * POST /api/listings
 * Create new listing with package validation
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      // Parse request body
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, createListingSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid listing data: ${validation.error}`, 400)
      }

      const listingData: CreateListingInput = validation.data
      const supabase = await createServerComponentClient(req)

      // Check package availability
      const packageCheck = await checkPackageAvailability(user.id, listingData.package_id)
      if (!packageCheck.available) {
        return createErrorResponse(packageCheck.reason || 'Package not available', 403)
      }

      // Verify category exists
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, is_active')
        .eq('id', listingData.category_id)
        .eq('is_active', true)
        .single()

      if (categoryError || !category) {
        return createErrorResponse('Invalid or inactive category', 400)
      }

      // Prepare listing data for insertion
      const now = new Date().toISOString()
      const insertData: any = {
        ...listingData,
        user_id: user.id,
        status: 'draft' as const,
        current_bid: listingData.is_auction ? listingData.price : 0,
        bid_count: 0,
        views: 0,
        favorites_count: 0,
        contact_count: 0,
        promotion_requested: listingData.promotion_requested || false,
        created_at: now,
        updated_at: now,
        // Set auction end time if it's an auction
        ...(listingData.is_auction && listingData.auction_end_time && {
          auction_end_time: listingData.auction_end_time
        })
      }

      // Handle geolocation data
      if (listingData.latitude && listingData.longitude) {
        // IMPORTANT: Supabase RPC functions for PostGIS expect (longitude, latitude)
        insertData.location = `POINT(${listingData.longitude} ${listingData.latitude})`
      }

      // Insert the listing
      const { data: newListing, error: insertError } = await supabase
        .from('listings')
        .insert(insertData)
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            is_dealer,
            dealer_name
          ),
          categories:category_id (
            name,
            slug
          ),
          packages:package_id (
            name,
            name_de,
            name_fr,
            name_en
          )
        `)
        .single()

      if (insertError) {
        console.error('Error creating listing:', insertError)
        return createErrorResponse('Failed to create listing', 500)
      }

      // Update user's free listings count if using free package
      if (!listingData.package_id && !profile.is_dealer) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            free_listings_used: (profile.free_listings_used ?? 0) + 1,
            total_listings: (profile.total_listings ?? 0) + 1
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
          // Don't fail the request, just log the error
        }
      } else {
        // Update total listings count
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ total_listings: (profile.total_listings ?? 0) + 1 })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
      }

      // Create auction record if it's an auction
      if (listingData.is_auction && newListing) {
        const { error: auctionError } = await supabase
          .from('auctions')
          .insert({
            listing_id: newListing.id,
            starting_price: listingData.price,
            reserve_met: listingData.reserve_price ? listingData.price >= listingData.reserve_price : true,
            total_bids: 0,
            unique_bidders: 0,
            extended_count: 0,
            max_extensions: 10, // Default max extensions
            created_at: now,
            updated_at: now
          })

        if (auctionError) {
          console.error('Error creating auction record:', auctionError)
          // Don't fail the request, just log the error
        }
      }

      return createSuccessResponse(
        newListing as ListingWithRelations,
        201,
        { message: 'Listing created successfully' }
      )

    } catch (error) {
      console.error('Unexpected error in POST /api/listings:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}