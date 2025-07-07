"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Vehicle, VehicleFilters } from "../types/Vehicle"
import { mockVehicles } from "../data/mockVehicles"

interface VehicleContextType {
  vehicles: Vehicle[]
  filteredVehicles: Vehicle[]
  filters: VehicleFilters
  loading: boolean
  hasMore: boolean
  updateFilters: (newFilters: Partial<VehicleFilters>) => void
  loadMore: () => void
  refreshData: () => Promise<void>
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

const initialFilters: VehicleFilters = {
  category: "auto",
  brand: "",
  minPrice: 0,
  maxPrice: 300000,
  minYear: 2000,
  maxYear: 2024,
  fuelType: "",
  location: "",
  search: "",
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [displayedVehicles, setDisplayedVehicles] = useState<Vehicle[]>([])
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  // Simulate API call
  const fetchVehicles = useCallback(async (): Promise<Vehicle[]> => {
    setLoading(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    setLoading(false)
    return mockVehicles
  }, [])

  // Filter vehicles based on current filters
  const filterVehicles = useCallback((vehicleList: Vehicle[], currentFilters: VehicleFilters): Vehicle[] => {
    return vehicleList.filter((vehicle) => {
      const matchesCategory = vehicle.category === currentFilters.category
      const matchesBrand =
        !currentFilters.brand || vehicle.brand.toLowerCase().includes(currentFilters.brand.toLowerCase())
      const matchesPrice = vehicle.priceCHF >= currentFilters.minPrice && vehicle.priceCHF <= currentFilters.maxPrice
      const matchesYear = vehicle.year >= currentFilters.minYear && vehicle.year <= currentFilters.maxYear
      const matchesFuelType = !currentFilters.fuelType || vehicle.fuelType === currentFilters.fuelType
      const matchesLocation =
        !currentFilters.location || vehicle.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      const matchesSearch =
        !currentFilters.search ||
        vehicle.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(currentFilters.search.toLowerCase())

      return (
        matchesCategory &&
        matchesBrand &&
        matchesPrice &&
        matchesYear &&
        matchesFuelType &&
        matchesLocation &&
        matchesSearch
      )
    })
  }, [])

  // Initialize data
  useEffect(() => {
    fetchVehicles().then((data) => {
      setVehicles(data)
      const filtered = filterVehicles(data, filters)
      setDisplayedVehicles(filtered.slice(0, itemsPerPage))
      setHasMore(filtered.length > itemsPerPage)
    })
  }, [fetchVehicles, filterVehicles, filters])

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<VehicleFilters>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      setPage(1)

      const filtered = filterVehicles(vehicles, updatedFilters)
      setDisplayedVehicles(filtered.slice(0, itemsPerPage))
      setHasMore(filtered.length > itemsPerPage)
    },
    [filters, vehicles, filterVehicles],
  )

  // Load more vehicles (infinite scroll)
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    const nextPage = page + 1
    const filtered = filterVehicles(vehicles, filters)
    const startIndex = nextPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    if (startIndex < filtered.length) {
      setDisplayedVehicles((prev) => [...prev, ...filtered.slice(startIndex, endIndex)])
      setPage(nextPage)
      setHasMore(endIndex < filtered.length)
    } else {
      setHasMore(false)
    }
  }, [loading, hasMore, page, vehicles, filters, filterVehicles])

  // Refresh data (pull to refresh)
  const refreshData = useCallback(async () => {
    const data = await fetchVehicles()
    setVehicles(data)
    setPage(1)
    const filtered = filterVehicles(data, filters)
    setDisplayedVehicles(filtered.slice(0, itemsPerPage))
    setHasMore(filtered.length > itemsPerPage)
  }, [fetchVehicles, filterVehicles, filters])

  const filteredVehicles = filterVehicles(vehicles, filters)

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        filteredVehicles: displayedVehicles,
        filters,
        loading,
        hasMore,
        updateFilters,
        loadMore,
        refreshData,
      }}
    >
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicles() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error("useVehicles must be used within a VehicleProvider")
  }
  return context
}
