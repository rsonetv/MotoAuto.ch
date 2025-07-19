"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getListings, type ListingFilters } from "@/lib/queries/listings"

export function useListings(filters: ListingFilters) {
  // Memoize the query key to prevent unnecessary refetches
  const queryKey = useMemo(() => {
    return ["listings", filters]
  }, [filters])

  // Memoize the query function
  const queryFn = useMemo(() => {
    return () => getListings(filters)
  }, [filters])

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export { useListings as default }
