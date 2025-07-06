import { supabase } from "@/lib/supabase"
import type { NewBid } from "@/types/database.types"

export async function placeBid(bid: NewBid) {
  const client = supabase()
  if (!client) throw new Error("Supabase client not available")

  const { data, error } = await client.from("bids").insert(bid).select().single()

  if (error) throw error

  // Update current_bid in listings table
  await client.from("listings").update({ current_bid: bid.amount }).eq("id", bid.listing_id)

  return data
}

export async function getBidsForListing(listingId: number) {
  const client = supabase()
  if (!client) throw new Error("Supabase client not available")

  const { data, error } = await client
    .from("bids")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq("listing_id", listingId)
    .order("placed_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getUserBids(userId: string) {
  const client = supabase()
  if (!client) throw new Error("Supabase client not available")

  const { data, error } = await client
    .from("bids")
    .select(`
      *,
      listings (
        id,
        title,
        images,
        auction_end_time,
        current_bid,
        status
      )
    `)
    .eq("user_id", userId)
    .order("placed_at", { ascending: false })

  if (error) throw error
  return data
}
