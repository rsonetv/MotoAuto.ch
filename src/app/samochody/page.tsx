"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleFilters } from "@/components/automotive/vehicle-filters"
import { VehicleGrid } from "@/components/automotive/vehicle-grid"
import type { ListingFilters } from "@/lib/queries/listings"

export default function SamochodyPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    category: "auto",
    limit: 12,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Samochody</h1>
          <p className="text-gray-600">Znajdź swój wymarzony samochód wśród tysięcy ofert w Szwajcarii.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <VehicleFilters category="auto" onFiltersChange={setFilters} />
          </div>
          <div className="lg:col-span-3">
            <VehicleGrid filters={filters} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
