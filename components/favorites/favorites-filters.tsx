"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterOptions {
  search?: string
  category?: string
  brand?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  mileageMin?: number
  mileageMax?: number
  fuelType?: string
  transmission?: string
  condition?: string
  location?: string
  canton?: string
  isAuction?: boolean
  auctionStatus?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface FavoritesFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  categories?: Array<{ id: string; name: string }>
  brands?: string[]
  locations?: string[]
  cantons?: string[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function FavoritesFilters({
  filters,
  onFiltersChange,
  categories = [],
  brands = [],
  locations = [],
  cantons = [],
  isCollapsed = false,
  onToggleCollapse,
  className
}: FavoritesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      sortBy: "favorited_at",
      sortOrder: "desc"
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    const activeFilters = Object.entries(localFilters).filter(([key, value]) => {
      if (key === "sortBy" || key === "sortOrder") return false
      return value !== undefined && value !== "" && value !== null
    })
    return activeFilters.length
  }

  const activeFiltersCount = getActiveFiltersCount()

  if (isCollapsed) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search favorites..."
              value={localFilters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        {/* Category & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={localFilters.category || ""}
              onValueChange={(value) => updateFilter("category", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={localFilters.brand || ""}
              onValueChange={(value) => updateFilter("brand", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range (CHF)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min price"
              value={localFilters.priceMin || ""}
              onChange={(e) => updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max price"
              value={localFilters.priceMax || ""}
              onChange={(e) => updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-2">
          <Label>Year Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min year"
              value={localFilters.yearMin || ""}
              onChange={(e) => updateFilter("yearMin", e.target.value ? Number(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max year"
              value={localFilters.yearMax || ""}
              onChange={(e) => updateFilter("yearMax", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Mileage Range */}
        <div className="space-y-2">
          <Label>Mileage Range (km)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min mileage"
              value={localFilters.mileageMin || ""}
              onChange={(e) => updateFilter("mileageMin", e.target.value ? Number(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max mileage"
              value={localFilters.mileageMax || ""}
              onChange={(e) => updateFilter("mileageMax", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        <Separator />

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select
              value={localFilters.fuelType || ""}
              onValueChange={(value) => updateFilter("fuelType", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All fuel types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All fuel types</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select
              value={localFilters.transmission || ""}
              onValueChange={(value) => updateFilter("transmission", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All transmissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All transmissions</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="semi-automatic">Semi-automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <Select
            value={localFilters.condition || ""}
            onValueChange={(value) => updateFilter("condition", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All conditions</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={localFilters.location || ""}
              onValueChange={(value) => updateFilter("location", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Canton</Label>
            <Select
              value={localFilters.canton || ""}
              onValueChange={(value) => updateFilter("canton", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cantons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All cantons</SelectItem>
                {cantons.map((canton) => (
                  <SelectItem key={canton} value={canton}>
                    {canton}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Auction Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auctions-only"
              checked={localFilters.isAuction === true}
              onCheckedChange={(checked) => 
                updateFilter("isAuction", checked ? true : undefined)
              }
            />
            <Label htmlFor="auctions-only">Auctions only</Label>
          </div>

          {localFilters.isAuction && (
            <div className="space-y-2">
              <Label>Auction Status</Label>
              <Select
                value={localFilters.auctionStatus || ""}
                onValueChange={(value) => updateFilter("auctionStatus", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All auction statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ending_soon">Ending Soon</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy || "favorited_at"}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="favorited_at">Date Added</SelectItem>
                <SelectItem value="created_at">Date Listed</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="mileage">Mileage</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="favorites_count">Popularity</SelectItem>
                <SelectItem value="auction_end_time">Auction End</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={localFilters.sortOrder || "desc"}
              onValueChange={(value) => updateFilter("sortOrder", value as "asc" | "desc")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}