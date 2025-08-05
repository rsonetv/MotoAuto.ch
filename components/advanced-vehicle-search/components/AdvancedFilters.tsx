"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Filter, RotateCcw, Calendar, Gauge, Fuel, Car } from "lucide-react"
import { SearchFilters, BrandsByCategory, ModelsByBrand } from "../schema"
import { formatPrice, formatMileage } from "../string-formatters"
import { CurrencySelector } from "./CurrencySelector"
import { LocationSearch } from "./LocationSearch"

interface AdvancedFiltersProps {
  filters: SearchFilters
  brands: BrandsByCategory
  models: ModelsByBrand
  onFiltersChange: (filters: Partial<SearchFilters>) => void
  onClearFilters: () => void
  className?: string
}

const FUEL_TYPES = [
  { value: "gasoline", label: "Benzyna" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Elektryczny" },
  { value: "hybrid", label: "Hybryda" },
  { value: "plugin_hybrid", label: "Hybryda plug-in" },
  { value: "gas", label: "Gaz" },
  { value: "ethanol", label: "Etanol" }
]

const TRANSMISSIONS = [
  { value: "manual", label: "Manualna" },
  { value: "automatic", label: "Automatyczna" },
  { value: "semi_automatic", label: "Półautomatyczna" },
  { value: "cvt", label: "CVT" }
]

const CONDITIONS = [
  { value: "new", label: "Nowy" },
  { value: "excellent", label: "Doskonały" },
  { value: "very_good", label: "Bardzo dobry" },
  { value: "good", label: "Dobry" },
  { value: "fair", label: "Przeciętny" },
  { value: "damaged", label: "Uszkodzony" }
]

const BODY_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "coupe", label: "Coupe" },
  { value: "kombi", label: "Kombi" },
  { value: "hatchback", label: "Hatchback" },
]

