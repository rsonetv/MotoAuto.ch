"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleList, type Listing } from "@/components/ogloszenia/vehicle-list"
import { UnifiedVehicleFilters } from "@/components/ogloszenia/unified-vehicle-filters";
import { CategoryTabs } from "@/components/ogloszenia/category-tabs"
import { SearchBar } from "@/components/ogloszenia/search-bar"
import { SearchBarEnhanced } from "@/components/ogloszenia/search-bar-enhanced"
import { SortControls } from "@/components/ogloszenia/sort-controls"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Bike, Plus, Filter, Search, MapPin, Eye, Heart } from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { Database } from "@/lib/database.types"

// Define ListingItem and Category types based on Database type

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

function OgloszeniaTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const category = searchParams?.get('category') || 'all'
  const supabase = createClientComponentClient()
  
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    return {
      search: params.get('search') || '',
      sortBy: params.get('sortBy') || 'newest',
      brand: params.get('brand') || undefined,
      priceMin: params.has('priceMin') ? Number(params.get('priceMin')) : undefined,
      priceMax: params.has('priceMax') ? Number(params.get('priceMax')) : undefined,
      yearMin: params.has('yearMin') ? Number(params.get('yearMin')) : undefined,
      yearMax: params.has('yearMax') ? Number(params.get('yearMax')) : undefined,
      mileageMax: params.has('mileageMax') ? Number(params.get('mileageMax')) : undefined,
      fuelType: params.get('fuelType') || undefined,
      transmission: params.get('transmission') || undefined,
      bodyType: params.get('bodyType') || undefined,
      condition: params.get('condition') || undefined,
      location: params.get('location') || undefined,
      radius: params.has('radius') ? Number(params.get('radius')) : undefined,
    }
  })
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categoryStats, setCategoryStats] = useState({
    auto: { count: 0, avgPrice: 0 },
    moto: { count: 0, avgPrice: 0 },
  })

  // Load categories
  useEffect(() => {
    loadCategories().then(loadedCategories => {
      if (loadedCategories) {
        loadCategoryStats(loadedCategories)
      }
    })
  }, [])

  // Load listings when category or filters change
  useEffect(() => {
    if (category) {
      loadListings()
    }
  }, [category, filters, currentPage])

  // Sync filters state to URL search params
  useEffect(() => {
    const params = new URLSearchParams()
    if (category && category !== 'all') {
      params.set('category', category)
    }
    Object.entries(filters).forEach(([key, value]) => {
      // Add filter to params if it has a meaningful value
      if (value !== undefined && value !== null && value !== '' && !(key === 'sortBy' && value === 'newest')) {
        params.set(key, String(value))
      }
    })
    // Use router.replace to update URL without adding to history
    router.replace(`/ogloszenia?${params.toString()}`, { scroll: false })
  }, [filters, category, router])

  const loadCategories = async (): Promise<Category[] | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        toast.error(`Błąd podczas ładowania kategorii: ${error.message}`)
        return null
      }

      if (!data) {
        setCategories([])
        return null
      }
      
      setCategories(data)
      return data
    } catch (error) {
      toast.error('Błąd sieci podczas ładowania kategorii')
      return null
    }
  }

  const loadCategoryStats = async (loadedCategories: Category[]) => {
    try {
      const statsPromises = loadedCategories
        .filter(c => c.slug === 'auto' || c.slug === 'moto')
        .map(async (cat) => {
          const { count, error } = await supabase
            .from('listings')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'active')
            .eq('sale_type', 'listing')

          // Note: Calculating average price would require another query or a database function.
          // This is a simplification for now. A dedicated backend endpoint would be better.
          if (error) {
            console.error(`Error fetching stats for ${cat.name}:`, error)
            return { slug: cat.slug, count: 0, avgPrice: 0 }
          }
          return { slug: cat.slug, count: count || 0, avgPrice: 0 } // avgPrice is placeholder
        })

      const statsResults = await Promise.all(statsPromises)
      
      const newStats = { auto: { count: 0, avgPrice: 0 }, moto: { count: 0, avgPrice: 0 } };
      statsResults.forEach(stat => {
        if (stat.slug === 'auto') newStats.auto = { count: stat.count, avgPrice: stat.avgPrice };
        if (stat.slug === 'moto') newStats.moto = { count: stat.count, avgPrice: stat.avgPrice };
      });

      setCategoryStats(newStats)
    } catch (error) {
      console.error('Error loading category stats:', error)
    }
  }

  const loadListings = async () => {
    setLoading(true)
    try {
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
        .eq('sale_type', 'listing')

      // Apply category filter
      if (category && category !== 'all') {
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

      if (filters.bodyType) {
        query = query.eq('body_type', filters.bodyType)
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      // TODO: Implement radius search. This requires a PostGIS function on Supabase.

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

      // Pagination
      const itemsPerPage = 20
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error (listings):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast.error(`Błąd podczas ładowania ogłoszeń: ${error.message}`)
        setListings([])
        setTotalCount(0)
        return
      }

      if (!Array.isArray(data)) {
        console.error('Invalid data format received:', typeof data)
        toast.error('Otrzymano nieprawidłowy format danych z bazy.')
        setListings([])
        setTotalCount(0)
        return
      }

      console.log('Listings loaded successfully:', data.length)
      setListings(data)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Network error (listings):', JSON.stringify(error))
      toast.error('Błąd sieci podczas ładowania ogłoszeń')
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

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const handleSearch = (searchTerm: string) => {
    handleFiltersChange({ search: searchTerm })
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'newest',
      brand: undefined,
      priceMin: undefined,
      priceMax: undefined,
      yearMin: undefined,
      yearMax: undefined,
      mileageMax: undefined,
      fuelType: undefined,
      transmission: undefined,
      bodyType: undefined,
      condition: undefined,
      location: undefined,
      radius: undefined,
    })
    setCurrentPage(1)
  }

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'auto':
        return <Car className="h-4 w-4" />
      case 'moto':
        return <Bike className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {category === 'auto' ? 'Samochody' : 
                 category === 'moto' ? 'Motocykle' : 
                 'Wszystkie ogłoszenia'}
              </h1>
              <p className="text-muted-foreground">
                {category === 'all' 
                  ? `Znajdź swój wymarzony pojazd wśród ${totalCount.toLocaleString()} ofert`
                  : `${(category === 'auto' ? categoryStats.auto.count : categoryStats.moto.count).toLocaleString()} dostępnych pojazdów`
                }
              </p>
            </div>
            <Button onClick={() => router.push('/ogloszenia/dodaj')}>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj ogłoszenie
            </Button>
          </div>

          {/* Category Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {['all', 'auto', 'moto'].map(catSlug => {
              const isActive = category === catSlug
              const stats = catSlug === 'all'
                ? { count: totalCount, avgPrice: 0 }
                : categoryStats[catSlug as 'auto' | 'moto']
              
              const name = catSlug === 'all' ? 'Wszystkie' : catSlug === 'auto' ? 'Samochody' : 'Motocykle'

              return (
                <Card
                  key={catSlug}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCategoryChange(catSlug)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(catSlug)}
                        <span className="font-medium">{name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stats.count.toLocaleString()}</div>
                        {stats.avgPrice > 0 && (
                          <div className="text-xs text-muted-foreground">
                            śr. {stats.avgPrice.toLocaleString()} CHF
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBarEnhanced 
                value={filters.search}
                onChange={handleSearch}
                placeholder="Szukaj po marce, modelu, tytule..."
                recentSearches={["BMW", "Toyota Corolla", "Audi A4", "SUV"]}
              />
            </div>
            <div className="flex gap-2">
              <SortControls
                value={filters.sortBy || 'newest'}
                onChange={(sortBy) => handleFiltersChange({ sortBy: sortBy as 'newest' | 'price_asc' | 'price_desc' | 'mileage' | 'year' })}
              />
            </div>
          </div>          {/* Active Filters Display */}
          {(filters.brand || filters.priceMin || filters.priceMax || filters.location || filters.fuelType || filters.transmission || filters.bodyType || filters.condition) && (
            <div className="flex flex-wrap gap-2">
              {filters.brand && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ brand: undefined })}>
                  Marka: {filters.brand} ×
                </Badge>
              )}
              {filters.priceMin && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ priceMin: undefined })}>
                  Od: {filters.priceMin.toLocaleString()} CHF ×
                </Badge>
              )}
              {filters.priceMax && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ priceMax: undefined })}>
                  Do: {filters.priceMax.toLocaleString()} CHF ×
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ location: undefined })}>
                  <MapPin className="mr-1 h-3 w-3" />
                  {filters.location} ×
                </Badge>
              )}
              {filters.fuelType && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ fuelType: undefined })}>
                  Paliwo: {filters.fuelType} ×
                </Badge>
              )}
              {filters.transmission && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ transmission: undefined })}>
                  Skrzynia: {filters.transmission} ×
                </Badge>
              )}
              {filters.bodyType && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ bodyType: undefined })}>
                  Nadwozie: {filters.bodyType} ×
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFiltersChange({ condition: undefined })}>
                  Stan: {filters.condition} ×
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Unified Filters Component */}
          <div className="lg:col-span-1">
            <UnifiedVehicleFilters
              filters={filters}
              onChange={handleFiltersChange}
              category={category}
              categories={categories}
            />
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">            
            <VehicleList
              listings={listings}
              loading={loading}
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              category={category}
              onClearFilters={handleClearFilters}
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
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <OgloszeniaTabs />
      </Suspense>
      <Footer />
    </>
  )
}