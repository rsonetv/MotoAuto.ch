import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getListings, getListing, createListing, updateListing, type ListingFilters } from "@/lib/queries/listings"
import type { UpdateListing } from "@/types/database.types"

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () => getListings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => getListing(id),
    enabled: !!id,
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] })
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateListing }) => updateListing(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] })
      queryClient.invalidateQueries({ queryKey: ["listing", data.id] })
    },
  })
}
