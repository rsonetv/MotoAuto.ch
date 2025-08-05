'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getListings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(full_name)')

  if (error) {
    console.error('Error fetching listings:', error)
    return []
  }

  return data
}

export async function updateListingStatus(
  listingId: string,
  status: 'active' | 'rejected' | 'suspended'
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId)

  if (error) {
    console.error('Error updating listing status:', error)
    return { error }
  }

  revalidatePath('/admin/listings')
  return { error: null }
}

export async function featureListing(listingId: string, isFeatured: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('listings')
    .update({ is_featured: isFeatured })
    .eq('id', listingId)

  if (error) {
    console.error('Error featuring listing:', error)
    return { error }
  }

  revalidatePath('/admin/listings')
  return { error: null }
}