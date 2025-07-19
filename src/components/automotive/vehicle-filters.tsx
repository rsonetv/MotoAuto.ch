"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X } from "lucide-react"
import { BRANDS, FUEL_TYPES, SWISS_CITIES } from "@/lib/constants/automotive"
import { formatPrice } from "@/lib/utils"

interface VehicleFiltersProps {
  category: "auto" | "moto"
  onFiltersChange?: (filters: any) => void
}

export function VehicleFilters({ category, onFiltersChange }: VehicleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [brand, setBrand] = useState(searchParams.get("brand") || "all")
  const [model, setModel] = useState(searchParams.get("model") || "all")
  const [priceRange, setPriceRange] = useState([
    Number.parseInt(searchParams.get("minPrice") || "0"),
    Number.parseInt(searchParams.get("maxPrice") || "200000"),
  ])
  const [mileageRange, setMileageRange] = useState([
    Number.parseInt(searchParams.get("minMileage") || "0"),
    Number.parseInt(searchParams.get("maxMileage") || "300000"),
  ])
  const [yearRange, setYearRange] = useState([
    Number.parseInt(searchParams.get("minYear") || "2000"),
    Number.parseInt(searchParams.get("maxYear") || "2024"),
  ])
  const [fuelType, setFuelType] = useState(searchParams.get("fuelType") || "all")
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "all")
  const [location, setLocation] = useState(searchParams.get("location") || "all")
  const [isAuction, setIsAuction] = useState(searchParams.get("auction") === "true")

  const brands = category === "auto" ? BRANDS.AUTO : BRANDS.MOTO

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (brand !== "all") params.set("brand", brand)
    if (model !== "all") params.set("model", model)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 200000) params.set("maxPrice", priceRange[1].toString())
    if (mileageRange[0] > 0) params.set("minMileage", mileageRange[0].toString())
    if (mileageRange[1] < 300000) params.set("maxMileage", mileageRange[1].toString())
    if (yearRange[0] > 2000) params.set("minYear", yearRange[0].toString())
    if (yearRange[1] < 2024) params.set("maxYear", yearRange[1].toString())
    if (fuelType !== "all") params.set("fuelType", fuelType)
    if (transmission !== "all") params.set("transmission", transmission)
    if (location !== "all") params.set("location", location)
    if (isAuction) params.set("auction", "true")

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    router.replace(newUrl, { scroll: false })

    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange({
        search,
        brand: brand !== "all" ? brand : undefined,
        model: model !== "all" ? model : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 200000 ? priceRange[1] : undefined,
        minMileage: mileageRange[0] > 0 ? mileageRange[0] : undefined,
        maxMileage: mileageRange[1] < 300000 ? mileageRange[1] : undefined,
        minYear: yearRange[0] > 2000 ? yearRange[0] : undefined,
        maxYear: yearRange[1] < 2024 ? yearRange[1] : undefined,
        fuelType: fuelType !== "all" ? fuelType : undefined,
        transmission: transmission !== "all" ? transmission : undefined,
        location: location !== "all" ? location : undefined,
        isAuction: isAuction || undefined,
        category,
      })
    }
  }, [
    search,
    brand,
    model,
    priceRange,
    mileageRange,
    yearRange,
    fuelType,
    transmission,
    location,
    isAuction,
    category,
    router,
    onFiltersChange,
  ])

  const clearFilters = () => {
    setSearch("")
    setBrand("all")
    setModel("all")
    setPriceRange([0, 200000])
    setMileageRange([0, 300000])
    setYearRange([2000, 2024])
    setFuelType("all")
    setTransmission("all")
    setLocation("all")
    setIsAuction(false)
  }

  const hasActiveFilters =
    search ||
    brand !== "all" ||
    model !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 200000 ||
    mileageRange[0] > 0 ||
    mileageRange[1] < 300000 ||
    yearRange[0] > 2000 ||
    yearRange[1] < 2024 ||
    fuelType !== "all" ||
    transmission !== "all" ||
    location !== "all" ||
    isAuction

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtry
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-1" />
              Wyczyść
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Szukaj</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="np. Porsche 911"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Brand & Model */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Marka</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Wszystkie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {brands.map((brandName) => (
                  <SelectItem key={brandName} value={brandName}>
                    {brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Wszystkie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {/* Models would be dynamically loaded based on brand */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Cena (CHF)</Label>
          <Slider value={priceRange} onValueChange={setPriceRange} max={200000} step={1000} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>

        {/* Mileage Range */}
        <div className="space-y-3">
          <Label>Przebieg (km)</Label>
          <Slider value={mileageRange} onValueChange={setMileageRange} max={300000} step={5000} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{mileageRange[0].toLocaleString()}</span>
            <span>{mileageRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <Label>Rok produkcji</Label>
          <Slider value={yearRange} onValueChange={setYearRange} min={2000} max={2024} step={1} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <Label>Napęd</Label>
          <div className="grid grid-cols-2 gap-2">
            {FUEL_TYPES.map((fuel) => (
              <div key={fuel} className="flex items-center space-x-2">
                <Checkbox
                  id={fuel}
                  checked={fuelType === fuel}
                  onCheckedChange={(checked) => setFuelType(checked ? fuel : "all")}
                />
                <Label htmlFor={fuel} className="text-sm">
                  {fuel}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Lokalizacja</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Cała Szwajcaria" />
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

        {/* Auction Only */}
        <div className="flex items-center space-x-2">
          <Checkbox id="auction" checked={isAuction} onCheckedChange={setIsAuction} />
          <Label htmlFor="auction">Tylko aukcje</Label>
        </div>
      </CardContent>
    </Card>
  )
}
