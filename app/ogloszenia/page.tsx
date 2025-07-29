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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Bike, Plus, Filter, Search, MapPin, Eye, Heart } from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { Database } from "@/lib/database.types"

// Define Listing and Category types based on Database type
type Listing = {
  id: string;
  title: string;
  price: number;
  created_at: string;
  updated_at: string;
  images?: string[];
  is_promoted?: boolean;
  status: string;
  category_id?: string;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  condition?: string;
  location?: string;
  sale_type: string;
  view_count?: number;
  profiles?: {
    id: string;
    full_name?: string;
    dealer_name?: string;
    is_dealer?: boolean;
    location?: string;
    phone?: string;
    email?: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

interface VehicleFilters {
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
  const category = searchParams?.get('category') || 'all'
  const supabase = createClientComponentClient()
  
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<VehicleFilters>({
    search: searchParams?.get('search') || '',
    sortBy: 'newest'
  })
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Load listings when category or filters change
  useEffect(() => {
    if (category) {
      loadListings()
    }
  }, [category, filters, currentPage])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Błąd podczas ładowania kategorii')
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

      // Pagination
      const itemsPerPage = 20
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setListings(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading listings:', error)
      toast.error('Błąd podczas ładowania ogłoszeń')
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

  const handleFiltersChange = (newFilters: Partial<VehicleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const handleSearch = (searchTerm: string) => {
    handleFiltersChange({ search: searchTerm })
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

  const getCategoryStats = (categorySlug: string) => {
    // This would typically come from the API
    const stats = {
      auto: { count: 1247, avgPrice: 35000 },
      moto: { count: 389, avgPrice: 15000 },
      all: { count: totalCount, avgPrice: 25000 }
    }
    return stats[categorySlug as keyof typeof stats] || stats.all
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
                  : `${getCategoryStats(category).count.toLocaleString()} dostępnych pojazdów`
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
            {['all', 'auto', 'moto'].map(cat => {
              const stats = getCategoryStats(cat)
              const isActive = category === cat
              return (
                <Card 
                  key={cat}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat)}
                        <span className="font-medium">
                          {cat === 'all' ? 'Wszystkie' : 
                           cat === 'auto' ? 'Samochody' : 'Motocykle'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stats.count.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          śr. {stats.avgPrice.toLocaleString()} CHF
                        </div>
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
              <SearchBar 
                value={filters.search}
                onChange={handleSearch}
                placeholder="Szukaj po marce, modelu, tytule..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtry
              </Button>
              <SortControls
                value={filters.sortBy}
                onChange={(sortBy) => handleFiltersChange({ sortBy })}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.brand || filters.priceMin || filters.priceMax || filters.location) && (
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
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:block ${filtersOpen ? 'block' : 'hidden'}`}>
            <VehicleFilters
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