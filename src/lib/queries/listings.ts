import { getSupabaseClient } from "@/lib/supabase/client"
import type { NewListing, UpdateListing, Listing } from "@/types/database.types"

export interface ListingFilters {
  category?: "auto" | "moto"
  brand?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  minMileage?: number
  maxMileage?: number
  fuelType?: string
  transmission?: string
  location?: string
  search?: string
  isAuction?: boolean
  limit?: number
  offset?: number
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

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

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters.minYear !== undefined) {
    query = query.gte("year", filters.minYear)
  }

  if (filters.maxYear !== undefined) {
    query = query.lte("year", filters.maxYear)
  }

  if (filters.minMileage !== undefined) {
    query = query.gte("mileage", filters.minMileage)
  }

  if (filters.maxMileage !== undefined) {
    query = query.lte("mileage", filters.maxMileage)
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

  if (filters.isAuction !== undefined) {
    query = query.eq("is_auction", filters.isAuction)
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching listings:", error)
    throw error
  }

  return data || []
}

export async function getListing(id: number): Promise<Listing | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url,
        phone
      ),
      bids (
        id,
        amount,
        placed_at,
        profiles:user_id (
          full_name
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching listing:", error)
    return null
  }

  return data
}

export async function createListing(listing: NewListing): Promise<Listing> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("listings").insert(listing).select().single()

  if (error) {
    console.error("Error creating listing:", error)
    throw error
  }

  return data
}

export async function updateListing(id: number, updates: UpdateListing): Promise<Listing> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("listings").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating listing:", error)
    throw error
  }

  return data
}

export async function incrementViews(id: number): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("listings").update({ views: supabase.sql`views + 1` }).eq("id", id)

  if (error) {
    console.error("Error incrementing views:", error)
    throw error
  }
}
