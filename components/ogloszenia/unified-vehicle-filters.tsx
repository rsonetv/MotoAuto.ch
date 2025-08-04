"use client"

import { useState, useEffect } from "react"
import useMediaQuery from "@/hooks/use-media-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RangeSlider } from "@/components/ui/range-slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  X, Filter, RotateCcw, SlidersHorizontal,
  Calendar, PiggyBank, Fuel, Gauge, Map
} from "lucide-react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    bodyType?: string
    condition?: string
    location?: string
    radius?: number
    sortBy?: string
  }
  category: string
  categories: Category[]
  onChange: (newFilters: Partial<VehicleFiltersProps['filters']>) => void
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

const BODY_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "coupe", label: "Coupe" },
  { value: "kombi", label: "Kombi" },
  { value: "hatchback", label: "Hatchback" },
]

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-CH').format(price);
}

export function UnifiedVehicleFilters({ filters, category, categories, onChange }: VehicleFiltersProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const currentYear = new Date().getFullYear();
  const minYear = 1995;
  const maxPrice = 500000;
  
  const [priceRange, setPriceRange] = useState([filters.priceMin || 0, filters.priceMax || maxPrice])
  const [yearRange, setYearRange] = useState([filters.yearMin || minYear, filters.yearMax || currentYear])
  const [mileage, setMileage] = useState(filters.mileageMax || 200000)
  const [radius, setRadius] = useState(filters.radius || 0)
  const [locationInput, setLocationInput] = useState(filters.location || "")
  
  const availableBrands = category === 'moto' ? BRANDS.moto : BRANDS.auto

  useEffect(() => {
    setPriceRange([filters.priceMin || 0, filters.priceMax || maxPrice]);
    setYearRange([filters.yearMin || minYear, filters.yearMax || currentYear]);
    setMileage(filters.mileageMax || 200000);
    setRadius(filters.radius || 0);
    setLocationInput(filters.location || "");
  }, [filters]);

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, val]) => 
      val !== undefined && val !== '' && val !== 'newest' && key !== 'search' && key !== 'sortBy'
    ).length;
  }

  const handleFilterChange = (newFilter: Partial<typeof filters>) => {
    onChange(newFilter);
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    onChange({
      priceMin: values[0] > 0 ? values[0] : undefined,
      priceMax: values[1] < maxPrice ? values[1] : undefined,
    })
  }

  const handleYearChange = (values: number[]) => {
    setYearRange(values)
    onChange({
      yearMin: values[0] > minYear ? values[0] : undefined,
      yearMax: values[1] < currentYear ? values[1] : undefined,
    })
  }
  
  const handleMileageChange = (values: number[]) => {
    setMileage(values[0])
    onChange({
      mileageMax: values[0] < 300000 ? values[0] : undefined
    })
  }

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0])
    onChange({ radius: value[0] > 0 ? value[0] : undefined })
  }

  const clearAllFilters = () => {
    onChange({
      brand: undefined, priceMin: undefined, priceMax: undefined,
      yearMin: undefined, yearMax: undefined, mileageMax: undefined,
      fuelType: undefined, transmission: undefined, bodyType: undefined,
      condition: undefined, location: undefined, radius: undefined,
    })
  }

  const desktopFilters = (
    <Card className="sticky top-24">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Wyczyść wszystkie filtry</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

        {/* Cena */}
        <div className="space-y-3">
          <Label className="flex items-center"><PiggyBank className="h-4 w-4 mr-2" />Cena (CHF)</Label>
          <div className="px-2">
            <RangeSlider value={priceRange} onValueChange={handlePriceChange} max={maxPrice} min={0} step={1000} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>

        <Separator />

        {/* Rok */}
        <div className="space-y-3">
          <Label className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Rok produkcji</Label>
          <div className="px-2">
            <RangeSlider value={yearRange} onValueChange={handleYearChange} max={currentYear} min={minYear} step={1} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
        </div>

        <Separator />

        {/* Przebieg */}
        <div className="space-y-3">
          <Label className="flex items-center"><Gauge className="h-4 w-4 mr-2" />Maks. przebieg (km)</Label>
          <div className="px-2">
            <Slider value={[mileage]} onValueChange={handleMileageChange} max={300000} min={0} step={5000} />
          </div>
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>do {formatPrice(mileage)} km</span>
          </div>
        </div>

        <Separator />

        {/* Paliwo */}
        <div className="space-y-2">
          <Label className="flex items-center"><Fuel className="h-4 w-4 mr-2" />Rodzaj paliwa</Label>
          <Select value={filters.fuelType || "all"} onValueChange={(value) => handleFilterChange({ fuelType: value === "all" ? undefined : value })}>
            <SelectTrigger><SelectValue placeholder="Wszystkie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {FUEL_TYPES.map(fuel => <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />

        {/* Nadwozie */}
        <div className="space-y-2">
          <Label>Typ nadwozia</Label>
          <Select value={filters.bodyType || "all"} onValueChange={(value) => handleFilterChange({ bodyType: value === "all" ? undefined : value })}>
            <SelectTrigger><SelectValue placeholder="Wszystkie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {BODY_TYPES.map(body => <SelectItem key={body.value} value={body.value}>{body.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Skrzynia */}
        <div className="space-y-2">
          <Label>Skrzynia biegów</Label>
          <Select value={filters.transmission || "all"} onValueChange={(value) => handleFilterChange({ transmission: value === "all" ? undefined : value })}>
            <SelectTrigger><SelectValue placeholder="Wszystkie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {TRANSMISSIONS.map(trans => <SelectItem key={trans.value} value={trans.value}>{trans.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Stan */}
        <div className="space-y-2">
          <Label>Stan pojazdu</Label>
          <Select value={filters.condition || "all"} onValueChange={(value) => handleFilterChange({ condition: value === "all" ? undefined : value })}>
            <SelectTrigger><SelectValue placeholder="Wszystkie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {CONDITIONS.map(cond => <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Lokalizacja */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="locationDesktop" className="flex items-center"><Map className="h-4 w-4 mr-2" />Lokalizacja</Label>
            <Input id="locationDesktop" placeholder="Miasto, kod pocztowy" value={locationInput} onChange={(e) => { setLocationInput(e.target.value); handleFilterChange({ location: e.target.value || undefined })}} />
          </div>
          <div>
            <Label>Promień (km)</Label>
            <div className="px-2 pt-2">
              <Slider value={[radius]} onValueChange={handleRadiusChange} max={100} min={0} step={5} />
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
              <span>{radius} km</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const mobileFilters = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full flex items-center justify-center lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          <span>Filtry</span>
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
            Filtry
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto pb-16">
          <Accordion type="multiple" className="w-full">
            {/* Marka */}
            <AccordionItem value="brand">
              <AccordionTrigger>Marka {filters.brand && <Badge variant="outline" className="ml-2">{filters.brand}</Badge>}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant={!filters.brand ? "secondary" : "outline"} onClick={() => handleFilterChange({ brand: undefined })}>Wszystkie</Button>
                  {availableBrands.map(brand => <Button key={brand} variant={filters.brand === brand ? "secondary" : "outline"} onClick={() => handleFilterChange({ brand })}>{brand}</Button>)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Cena */}
            <AccordionItem value="price">
              <AccordionTrigger>Cena</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <RangeSlider value={priceRange} onValueChange={handlePriceChange} max={maxPrice} min={0} step={1000} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                    <span>{formatPrice(priceRange[0])} CHF</span>
                    <span>{formatPrice(priceRange[1])} CHF</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rok */}
            <AccordionItem value="year">
              <AccordionTrigger>Rok produkcji</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <RangeSlider value={yearRange} onValueChange={handleYearChange} max={currentYear} min={minYear} step={1} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Przebieg */}
            <AccordionItem value="mileage">
              <AccordionTrigger>Przebieg</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <Slider value={[mileage]} onValueChange={handleMileageChange} max={300000} min={0} step={5000} />
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground px-2">
                    <span>do {formatPrice(mileage)} km</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Paliwo */}
            <AccordionItem value="fuelType">
              <AccordionTrigger>Rodzaj paliwa</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 py-2">
                  <Button variant={!filters.fuelType ? "secondary" : "outline"} onClick={() => handleFilterChange({ fuelType: undefined })}>Wszystkie</Button>
                  {FUEL_TYPES.map(fuel => <Button key={fuel.value} variant={filters.fuelType === fuel.value ? "secondary" : "outline"} onClick={() => handleFilterChange({ fuelType: fuel.value })}>{fuel.label}</Button>)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Nadwozie */}
            <AccordionItem value="bodyType">
              <AccordionTrigger>Typ nadwozia</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 py-2">
                  <Button variant={!filters.bodyType ? "secondary" : "outline"} onClick={() => handleFilterChange({ bodyType: undefined })}>Wszystkie</Button>
                  {BODY_TYPES.map(body => <Button key={body.value} variant={filters.bodyType === body.value ? "secondary" : "outline"} onClick={() => handleFilterChange({ bodyType: body.value })}>{body.label}</Button>)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Skrzynia */}
            <AccordionItem value="transmission">
              <AccordionTrigger>Skrzynia biegów</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 py-2">
                  <Button variant={!filters.transmission ? "secondary" : "outline"} onClick={() => handleFilterChange({ transmission: undefined })}>Wszystkie</Button>
                  {TRANSMISSIONS.map(trans => <Button key={trans.value} variant={filters.transmission === trans.value ? "secondary" : "outline"} onClick={() => handleFilterChange({ transmission: trans.value })}>{trans.label}</Button>)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stan */}
            <AccordionItem value="condition">
              <AccordionTrigger>Stan pojazdu</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 py-2">
                  <Button variant={!filters.condition ? "secondary" : "outline"} onClick={() => handleFilterChange({ condition: undefined })}>Wszystkie</Button>
                  {CONDITIONS.map(cond => <Button key={cond.value} variant={filters.condition === cond.value ? "secondary" : "outline"} onClick={() => handleFilterChange({ condition: cond.value })}>{cond.label}</Button>)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Lokalizacja */}
            <AccordionItem value="location">
              <AccordionTrigger>Lokalizacja</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="locationMobile">Miejscowość</Label>
                    <Input id="locationMobile" placeholder="Miasto, kod pocztowy" value={locationInput} onChange={(e) => { setLocationInput(e.target.value); handleFilterChange({ location: e.target.value || undefined })}} />
                  </div>
                  <div>
                    <Label>Promień (km)</Label>
                    <div className="px-2 pt-2">
                      <Slider value={[radius]} onValueChange={handleRadiusChange} max={100} min={0} step={5} />
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
                      <span>{radius} km</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-2 w-full">
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Wyczyść
              </Button>
            )}
            <SheetClose asChild>
              <Button className="flex-1">
                Pokaż wyniki ({getActiveFiltersCount()})
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return isDesktop ? desktopFilters : mobileFilters;
}