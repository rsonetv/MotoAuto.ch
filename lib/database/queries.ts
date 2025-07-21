import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

type Listing = Database["public"]["Tables"]["listings"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Bid = Database["public"]["Tables"]["bids"]["Row"]

export async function getListings(filters?: {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  isAuction?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (
        full_name,
        is_dealer,
        dealer_name
      ),
      bids (
        amount,
        placed_at,
        user_id
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }

  if (filters?.brand) {
    query = query.eq("brand", filters.brand)
  }

  if (filters?.minPrice) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters?.maxPrice) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters?.location) {
    query = query.eq("location", filters.location)
  }

  if (filters?.isAuction !== undefined) {
    query = query.eq("is_auction", filters.isAuction)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching listings:", error)
    return []
  }

  return data || []
}

export async function getAuctionById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (
        full_name,
        is_dealer,
        dealer_name,
        phone,
        email
      ),
      bids (
        id,
        amount,
        placed_at,
        user_id,
        profiles:user_id (
          full_name
        )
      )
    `)
    .eq("id", id)
    .eq("is_auction", true)
    .single()

  if (error) {
    console.error("Error fetching auction:", error)
    return null
  }

  return data
}

export async function getUserBids(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bids")
    .select(`
      *,
      listings (
        id,
        title,
        brand,
        model,
        images,
        auction_end_time,
        current_bid,
        status
      )
    `)
    .eq("user_id", userId)
    .order("placed_at", { ascending: false })

  if (error) {
    console.error("Error fetching user bids:", error)
    return []
  }

  return data || []
}

export async function getUserListings(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      bids (
        amount,
        placed_at,
        user_id,
        profiles:user_id (
          full_name
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user listings:", error)
    return []
  }

  return data || []
}
