"use client"

import { useState } from "react"
import Header from "../components/Header"
import VehicleGrid from "../components/VehicleGrid"
import FilterModal from "../components/FilterModal"
import PullToRefresh from "../components/PullToRefresh"
import { useVehicles } from "../context/VehicleContext"

export default function HomePage() {
  const { filters, updateFilters, refreshData } = useVehicles()
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const handleTabChange = (tab: "moto" | "auto" | "auction") => {
    updateFilters({ category: tab })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        activeTab={filters.category}
        onTabChange={handleTabChange}
        onFilterClick={() => setFilterModalOpen(true)}
      />

      <PullToRefresh onRefresh={refreshData}>
        <main className="px-4 py-6">
          <VehicleGrid />
        </main>
      </PullToRefresh>

      <FilterModal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)} />
    </div>
  )
}
