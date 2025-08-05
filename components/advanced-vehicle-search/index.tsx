"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, ArrowUpDown } from "lucide-react"

import { SearchFilters, AdvancedVehicleSearchProps } from "./schema"
import { VoiceSearchButton } from "./components/VoiceSearchButton"
import { QuickFilterChips } from "./components/QuickFilterChips"
import { SearchSuggestions } from "./components/SearchSuggestions"
import { AdvancedFilters } from "./components/AdvancedFilters"
import { FloatingActionButton } from "./components/FloatingActionButton"

export function AdvancedVehicleSearch({
  initialFilters,
  recentSearches,
  popularSearches,
  brands,
  models,
  locations,
  quickFilters,
  onSearch,
  onFiltersChange,
  className
}: AdvancedVehicleSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [searchQuery, setSearchQuery] = useState(initialFilters.search)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions] = useState<string[]>([
    ...brands.auto.slice(0, 10),
    ...brands.moto.slice(0, 5),
    'SUV', 'Sedan', 'Elektryczny', 'Hybrid', 'Automatyczna', 'Manualna'
  ])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFiltersUpdate = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedFilters = { ...filters, search: searchQuery }
    setFilters(updatedFilters)
    onSearch?.(updatedFilters)
    setShowSuggestions(false)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion)
    const updatedFilters = { ...filters, search: suggestion }
    setFilters(updatedFilters)
    onSearch?.(updatedFilters)
    setShowSuggestions(false)
  }

  const handleVoiceTranscript = (transcript: string) => {
    setSearchQuery(transcript)
    const updatedFilters = { ...filters, search: transcript }
    setFilters(updatedFilters)
    onSearch?.(updatedFilters)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    const updatedFilters = { ...filters, search: '' }
    setFilters(updatedFilters)
    onSearch?.(updatedFilters)
    inputRef.current?.focus()
  }

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      ...initialFilters,
      search: searchQuery // Keep search query
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, val]) => 
      val !== undefined && val !== '' && val !== 'newest' && key !== 'search' && key !== 'sortBy' && val !== 0
    ).length
  }

  return (
    <div className={`advanced-search space-y-6 ${className}`}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Wyszukaj pojazdy - marka, model, słowa kluczowe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-24 touch-friendly text-base"
                  autoComplete="off"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearSearch}
                      className="h-8 w-8 touch-friendly"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <VoiceSearchButton
                    onTranscript={handleVoiceTranscript}
                    className="h-8 w-8"
                  />
                  <Button type="submit" size="sm" className="h-8 touch-friendly">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            <SearchSuggestions
              query={searchQuery}
              recentSearches={recentSearches}
              popularSearches={popularSearches}
              suggestions={suggestions}
              onSuggestionSelect={handleSuggestionSelect}
              isVisible={showSuggestions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Filter Chips */}
      <QuickFilterChips
        quickFilters={quickFilters}
        activeFilters={filters}
        onFilterSelect={handleFiltersUpdate}
      />

      {/* Category & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Badge
            variant={filters.category === 'all' ? 'default' : 'outline'}
            className="cursor-pointer touch-friendly px-4 py-2"
            onClick={() => handleFiltersUpdate({ category: 'all' })}
          >
            Wszystkie
          </Badge>
          <Badge
            variant={filters.category === 'auto' ? 'default' : 'outline'}
            className="cursor-pointer touch-friendly px-4 py-2"
            onClick={() => handleFiltersUpdate({ category: 'auto' })}
          >
            Samochody
          </Badge>
          <Badge
            variant={filters.category === 'moto' ? 'default' : 'outline'}
            className="cursor-pointer touch-friendly px-4 py-2"
            onClick={() => handleFiltersUpdate({ category: 'moto' })}
          >
            Motocykle
          </Badge>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFiltersUpdate({ sortBy: value as any })}
          >
            <SelectTrigger className="w-40 touch-friendly">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Najnowsze</SelectItem>
              <SelectItem value="price_asc">Cena rosnąco</SelectItem>
              <SelectItem value="price_desc">Cena malejąco</SelectItem>
              <SelectItem value="mileage">Przebieg</SelectItem>
              <SelectItem value="year">Rok produkcji</SelectItem>
              <SelectItem value="relevance">Trafność</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.brand && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ brand: undefined })}>
              Marka: {filters.brand} ×
            </Badge>
          )}
          {filters.model && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ model: undefined })}>
              Model: {filters.model} ×
            </Badge>
          )}
          {filters.priceMin && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ priceMin: undefined })}>
              Od: {filters.priceMin.toLocaleString()} {filters.currency} ×
            </Badge>
          )}
          {filters.priceMax && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ priceMax: undefined })}>
              Do: {filters.priceMax.toLocaleString()} {filters.currency} ×
            </Badge>
          )}
          {filters.fuelType && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ fuelType: undefined })}>
              Paliwo: {filters.fuelType} ×
            </Badge>
          )}
          {filters.transmission && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ transmission: undefined })}>
              Skrzynia: {filters.transmission} ×
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="cursor-pointer touch-friendly" onClick={() => handleFiltersUpdate({ location: undefined })}>
              Lokalizacja: {filters.location} ×
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="touch-friendly">
            Wyczyść wszystkie
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Advanced Filters Sidebar */}
        <div className="lg:col-span-1">
          <AdvancedFilters
            filters={filters}
            brands={brands}
            models={models}
            onFiltersChange={handleFiltersUpdate}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Zaawansowane wyszukiwanie pojazdów</h3>
                <p className="text-muted-foreground mb-4">
                  Użyj filtrów po lewej stronie lub wyszukaj głosowo, aby znaleźć swój wymarzony pojazd
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline">Obsługa głosowa</Badge>
                  <Badge variant="outline">Filtry dotykowe</Badge>
                  <Badge variant="outline">Geolokalizacja</Badge>
                  <Badge variant="outline">Multi-waluta</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden">
        <FloatingActionButton
          variant="search"
          onClick={() => inputRef.current?.focus()}
        />
      </div>
    </div>
  )
}