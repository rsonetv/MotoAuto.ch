"use client"

import { AdvancedVehicleSearch } from "@/components/advanced-vehicle-search"
import { mockRootProps } from "@/components/advanced-vehicle-search/advancedVehicleSearchMockData"

export default function AdvancedVehicleSearchPreview() {
  const handleSearch = (filters: any) => {
    console.log('Search triggered with filters:', filters)
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
        />
      </div>
    </div>
  )
}