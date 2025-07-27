"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { FavoritesGrid } from "./favorites-grid"
import { FavoritesList } from "./favorites-list"
import { FavoritesFilters } from "./favorites-filters"
import { FavoritesStats } from "./favorites-stats"
import { 
  Heart, 
  Grid3X3, 
  List, 
  Download, 
  Share2, 
  Trash2, 
  Settings,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from "lucide-react"
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

interface FavoriteItem {
  id: string
  listing_id: string
  auction_id?: string
  title: string
  brand: string
  model: string
  year?: number
  price: number
  currency: string
  current_bid?: number
  bid_count?: number
  location: string
  canton?: string
  images: string[]
  is_auction: boolean
  auction_end_time?: string
  status: string
  views: number
  favorites_count: number
  mileage?: number
  fuel_type?: string
  transmission?: string
  color?: string
  created_at: string
  favorited_at: string
  profiles: {
    full_name?: string
    avatar_url?: string
    is_dealer: boolean
    dealer_name?: string
  }
  categories: {
    name_en: string
    name_de: string
    name_fr: string
    name_pl: string
    slug: string
  }
}

interface WatchlistDashboardProps {
  language?: "de" | "fr" | "pl" | "en"
  className?: string
}

export function WatchlistDashboard({
  language = "de",
  className
}: WatchlistDashboardProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "favorited_at",
    sortOrder: "desc"
  })

  const { toast } = useToast()

  // Load favorites on mount
  useEffect(() => {
    loadFavorites()
  }, [])

  // Apply filters when favorites or filters change
  useEffect(() => {
    applyFilters()
  }, [favorites, filters])

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      // This would be replaced with actual API call
      const response = await fetch('/api/user/favorites', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      } else {
        throw new Error('Failed to load favorites')
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast({
        title: "Error",
        description: "Failed to load your favorites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...favorites]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.model.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.categories.slug === filters.category)
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(item => item.brand === filters.brand)
    }

    // Apply price range filter
    if (filters.priceMin) {
      filtered = filtered.filter(item => 
        (item.current_bid || item.price) >= filters.priceMin!
      )
    }
    if (filters.priceMax) {
      filtered = filtered.filter(item => 
        (item.current_bid || item.price) <= filters.priceMax!
      )
    }

    // Apply year range filter
    if (filters.yearMin && filters.yearMax) {
      filtered = filtered.filter(item => 
        item.year && item.year >= filters.yearMin! && item.year <= filters.yearMax!
      )
    }

    // Apply mileage range filter
    if (filters.mileageMin && filters.mileageMax) {
      filtered = filtered.filter(item => 
        item.mileage && item.mileage >= filters.mileageMin! && item.mileage <= filters.mileageMax!
      )
    }

    // Apply fuel type filter
    if (filters.fuelType) {
      filtered = filtered.filter(item => item.fuel_type === filters.fuelType)
    }

    // Apply transmission filter
    if (filters.transmission) {
      filtered = filtered.filter(item => item.transmission === filters.transmission)
    }

    // Apply location filters
    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location)
    }
    if (filters.canton) {
      filtered = filtered.filter(item => item.canton === filters.canton)
    }

    // Apply auction filter
    if (filters.isAuction) {
      filtered = filtered.filter(item => item.is_auction)
    }

    // Apply auction status filter
    if (filters.auctionStatus && filters.isAuction) {
      filtered = filtered.filter(item => {
        if (!item.is_auction || !item.auction_end_time) return false
        
        const endTime = new Date(item.auction_end_time)
        const now = new Date()
        
        switch (filters.auctionStatus) {
          case "active":
            return endTime > now
          case "ending_soon":
            const hoursLeft = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60)
            return hoursLeft > 0 && hoursLeft <= 24
          case "ended":
            return endTime <= now
          default:
            return true
        }
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (filters.sortBy) {
          case "favorited_at":
            aValue = new Date(a.favorited_at).getTime()
            bValue = new Date(b.favorited_at).getTime()
            break
          case "created_at":
            aValue = new Date(a.created_at).getTime()
            bValue = new Date(b.created_at).getTime()
            break
          case "price":
            aValue = a.current_bid || a.price
            bValue = b.current_bid || b.price
            break
          case "year":
            aValue = a.year || 0
            bValue = b.year || 0
            break
          case "mileage":
            aValue = a.mileage || 0
            bValue = b.mileage || 0
            break
          case "views":
            aValue = a.views
            bValue = b.views
            break
          case "favorites_count":
            aValue = a.favorites_count
            bValue = b.favorites_count
            break
          case "auction_end_time":
            aValue = a.auction_end_time ? new Date(a.auction_end_time).getTime() : 0
            bValue = b.auction_end_time ? new Date(b.auction_end_time).getTime() : 0
            break
          default:
            return 0
        }

        if (filters.sortOrder === "asc") {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
    }

    setFilteredFavorites(filtered)
  }

  const handleFavoriteRemove = (listingId: string) => {
    setFavorites(prev => prev.filter(item => item.listing_id !== listingId))
    setSelectedIds(prev => prev.filter(id => id !== listingId))
  }

  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return

    try {
      // This would be replaced with actual API calls
      const promises = selectedIds.map(listingId => 
        fetch(`/api/listings/${listingId}/favorite`, {
          method: 'DELETE',
          credentials: 'include'
        })
      )

      await Promise.all(promises)
      
      setFavorites(prev => prev.filter(item => !selectedIds.includes(item.listing_id)))
      setSelectedIds([])
      
      toast({
        title: "Success",
        description: `Removed ${selectedIds.length} items from favorites`,
      })
    } catch (error) {
      console.error('Error removing favorites:', error)
      toast({
        title: "Error",
        description: "Failed to remove some favorites",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Title", "Brand", "Model", "Year", "Price", "Location", "Added Date"].join(","),
      ...filteredFavorites.map(item => [
        `"${item.title}"`,
        item.brand,
        item.model,
        item.year || "",
        item.current_bid || item.price,
        item.location,
        new Date(item.favorited_at).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "favorites.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalFavorites = favorites.length
    const totalListings = favorites.filter(item => !item.is_auction).length
    const totalAuctions = favorites.filter(item => item.is_auction).length
    const totalViews = favorites.reduce((sum, item) => sum + item.views, 0)
    
    const prices = favorites.map(item => item.current_bid || item.price)
    const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }

    // Calculate top brands, categories, locations
    const brandCounts = favorites.reduce((acc, item) => {
      acc[item.brand] = (acc[item.brand] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topBrands = Object.entries(brandCounts)
      .map(([brand, count]) => ({
        brand,
        count,
        percentage: Math.round((count / totalFavorites) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    const categoryCounts = favorites.reduce((acc, item) => {
      const categoryName = item.categories.name_en // Use appropriate language
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalFavorites) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    const locationCounts = favorites.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / totalFavorites) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    // Recent activity
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const addedThisWeek = favorites.filter(item => 
      new Date(item.favorited_at) >= oneWeekAgo
    ).length

    const addedThisMonth = favorites.filter(item => 
      new Date(item.favorited_at) >= oneMonthAgo
    ).length

    // Auction stats
    const auctions = favorites.filter(item => item.is_auction)
    const activeAuctions = auctions.filter(item => 
      item.auction_end_time && new Date(item.auction_end_time) > now
    ).length

    const endingSoon = auctions.filter(item => {
      if (!item.auction_end_time) return false
      const endTime = new Date(item.auction_end_time)
      const hoursLeft = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursLeft > 0 && hoursLeft <= 24
    }).length

    const averageBids = auctions.length > 0 
      ? Math.round(auctions.reduce((sum, item) => sum + (item.bid_count || 0), 0) / auctions.length)
      : 0

    return {
      totalFavorites,
      totalListings,
      totalAuctions,
      totalViews,
      averagePrice,
      priceRange,
      topBrands,
      topCategories,
      topLocations,
      recentActivity: {
        addedThisWeek,
        addedThisMonth
      },
      auctionStats: totalAuctions > 0 ? {
        activeAuctions,
        endingSoon,
        averageBids
      } : undefined
    }
  }, [favorites])

  const getTabCounts = () => {
    const all = filteredFavorites.length
    const listings = filteredFavorites.filter(item => !item.is_auction).length
    const auctions = filteredFavorites.filter(item => item.is_auction).length
    return { all, listings, auctions }
  }

  const tabCounts = getTabCounts()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            My Watchlist
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your favorite listings and auctions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadFavorites}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkRemove}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove ({selectedIds.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredFavorites.length === 0}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <FavoritesStats data={stats} language={language} />

      <Separator />

      {/* Filters */}
      {showFilters && (
        <FavoritesFilters
          filters={filters}
          onFiltersChange={setFilters}
          onToggleCollapse={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="text-xs">
                {tabCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              Listings
              <Badge variant="secondary" className="text-xs">
                {tabCounts.listings}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="auctions" className="flex items-center gap-2">
              Auctions
              <Badge variant="secondary" className="text-xs">
                {tabCounts.auctions}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          {viewMode === "grid" ? (
            <FavoritesGrid
              favorites={filteredFavorites}
              isLoading={isLoading}
              onFavoriteRemove={handleFavoriteRemove}
              language={language}
            />
          ) : (
            <FavoritesList
              favorites={filteredFavorites}
              isLoading={isLoading}
              onFavoriteRemove={handleFavoriteRemove}
              onSelectionChange={setSelectedIds}
              showSelection={true}
              language={language}
            />
          )}
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          {viewMode === "grid" ? (
            <FavoritesGrid
              favorites={filteredFavorites.filter(item => !item.is_auction)}
              isLoading={isLoading}
              onFavoriteRemove={handleFavoriteRemove}
              language={language}
            />
          ) : (
            <FavoritesList
              favorites={filteredFavorites.filter(item => !item.is_auction)}
              isLoading={isLoading}
              onFavoriteRemove={handleFavoriteRemove}
              onSelectionChange={setSelectedIds}
              showSelection={true}
              language={language}
            />
          )}
        </TabsContent>

        <TabsContent value="auctions" className="mt-6">
          {viewMode === "grid" ? (
            <FavoritesGrid
              favorites={filteredFavorites.filter(item => item.is_auction)}
              isLoading={isLoading}
              onFavoriteRemove={handleFavoriteRemove}
              language={language}
            />
          ) : (
            <FavoritesList
              favorites={filteredFavorites.filter(item => item.is_auction)}
              isLoading={isLoading}
              onFavoriteRemove={handleFavoriteRemove}
              onSelectionChange={setSelectedIds}
              showSelection={true}
              language={language}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}