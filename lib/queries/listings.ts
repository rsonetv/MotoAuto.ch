import { supabase } from "@/lib/supabase"
import type { NewListing, UpdateListing } from "@/types/database.types"

export async function getListings(
  options: {
    category?: string
    limit?: number
    offset?: number
    search?: string
    isAuction?: boolean
  } = {},
) {
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

  if (options.category) {
    query = query.eq("category", options.category)
  }

  if (options.isAuction !== undefined) {
    query = query.eq("is_auction", options.isAuction)
  }

  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,brand.ilike.%${options.search}%,model.ilike.%${options.search}%`)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getListing(id: number) {
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

  if (error) throw error
  return data
}

export async function createListing(listing: NewListing) {
  const { data, error } = await supabase.from("listings").insert(listing).select().single()

  if (error) throw error
  return data
}

export async function updateListing(id: number, updates: UpdateListing) {
  const { data, error } = await supabase.from("listings").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteListing(id: number) {
  const { error } = await supabase.from("listings").delete().eq("id", id)

  if (error) throw error
}

export async function incrementViews(id: number) {
  const { error } = await supabase.from("listings").update({ views: supabase.sql`views + 1` }).eq("id", id)

  if (error) throw error
}
