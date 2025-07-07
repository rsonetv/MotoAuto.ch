"use client"

import { useEffect, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"
import VehicleCard from "./VehicleCard"
import { useVehicles } from "../context/VehicleContext"

export default function VehicleGrid() {
  const { filteredVehicles, loading, hasMore, loadMore } = useVehicles()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Infinite scroll implementation
  const lastVehicleElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore, loadMore],
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  if (filteredVehicles.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Brak wyników</h3>
        <p className="text-gray-500">Spróbuj zmienić filtry wyszukiwania</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle, index) => (
          <div key={vehicle.id} ref={index === filteredVehicles.length - 1 ? lastVehicleElementRef : null}>
            <VehicleCard vehicle={vehicle} />
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Ładowanie...</span>
          </div>
        </div>
      )}

      {/* Load More Button (fallback for infinite scroll) */}
      {!loading && hasMore && (
        <div className="text-center py-6">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Załaduj więcej
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && filteredVehicles.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>To wszystkie dostępne oferty</p>
        </div>
      )}
    </div>
  )
}
