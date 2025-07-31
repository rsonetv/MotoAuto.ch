"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import type { Database } from "@/lib/database.types"

// Define category type locally since it's not exported from database.types
type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

interface VehicleFiltersProps {
  filters: {
    search: string
    brand?: string
    priceMin?: number
    priceMax?: number
    yearMin?: number
    yearMax?: number
    mileageMax?: number
    fuelType?: string
    transmission?: string
    condition?: string
    location?: string
    radius?: number
  }
  category: string
  categories: Category[]
}

const BRANDS = {
  auto: [
    "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Toyota", "Honda",
    "Ford", "Opel", "Peugeot", "Renault", "Skoda", "Volvo", "Porsche",
    "Ferrari", "Lamborghini", "Tesla", "Hyundai", "Kia", "Mazda", "Nissan"
  ],
  moto: [
    "Yamaha", "Honda", "Kawasaki", "Suzuki", "Ducati", "BMW", "KTM",
    "Harley-Davidson", "Triumph", "Aprilia", "MV Agusta", "Husqvarna"
  ]
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

export function VehicleFilters({ filters, category, categories }: VehicleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Sprawdź czy kategorie się ładują
  const isLoading = categories.length === 0;
  
  const [priceRange, setPriceRange] = useState([
    filters.priceMin || 0,
    filters.priceMax || 200000
  ])
  const [yearRange, setYearRange] = useState([
    filters.yearMin || 1990,
    filters.yearMax || new Date().getFullYear()
  ])
  const [radius, setRadius] = useState(filters.radius || 0)
  const [locationInput, setLocationInput] = useState(filters.location || "")

  const currentYear = new Date().getFullYear()
  const availableBrands = category === 'moto' ? BRANDS.moto : BRANDS.auto

  const handleFilterChange = (newFilter: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilter };
    const params = new URLSearchParams();

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && String(value) !== 'all') {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    handleFilterChange({
      priceMin: values[0] > 0 ? values[0] : undefined,
      priceMax: values[1] < 200000 ? values[1] : undefined,
    })
  }

  const handleYearChange = (values: number[]) => {
    setYearRange(values)
    handleFilterChange({
      yearMin: values[0] > 1990 ? values[0] : undefined,
      yearMax: values[1] < currentYear ? values[1] : undefined,
    })
  }

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0])
    handleFilterChange({ radius: value[0] > 0 ? value[0] : undefined })
  }

  const clearAllFilters = () => {
    setPriceRange([0, 200000])
    setYearRange([1990, currentYear])
    setRadius(0)
    router.push(pathname, { scroll: false })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.brand) count++
    if (filters.priceMin || filters.priceMax) count++
    if (filters.yearMin || filters.yearMax) count++
    if (filters.mileageMax) count++
    if (filters.fuelType) count++
    if (filters.transmission) count++
    if (filters.condition) count++
    if (filters.location) count++
    if (filters.radius) count++
    return count
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtry
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
              onClick={clearAllFilters}
              className="h-8 px-2"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Marka */}
        <div className="space-y-2">
          <Label>Marka</Label>
          <Select
            value={filters.brand || ""}
            onValueChange={(value) => handleFilterChange({ brand: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
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

        <Separator />

        {/* Przedział cenowy */}
        <div className="space-y-3">
          <Label>Cena (CHF)</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={200000}
              min={0}
              step={1000}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{priceRange[0].toLocaleString()} CHF</span>
            <span>{priceRange[1].toLocaleString()} CHF</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="priceMin" className="text-xs">Od</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="0"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange({ priceMin: e.target.value ? parseInt(e.target.value) : undefined })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="priceMax" className="text-xs">Do</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="200000"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange({ priceMax: e.target.value ? parseInt(e.target.value) : undefined })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rok produkcji */}
        <div className="space-y-3">
          <Label>Rok produkcji</Label>
          <div className="px-2">
            <Slider
              value={yearRange}
              onValueChange={handleYearChange}
              max={currentYear}
              min={1990}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
        </div>

        <Separator />

        {/* Przebieg */}
        <div className="space-y-2">
          <Label htmlFor="mileage">Maksymalny przebieg (km)</Label>
          <Input
            id="mileage"
            type="number"
            placeholder="np. 100000"
            value={filters.mileageMax || ''}
            onChange={(e) => handleFilterChange({ mileageMax: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>

        <Separator />

        {/* Rodzaj paliwa */}
        <div className="space-y-2">
          <Label>Rodzaj paliwa</Label>
          <Select
            value={filters.fuelType || "all"}
            onValueChange={(value) => handleFilterChange({ fuelType: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
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

        {/* Skrzynia biegów */}
        <div className="space-y-2">
          <Label>Skrzynia biegów</Label>
          <Select
            value={filters.transmission || ""}
            onValueChange={(value) => handleFilterChange({ transmission: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
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

        {/* Stan pojazdu */}
        <div className="space-y-2">
          <Label>Stan pojazdu</Label>
          <Select
            value={filters.condition || "all"}
            onValueChange={(value) => handleFilterChange({ condition: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {CONDITIONS.map(condition => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Lokalizacja */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="location">Lokalizacja</Label>
            <Input
              id="location"
              placeholder="Miasto, kod pocztowy"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value)
                handleFilterChange({ location: e.target.value || undefined })
              }}
            />
          </div>
          <div>
            <Label>Promień (km)</Label>
            <div className="px-2 pt-2">
              <Slider
                value={[radius]}
                onValueChange={handleRadiusChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
              <span>{radius} km</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
