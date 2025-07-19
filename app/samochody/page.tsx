"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleFilters } from "@/components/automotive/vehicle-filters"
import { VehicleGrid } from "@/components/automotive/vehicle-grid"
import { VehicleSearch } from "@/components/automotive/vehicle-search"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { ListingFilters } from "@/lib/queries/listings"

export default function SamochodyPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ListingFilters>({
    category: "auto",
    limit: 12,
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: ListingFilters = {
      category: "auto",
      limit: 12,
      search: searchParams.get("search") || undefined,
      brand: searchParams.get("brand") || undefined,
      model: searchParams.get("model") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      minYear: searchParams.get("minYear") ? Number(searchParams.get("minYear")) : undefined,
      maxYear: searchParams.get("maxYear") ? Number(searchParams.get("maxYear")) : undefined,
      minMileage: searchParams.get("minMileage") ? Number(searchParams.get("minMileage")) : undefined,
      maxMileage: searchParams.get("maxMileage") ? Number(searchParams.get("maxMileage")) : undefined,
      fuelType: searchParams.get("fuelType") || undefined,
      transmission: searchParams.get("transmission") || undefined,
      location: searchParams.get("location") || undefined,
      isAuction: searchParams.get("auction") === "true" || undefined,
    }
    setFilters(initialFilters)
  }, [searchParams])

  const handleFiltersChange = (newFilters: ListingFilters) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Samochody</h1>
          <p className="text-gray-600">Znajdź swój wymarzony samochód wśród tysięcy ofert w Szwajcarii.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <VehicleSearch onSearchChange={handleSearchChange} initialValue={filters.search || ""} />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtry
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-6">
                <VehicleFilters
                  category="auto"
                  onFiltersChange={handleFiltersChange}
                  onClose={() => setIsFilterOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <VehicleFilters category="auto" onFiltersChange={handleFiltersChange} />
          </div>

          {/* Vehicle Grid */}
          <div className="lg:col-span-3">
            <VehicleGrid filters={filters} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
