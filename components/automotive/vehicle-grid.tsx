"use client"

import { useState, useMemo, useCallback } from "react"
import { Eye, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useListings } from "@/hooks/use-listings"
import { VehicleCard } from "./vehicle-card"
import type { ListingFilters } from "@/lib/queries/listings"

interface VehicleGridProps {
  filters: ListingFilters
}

export function VehicleGrid({ filters }: VehicleGridProps) {
  const { data: listings = [], isLoading, error } = useListings(filters)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Memoize the filtered and sorted listings
  const processedListings = useMemo(() => {
    if (!listings.length) return []

    // Apply any additional client-side filtering if needed
    const filtered = [...listings]

    // Sort listings (this could be moved to server-side for better performance)
    filtered.sort((a, b) => {
      // Sort by created_at descending (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return filtered
  }, [listings])

  // Memoize the results header text
  const resultsHeaderText = useMemo(() => {
    const count = processedListings.length
    const categoryText = filters.category === "auto" ? "Samochody" : "Motocykle"
    return {
      title: `Znaleziono ${count} ofert`,
      subtitle: `${categoryText} • Szwajcaria`,
    }
  }, [processedListings.length, filters.category])

  // Memoize the toggle favorite function
  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }, [])

  // Memoize view mode handlers
  const handleGridView = useCallback(() => setViewMode("grid"), [])
  const handleListView = useCallback(() => setViewMode("list"), [])

  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className={`bg-gray-300 ${viewMode === "grid" ? "h-48" : "h-32"}`}></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Wystąpił błąd podczas ładowania ogłoszeń.</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </Button>
      </div>
    )
  }

  if (processedListings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Brak wyników</h3>
        <p className="text-gray-500 mb-4">Nie znaleziono pojazdów spełniających wybrane kryteria.</p>
        <p className="text-sm text-gray-400">Spróbuj zmienić filtry lub rozszerzyć kryteria wyszukiwania.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{resultsHeaderText.title}</h2>
          <p className="text-gray-600 mt-1">{resultsHeaderText.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={handleGridView}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={handleListView}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            Sortuj: Najnowsze
          </Button>
        </div>
      </div>

      {/* Vehicle Grid/List */}
      <div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {processedListings.map((listing, index) => (
          <VehicleCard
            key={listing.id}
            listing={listing}
            index={index}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.has(listing.id)}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {processedListings.length >= (filters.limit || 12) && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg" className="bg-transparent">
            <Eye className="w-4 h-4 mr-2" />
            Załaduj więcej ofert
          </Button>
        </div>
      )}
    </div>
  )
}
