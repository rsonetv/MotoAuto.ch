"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleList } from "@/components/ogloszenia/vehicle-list"
import { VehicleFilters } from "@/components/ogloszenia/vehicle-filters"
import { CategoryTabs } from "@/components/ogloszenia/category-tabs"
import { SearchBar } from "@/components/ogloszenia/search-bar"
import { SortControls } from "@/components/ogloszenia/sort-controls"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import { Car, Bike, Plus, Filter, MapPin, SlidersHorizontal, Info, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

// Define types from the database schema
type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: {
    id: string;
    full_name: string | null;
    dealer_name: string | null;
    is_dealer: boolean;
    location: string | null;
    phone: string | null;
    email: string | null;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  main_image?: string;
  is_featured?: boolean;
  is_auction?: boolean;
  fuel_type?: string;
  transmission?: string;
}

type Category = Database['public']['Tables']['categories']['Row'] & {
  count?: number;
}

interface VehicleFiltersState {
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
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'mileage' | 'year'
}

function OgloszeniaTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const category = searchParams?.get('category') || 'all'
  
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<VehicleFiltersState>({
    search: searchParams?.get('search') || '',
    sortBy: 'newest'
  })
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Load categories once on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Load listings when category, filters, or page changes
  useEffect(() => {
    loadListings()
  }, [category, filters, currentPage])

  const loadCategories = async () => {
    try {
      const supabase = createClientComponentClient<Database>()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "Błąd podczas ładowania kategorii",
        variant: "destructive"
      })
    }
  }

  const loadListings = async () => {
    if (!category) return;
    
    setLoading(true)
    try {
      const supabase = createClientComponentClient<Database>()
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles (
            id,
            full_name,
            dealer_name,
            is_dealer,
            location,
            phone,
            email
          ),
          categories (
            id,
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('is_auction', category === 'aukcje')

      // Apply category filter
      if (category !== 'all' && category !== 'aukcje') {
        const categoryData = categories.find(cat => cat.slug === category)
        if (categoryData) {
          query = query.eq('category_id', categoryData.id)
        }
      }

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
      }

      if (filters.brand) {
        query = query.eq('brand', filters.brand)
      }

      if (filters.priceMin) {
        query = query.gte('price', filters.priceMin)
      }

      if (filters.priceMax) {
        query = query.lte('price', filters.priceMax)
      }

      if (filters.yearMin) {
        query = query.gte('year', filters.yearMin)
      }

      if (filters.yearMax) {
        query = query.lte('year', filters.yearMax)
      }

      if (filters.mileageMax) {
        query = query.lte('mileage', filters.mileageMax)
      }

      if (filters.fuelType) {
        query = query.eq('fuel_type', filters.fuelType)
      }

      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission)
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'mileage':
          query = query.order('mileage', { ascending: true })
          break
        case 'year':
          query = query.order('year', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const itemsPerPage = 12
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setListings(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading listings:', error)
      toast({
        title: "Błąd podczas ładowania ogłoszeń",
        description: "Spróbuj odświeżyć stronę",
        variant: "destructive"
      })
      setListings([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (newCategory: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    if (newCategory === 'all') {
      params.delete('category')
    } else {
      params.set('category', newCategory)
    }
    router.push(`/ogloszenia?${params.toString()}`)
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: Partial<VehicleFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const handleSearch = (searchTerm: string) => {
    handleFiltersChange({ search: searchTerm })
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
    return count
  }

  const getCategoryCounts = () => {
    // Use actual counts from categories if available, otherwise use defaults
    const autoCategory = categories.find(c => c.slug === 'auto')
    const motoCategory = categories.find(c => c.slug === 'moto')
    
    return {
      all: totalCount,
      auto: autoCategory?.count || 0,
      moto: motoCategory?.count || 0,
      aukcje: 0 // This would be populated from a separate API call if needed
    }
  }

  const categoryLabel = () => {
    switch(category) {
      case 'auto': return 'Samochody';
      case 'moto': return 'Motocykle';
      case 'aukcje': return 'Aukcje pojazdów';
      default: return 'Ogłoszenia pojazdów';
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1.5">
                {categoryLabel()}
              </h1>
              <p className="text-muted-foreground">
                {loading ? 'Ładowanie ogłoszeń...' : 
                  `Znaleziono ${totalCount.toLocaleString()} ${
                    totalCount === 1 ? 'ogłoszenie' : 
                    totalCount < 5 ? 'ogłoszenia' : 'ogłoszeń'
                  }`
                }
              </p>
            </div>
            <Button onClick={() => router.push('/ogloszenia/dodaj')} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj ogłoszenie
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="mb-8">
            <CategoryTabs
              value={category}
              onChange={handleCategoryChange}
              counts={getCategoryCounts()}
            />
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                value={filters.search}
                onChange={handleSearch}
                placeholder="Szukaj po marce, modelu, tytule..."
              />
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="md:hidden"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtry
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <div className="h-full py-4">
                    <VehicleFilters
                      filters={filters}
                      onChange={handleFiltersChange}
                      category={category}
                      categories={categories}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <SortControls
                value={filters.sortBy}
                onChange={(sortBy: 'newest' | 'price_asc' | 'price_desc' | 'mileage' | 'year') => handleFiltersChange({ sortBy })}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Marka: {filters.brand}</span>
                  <button onClick={() => handleFiltersChange({ brand: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters.priceMin || filters.priceMax) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>
                    Cena: 
                    {filters.priceMin ? ` od ${filters.priceMin.toLocaleString()} CHF` : ''}
                    {filters.priceMin && filters.priceMax ? ' - ' : ''}
                    {filters.priceMax ? `do ${filters.priceMax.toLocaleString()} CHF` : ''}
                  </span>
                  <button onClick={() => handleFiltersChange({ priceMin: undefined, priceMax: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters.yearMin || filters.yearMax) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>
                    Rok: 
                    {filters.yearMin ? ` od ${filters.yearMin}` : ''}
                    {filters.yearMin && filters.yearMax ? ' - ' : ''}
                    {filters.yearMax ? `do ${filters.yearMax}` : ''}
                  </span>
                  <button onClick={() => handleFiltersChange({ yearMin: undefined, yearMax: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.mileageMax && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Przebieg: do {filters.mileageMax.toLocaleString()} km</span>
                  <button onClick={() => handleFiltersChange({ mileageMax: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.fuelType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Paliwo: {filters.fuelType}</span>
                  <button onClick={() => handleFiltersChange({ fuelType: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.transmission && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Skrzynia: {filters.transmission}</span>
                  <button onClick={() => handleFiltersChange({ transmission: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Stan: {filters.condition}</span>
                  <button onClick={() => handleFiltersChange({ condition: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{filters.location}</span>
                  <button onClick={() => handleFiltersChange({ location: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => setFilters(prev => ({
                  search: prev.search,
                  sortBy: prev.sortBy
                }))}
              >
                Wyczyść filtry
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <VehicleFilters
              filters={filters}
              onChange={handleFiltersChange}
              category={category}
              categories={categories}
            />
          </div>

          {/* Listings Grid */}
          <div className="md:col-span-3">
            <VehicleList
              listings={listings}
              loading={loading}
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              category={category}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OgloszeniePage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }>
          <OgloszeniaTabs />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}