export function AdvancedFilters({
  filters,
  brands,
  models,
  onFiltersChange,
  onClearFilters,
  className
}: AdvancedFiltersProps) {
  const currentYear = new Date().getFullYear()
  const minYear = 1995
  const maxPrice = 500000

  const [priceRange, setPriceRange] = useState([filters.priceMin || 0, filters.priceMax || maxPrice])
  const [yearRange, setYearRange] = useState([filters.yearMin || minYear, filters.yearMax || currentYear])
  const [mileage, setMileage] = useState(filters.mileageMax || 200000)

  const availableBrands = filters.category === 'moto' ? brands.moto : brands.auto
  const availableModels = filters.brand ? models[filters.brand] || [] : []

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, val]) => 
      val !== undefined && val !== '' && val !== 'newest' && key !== 'search' && key !== 'sortBy' && val !== 0
    ).length
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    onFiltersChange({
      priceMin: values[0] > 0 ? values[0] : undefined,
      priceMax: values[1] < maxPrice ? values[1] : undefined,
    })
  }

  const handleYearChange = (values: number[]) => {
    setYearRange(values)
    onFiltersChange({
      yearMin: values[0] > minYear ? values[0] : undefined,
      yearMax: values[1] < currentYear ? values[1] : undefined,
    })
  }

  const handleMileageChange = (values: number[]) => {
    setMileage(values[0])
    onFiltersChange({
      mileageMax: values[0] < 300000 ? values[0] : undefined
    })
  }

  // Desktop filters
  const desktopFilters = (
    <Card className={`sticky top-24 hidden lg:block ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtry zaawansowane
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency */}
        <CurrencySelector
          value={filters.currency}
          onChange={(currency) => onFiltersChange({ currency })}
        />

        <Separator />

        {/* Brand */}
        <div className="space-y-2">
          <Label>Marka</Label>
          <Select
            value={filters.brand || ""}
            onValueChange={(value) => onFiltersChange({ 
              brand: value === "all" ? undefined : value,
              model: undefined // Reset model when brand changes
            })}
          >
            <SelectTrigger className="touch-friendly">
              <SelectValue placeholder="Wszystkie marki" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie marki</SelectItem>
              {availableBrands.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        {filters.brand && availableModels.length > 0 && (
          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={filters.model || ""}
              onValueChange={(value) => onFiltersChange({ model: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="touch-friendly">
                <SelectValue placeholder="Wszystkie modele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie modele</SelectItem>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Price */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Cena ({filters.currency})
          </Label>
          <div className="px-2">
            <Slider 
              value={priceRange} 
              onValueChange={handlePriceChange} 
              max={maxPrice} 
              min={0} 
              step={1000}
              className="touch-friendly"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0], filters.currency)}</span>
            <span>{formatPrice(priceRange[1], filters.currency)}</span>
          </div>
        </div>

        <Separator />

        {/* Year */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rok produkcji
          </Label>
          <div className="px-2">
            <Slider 
              value={yearRange} 
              onValueChange={handleYearChange} 
              max={currentYear} 
              min={minYear} 
              step={1}
              className="touch-friendly"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
        </div>

        <Separator />

        {/* Mileage */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Maks. przebieg
          </Label>
          <div className="px-2">
            <Slider 
              value={[mileage]} 
              onValueChange={handleMileageChange} 
              max={300000} 
              min={0} 
              step={5000}
              className="touch-friendly"
            />
          </div>
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>do {formatMileage(mileage)}</span>
          </div>
        </div>

        <Separator />

        {/* Fuel Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Rodzaj paliwa
          </Label>
          <Select 
            value={filters.fuelType || "all"} 
            onValueChange={(value) => onFiltersChange({ fuelType: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="touch-friendly">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {FUEL_TYPES.map(fuel => (
                <SelectItem key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Transmission */}
        <div className="space-y-2">
          <Label>Skrzynia biegów</Label>
          <Select 
            value={filters.transmission || "all"} 
            onValueChange={(value) => onFiltersChange({ transmission: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="touch-friendly">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {TRANSMISSIONS.map(trans => (
                <SelectItem key={trans.value} value={trans.value}>
                  {trans.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Body Type */}
        <div className="space-y-2">
          <Label>Typ nadwozia</Label>
          <Select 
            value={filters.bodyType || "all"} 
            onValueChange={(value) => onFiltersChange({ bodyType: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="touch-friendly">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {BODY_TYPES.map(body => (
                <SelectItem key={body.value} value={body.value}>
                  {body.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Condition */}
        <div className="space-y-2">
          <Label>Stan pojazdu</Label>
          <Select 
            value={filters.condition || "all"} 
            onValueChange={(value) => onFiltersChange({ condition: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="touch-friendly">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {CONDITIONS.map(cond => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Location */}
        <LocationSearch
          location={filters.location || ''}
          radius={filters.radius}
          onLocationChange={(location) => onFiltersChange({ location: location || undefined })}
          onRadiusChange={(radius) => onFiltersChange({ radius })}
        />
      </CardContent>
    </Card>
  )

  // Mobile filters
  const mobileFilters = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full flex items-center justify-center lg:hidden touch-friendly">
          <Filter className="h-4 w-4 mr-2" />
          <span>Filtry zaawansowane</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtry zaawansowane
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto pb-16">
          <Accordion type="multiple" className="w-full">
            {/* Currency & Brand */}
            <AccordionItem value="basic">
              <AccordionTrigger>Podstawowe</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <CurrencySelector
                  value={filters.currency}
                  onChange={(currency) => onFiltersChange({ currency })}
                />
                
                <div>
                  <Label>Marka</Label>
                  <Select
                    value={filters.brand || ""}
                    onValueChange={(value) => onFiltersChange({ 
                      brand: value === "all" ? undefined : value,
                      model: undefined
                    })}
                  >
                    <SelectTrigger className="touch-friendly mt-2">
                      <SelectValue placeholder="Wszystkie marki" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie marki</SelectItem>
                      {availableBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.brand && availableModels.length > 0 && (
                  <div>
                    <Label>Model</Label>
                    <Select
                      value={filters.model || ""}
                      onValueChange={(value) => onFiltersChange({ model: value === "all" ? undefined : value })}
                    >
                      <SelectTrigger className="touch-friendly mt-2">
                        <SelectValue placeholder="Wszystkie modele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Wszystkie modele</SelectItem>
                        {availableModels.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Price */}
            <AccordionItem value="price">
              <AccordionTrigger>Cena</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <Slider 
                      value={priceRange} 
                      onValueChange={handlePriceChange} 
                      max={maxPrice} 
                      min={0} 
                      step={1000}
                      className="touch-friendly"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                    <span>{formatPrice(priceRange[0], filters.currency)}</span>
                    <span>{formatPrice(priceRange[1], filters.currency)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Year */}
            <AccordionItem value="year">
              <AccordionTrigger>Rok produkcji</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <Slider 
                      value={yearRange} 
                      onValueChange={handleYearChange} 
                      max={currentYear} 
                      min={minYear} 
                      step={1}
                      className="touch-friendly"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Mileage */}
            <AccordionItem value="mileage">
              <AccordionTrigger>Przebieg</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <Slider 
                      value={[mileage]} 
                      onValueChange={handleMileageChange} 
                      max={300000} 
                      min={0} 
                      step={5000}
                      className="touch-friendly"
                    />
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground px-2">
                    <span>do {formatMileage(mileage)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Vehicle Details */}
            <AccordionItem value="details">
              <AccordionTrigger>Szczegóły pojazdu</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <Label>Rodzaj paliwa</Label>
                  <Select 
                    value={filters.fuelType || "all"} 
                    onValueChange={(value) => onFiltersChange({ fuelType: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="touch-friendly mt-2">
                      <SelectValue placeholder="Wszystkie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      {FUEL_TYPES.map(fuel => (
                        <SelectItem key={fuel.value} value={fuel.value}>
                          {fuel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skrzynia biegów</Label>
                  <Select 
                    value={filters.transmission || "all"} 
                    onValueChange={(value) => onFiltersChange({ transmission: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="touch-friendly mt-2">
                      <SelectValue placeholder="Wszystkie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      {TRANSMISSIONS.map(trans => (
                        <SelectItem key={trans.value} value={trans.value}>
                          {trans.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Typ nadwozia</Label>
                  <Select 
                    value={filters.bodyType || "all"} 
                    onValueChange={(value) => onFiltersChange({ bodyType: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="touch-friendly mt-2">
                      <SelectValue placeholder="Wszystkie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      {BODY_TYPES.map(body => (
                        <SelectItem key={body.value} value={body.value}>
                          {body.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Stan pojazdu</Label>
                  <Select 
                    value={filters.condition || "all"} 
                    onValueChange={(value) => onFiltersChange({ condition: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="touch-friendly mt-2">
                      <SelectValue placeholder="Wszystkie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      {CONDITIONS.map(cond => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location */}
            <AccordionItem value="location">
              <AccordionTrigger>Lokalizacja</AccordionTrigger>
              <AccordionContent>
                <LocationSearch
                  location={filters.location || ''}
                  radius={filters.radius}
                  onLocationChange={(location) => onFiltersChange({ location: location || undefined })}
                  onRadiusChange={(radius) => onFiltersChange({ radius })}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-2 w-full">
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" onClick={onClearFilters} className="flex-1 touch-friendly">
                <RotateCcw className="h-4 w-4 mr-2" />
                Wyczyść
              </Button>
            )}
            <SheetClose asChild>
              <Button className="flex-1 touch-friendly">
                Zastosuj filtry ({getActiveFiltersCount()})
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )

  return (
    <>
      {desktopFilters}
      {mobileFilters}
    </>
  )
}