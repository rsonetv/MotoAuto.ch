"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { VehicleFilters } from "../types/Vehicle"
import { useVehicles } from "../context/VehicleContext"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { filters, updateFilters } = useVehicles()
  const [localFilters, setLocalFilters] = useState<VehicleFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const brands = ["Audi", "BMW", "Mercedes", "Porsche", "Tesla", "Yamaha", "Ducati", "Honda", "Kawasaki"]
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"]
  const locations = ["Zürich", "Geneva", "Basel", "Bern", "Lausanne"]

  const handleApplyFilters = () => {
    updateFilters(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters: VehicleFilters = {
      category: filters.category,
      brand: "",
      minPrice: 0,
      maxPrice: 300000,
      minYear: 2000,
      maxYear: 2024,
      fuelType: "",
      location: "",
      search: "",
    }
    setLocalFilters(resetFilters)
    updateFilters(resetFilters)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Filtry</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Szukaj</label>
              <input
                type="text"
                placeholder="np. Porsche 911"
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
              <select
                value={localFilters.brand}
                onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Wszystkie</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cena (CHF)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Od"
                  value={localFilters.minPrice || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Do"
                  value={localFilters.maxPrice || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) || 300000 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rok produkcji</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Od"
                  value={localFilters.minYear || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, minYear: Number(e.target.value) || 2000 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Do"
                  value={localFilters.maxYear || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxYear: Number(e.target.value) || 2024 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Napęd</label>
              <div className="grid grid-cols-2 gap-2">
                {fuelTypes.map((fuel) => (
                  <label key={fuel} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="fuelType"
                      value={fuel}
                      checked={localFilters.fuelType === fuel}
                      onChange={(e) => setLocalFilters({ ...localFilters, fuelType: e.target.value })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm">{fuel}</span>
                  </label>
                ))}
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="fuelType"
                    value=""
                    checked={localFilters.fuelType === ""}
                    onChange={(e) => setLocalFilters({ ...localFilters, fuelType: e.target.value })}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm">Wszystkie</span>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lokalizacja</label>
              <select
                value={localFilters.location}
                onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Wszystkie</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <button onClick={handleApplyFilters} className="w-full btn-primary">
              Zastosuj filtry
            </button>
            <button
              onClick={handleResetFilters}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Wyczyść filtry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
