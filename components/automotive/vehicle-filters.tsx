"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import { CAR_BRANDS, MOTORCYCLE_BRANDS, FUEL_TYPES, TRANSMISSION_TYPES, SWISS_CITIES } from "@/lib/constants/automotive"
import type { ListingFilters } from "@/lib/queries/listings"

interface VehicleFiltersProps {
  category: "auto" | "moto"
  onFiltersChange: (filters: ListingFilters) => void
  onClose?: () => void
}

export function VehicleFilters({ category, onFiltersChange, onClose }: VehicleFiltersProps) {
  const [filters, setFilters] = useState<ListingFilters>({
    category,
    limit: 12,
  })

  // Memoize brand options based on category
  const brandOptions = useMemo(() => {
    return category === "auto" ? CAR_BRANDS : MOTORCYCLE_BRANDS
  }, [category])

  // Memoize price range options
  const priceRanges = useMemo(
    () => [
      { label: "Do 10,000 CHF", min: 0, max: 10000 },
      { label: "10,000 - 25,000 CHF", min: 10000, max: 25000 },
      { label: "25,000 - 50,000 CHF", min: 25000, max: 50000 },
      { label: "50,000 - 100,000 CHF", min: 50000, max: 100000 },
      { label: "Powyżej 100,000 CHF", min: 100000, max: null },
    ],
    [],
  )

  // Memoize year range
  const yearRange = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = 1990
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i)
  }, [])

  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.brand) count++
    if (filters.model) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.minYear || filters.maxYear) count++
    if (filters.minMileage || filters.maxMileage) count++
    if (filters.fuelType) count++
    if (filters.transmission) count++
    if (filters.location) count++
    if (filters.isAuction) count++
    return count
  }, [filters])

  // Update filters when category changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, category }))
  }, [category])

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = useCallback((key: keyof ListingFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      category,
      limit: 12,
    })
  }, [category])

  const handlePriceRangeSelect = useCallback((range: { min: number; max: number | null }) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: range.min,
      maxPrice: range.max || undefined,
    }))
  }, [])

  const handleBrandChange = useCallback(
    (brand: string) => {
      updateFilter("brand", brand === "all" ? undefined : brand)
      updateFilter("model", undefined) // Reset model when brand changes
    },
    [updateFilter],
  )

  const handleModelChange = useCallback(
    (model: string) => {
      updateFilter("model", model === "all" ? undefined : model)
    },
    [updateFilter],
  )

  const handleFuelTypeChange = useCallback(
    (fuelType: string) => {
      updateFilter("fuelType", fuelType === "all" ? undefined : fuelType)
    },
    [updateFilter],
  )

  const handleTransmissionChange = useCallback(
    (transmission: string) => {
      updateFilter("transmission", transmission === "all" ? undefined : transmission)
    },
    [updateFilter],
  )

  const handleLocationChange = useCallback(
    (location: string) => {
      updateFilter("location", location === "all" ? undefined : location)
    },
    [updateFilter],
  )

  const handleAuctionToggle = useCallback(
    (checked: boolean) => {
      updateFilter("isAuction", checked || undefined)
    },
    [updateFilter],
  )

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filtry</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Wyczyść
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Brand Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Marka</Label>
          <Select value={filters.brand || "all"} onValueChange={handleBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz markę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie marki</SelectItem>
              {brandOptions.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Filter */}
        {filters.brand && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Model</Label>
            <Input
              placeholder="Wpisz model..."
              value={filters.model || ""}
              onChange={(e) => handleModelChange(e.target.value)}
            />
          </div>
        )}

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cena</Label>
          <div className="grid grid-cols-1 gap-2">
            {priceRanges.map((range, index) => (
              <Button
                key={index}
                variant={filters.minPrice === range.min && filters.maxPrice === range.max ? "default" : "outline"}
                size="sm"
                className="justify-start h-8 text-xs"
                onClick={() => handlePriceRangeSelect(range)}
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Custom Price Range */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <Label className="text-xs text-gray-500">Od (CHF)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice || ""}
                onChange={(e) => updateFilter("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Do (CHF)</Label>
              <Input
                type="number"
                placeholder="∞"
                value={filters.maxPrice || ""}
                onChange={(e) => updateFilter("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Year Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rok produkcji</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500">Od</Label>
              <Select
                value={filters.minYear?.toString() || "all"}
                onValueChange={(value) => updateFilter("minYear", value === "all" ? undefined : Number(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Od" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {yearRange.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Do</Label>
              <Select
                value={filters.maxYear?.toString() || "all"}
                onValueChange={(value) => updateFilter("maxYear", value === "all" ? undefined : Number(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Do" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {yearRange.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Mileage Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Przebieg (km)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500">Od</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minMileage || ""}
                onChange={(e) => updateFilter("minMileage", e.target.value ? Number(e.target.value) : undefined)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Do</Label>
              <Input
                type="number"
                placeholder="∞"
                value={filters.maxMileage || ""}
                onChange={(e) => updateFilter("maxMileage", e.target.value ? Number(e.target.value) : undefined)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Fuel Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rodzaj paliwa</Label>
          <Select value={filters.fuelType || "all"} onValueChange={handleFuelTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz paliwo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>
                  {fuel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Skrzynia biegów</Label>
          <Select value={filters.transmission || "all"} onValueChange={handleTransmissionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz skrzynię" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {TRANSMISSION_TYPES.map((transmission) => (
                <SelectItem key={transmission} value={transmission}>
                  {transmission}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Lokalizacja</Label>
          <Select value={filters.location || "all"} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz miasto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cała Szwajcaria</SelectItem>
              {SWISS_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Auction Only */}
        <div className="flex items-center space-x-2">
          <Checkbox id="auction-only" checked={filters.isAuction || false} onCheckedChange={handleAuctionToggle} />
          <Label htmlFor="auction-only" className="text-sm font-medium">
            Tylko aukcje
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
