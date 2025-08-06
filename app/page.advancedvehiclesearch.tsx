"use client"

import { useState } from "react"
import { AdvancedVehicleSearch } from "@/components/advanced-vehicle-search"
import { SearchResults } from "@/components/advanced-vehicle-search/components/SearchResults"
import { mockRootProps } from "@/components/advanced-vehicle-search/advancedVehicleSearchMockData"
import { Listing } from "@/types/listings"

export default function AdvancedVehicleSearchPreview() {
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleSearch = async (filters: any) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await fetch(`/api/listings/search?${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to fetch search results")
      }
      const data = await response.json()
      console.log('API Response Data:', JSON.stringify(data, null, 2));
      setResults(data.listings || data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Zaawansowane wyszukiwanie pojazdów</h1>
          <p className="text-muted-foreground text-lg">
            Mobilnie zoptymalizowany komponent wyszukiwania z obsługą głosu, gestów dotykowych i zaawansowanymi filtrami
          </p>
        </div>
        
        <AdvancedVehicleSearch
          initialFilters={mockRootProps.initialFilters}
          recentSearches={mockRootProps.recentSearches}
          popularSearches={mockRootProps.popularSearches}
          brands={mockRootProps.brands}
          models={mockRootProps.models}
          locations={mockRootProps.locations}
          quickFilters={mockRootProps.quickFilters}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          results={results}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}