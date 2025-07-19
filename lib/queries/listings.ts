import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"

type Listing = Database["public"]["Tables"]["listings"]["Row"]
type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"]
type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"]

export interface ListingFilters {
  category?: "auto" | "moto"
  brand?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  fuelType?: string
  transmission?: string
  location?: string
  search?: string
  sortBy?: "price_asc" | "price_desc" | "year_asc" | "year_desc" | "created_desc"
  limit?: number
  offset?: number
}

/**
 * Get listings with filters and pagination
 */
export async function getListings(filters: ListingFilters = {}) {
  try {
    let query = supabase.from("listings").select("*").eq("status", "active")

    // Apply filters
    if (filters.category) {
      query = query.eq("category", filters.category)
    }

    if (filters.brand) {
      query = query.eq("brand", filters.brand)
    }

    if (filters.model) {
      query = query.eq("model", filters.model)
    }

    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice)
    }

    if (filters.minYear) {
      query = query.gte("year", filters.minYear)
    }

    if (filters.maxYear) {
      query = query.lte("year", filters.maxYear)
    }

    if (filters.fuelType) {
      query = query.eq("fuel_type", filters.fuelType)
    }

    if (filters.transmission) {
      query = query.eq("transmission", filters.transmission)
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`)
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`,
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true })
        break
      case "price_desc":
        query = query.order("price", { ascending: false })
        break
      case "year_asc":
        query = query.order("year", { ascending: true })
        break
      case "year_desc":
        query = query.order("year", { ascending: false })
        break
      case "created_desc":
      default:
        query = query.order("created_at", { ascending: false })
        break
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching listings:", error)
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getListings:", error)
    throw error
  }
}

/**
 * Get a single listing by ID
 */
export async function getListing(id: number) {
  try {
    const { data, error } = await supabase.from("listings").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching listing:", error)
      throw new Error(`Failed to fetch listing: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in getListing:", error)
    throw error
  }
}

/**
 * Create a new listing
 */
export async function createListing(listing: ListingInsert) {
  try {
    const { data, error } = await supabase.from("listings").insert(listing).select().single()

    if (error) {
      console.error("Error creating listing:", error)
      throw new Error(`Failed to create listing: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in createListing:", error)
    throw error
  }
}

/**
 * Update a listing
 */
export async function updateListing(id: number, updates: ListingUpdate) {
  try {
    const { data, error } = await supabase
      .from("listings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating listing:", error)
      throw new Error(`Failed to update listing: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateListing:", error)
    throw error
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(id: number) {
  try {
    const { error } = await supabase.from("listings").delete().eq("id", id)

    if (error) {
      console.error("Error deleting listing:", error)
      throw new Error(`Failed to delete listing: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Error in deleteListing:", error)
    throw error
  }
}

/**
 * Get user's listings
 */
export async function getUserListings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user listings:", error)
      throw new Error(`Failed to fetch user listings: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserListings:", error)
    throw error
  }
}

/**
 * Increment view count for a listing
 */
export async function incrementViews(id: number) {
  try {
    const { error } = await supabase.rpc("increment_views", { listing_id: id })

    if (error) {
      console.error("Error incrementing views:", error)
      // Don't throw error for view counting failures
    }
  } catch (error) {
    console.error("Error in incrementViews:", error)
    // Don't throw error for view counting failures
  }
}

/**
 * Get featured listings
 */
export async function getFeaturedListings(limit = 6) {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured listings:", error)
      throw new Error(`Failed to fetch featured listings: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getFeaturedListings:", error)
    throw error
  }
}

// Legacy exports for backward compatibility
export { getListings as listingsService }
