"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Eye, TrendingUp, Clock, Car, Gavel, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface FavoritesStatsData {
  totalFavorites: number
  totalListings: number
  totalAuctions: number
  totalViews: number
  averagePrice: number
  priceRange: {
    min: number
    max: number
  }
  topBrands: Array<{
    brand: string
    count: number
    percentage: number
  }>
  topCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  topLocations: Array<{
    location: string
    count: number
    percentage: number
  }>
  recentActivity: {
    addedThisWeek: number
    addedThisMonth: number
  }
  auctionStats?: {
    activeAuctions: number
    endingSoon: number
    averageBids: number
  }
}

interface FavoritesStatsProps {
  data: FavoritesStatsData
  currency?: string
  language?: "de" | "fr" | "pl" | "en"
  className?: string
}

export function FavoritesStats({
  data,
  currency = "CHF",
  language = "de",
  className
}: FavoritesStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === "de" ? "de-CH" : "en-CH", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getTexts = () => {
    switch (language) {
      case "de":
        return {
          title: "Favoriten Statistiken",
          totalFavorites: "Gesamt Favoriten",
          listings: "Anzeigen",
          auctions: "Auktionen",
          totalViews: "Gesamt Aufrufe",
          averagePrice: "Durchschnittspreis",
          priceRange: "Preisspanne",
          topBrands: "Top Marken",
          topCategories: "Top Kategorien",
          topLocations: "Top Standorte",
          recentActivity: "Letzte Aktivität",
          thisWeek: "Diese Woche",
          thisMonth: "Diesen Monat",
          auctionStats: "Auktions-Statistiken",
          activeAuctions: "Aktive Auktionen",
          endingSoon: "Enden bald",
          averageBids: "Ø Gebote"
        }
      case "fr":
        return {
          title: "Statistiques des Favoris",
          totalFavorites: "Total Favoris",
          listings: "Annonces",
          auctions: "Enchères",
          totalViews: "Vues Totales",
          averagePrice: "Prix Moyen",
          priceRange: "Gamme de Prix",
          topBrands: "Top Marques",
          topCategories: "Top Catégories",
          topLocations: "Top Emplacements",
          recentActivity: "Activité Récente",
          thisWeek: "Cette Semaine",
          thisMonth: "Ce Mois",
          auctionStats: "Statistiques d'Enchères",
          activeAuctions: "Enchères Actives",
          endingSoon: "Se Terminent Bientôt",
          averageBids: "Ø Offres"
        }
      case "pl":
        return {
          title: "Statystyki Ulubionych",
          totalFavorites: "Łącznie Ulubionych",
          listings: "Ogłoszenia",
          auctions: "Aukcje",
          totalViews: "Łączne Wyświetlenia",
          averagePrice: "Średnia Cena",
          priceRange: "Zakres Cen",
          topBrands: "Top Marki",
          topCategories: "Top Kategorie",
          topLocations: "Top Lokalizacje",
          recentActivity: "Ostatnia Aktywność",
          thisWeek: "Ten Tydzień",
          thisMonth: "Ten Miesiąc",
          auctionStats: "Statystyki Aukcji",
          activeAuctions: "Aktywne Aukcje",
          endingSoon: "Kończą się Wkrótce",
          averageBids: "Ø Oferty"
        }
      default:
        return {
          title: "Favorites Statistics",
          totalFavorites: "Total Favorites",
          listings: "Listings",
          auctions: "Auctions",
          totalViews: "Total Views",
          averagePrice: "Average Price",
          priceRange: "Price Range",
          topBrands: "Top Brands",
          topCategories: "Top Categories",
          topLocations: "Top Locations",
          recentActivity: "Recent Activity",
          thisWeek: "This Week",
          thisMonth: "This Month",
          auctionStats: "Auction Statistics",
          activeAuctions: "Active Auctions",
          endingSoon: "Ending Soon",
          averageBids: "Avg Bids"
        }
    }
  }

  const texts = getTexts()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{texts.totalFavorites}</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFavorites}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{data.totalListings} {texts.listings}</span>
              <span>•</span>
              <span>{data.totalAuctions} {texts.auctions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{texts.totalViews}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(data.totalViews / data.totalFavorites)} avg per favorite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{texts.averagePrice}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.averagePrice)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPrice(data.priceRange.min)} - {formatPrice(data.priceRange.max)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{texts.recentActivity}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.recentActivity.addedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              {data.recentActivity.addedThisMonth} {texts.thisMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auction Statistics */}
      {data.auctionStats && data.totalAuctions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              {texts.auctionStats}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.auctionStats.activeAuctions}
                </div>
                <p className="text-sm text-muted-foreground">{texts.activeAuctions}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.auctionStats.endingSoon}
                </div>
                <p className="text-sm text-muted-foreground">{texts.endingSoon}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.auctionStats.averageBids}
                </div>
                <p className="text-sm text-muted-foreground">{texts.averageBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Categories, Brands, and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Brands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {texts.topBrands}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topBrands.slice(0, 5).map((brand, index) => (
              <div key={brand.brand} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{brand.brand}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {brand.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {brand.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={brand.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {texts.topCategories}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {texts.topLocations}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topLocations.slice(0, 5).map((location, index) => (
              <div key={location.location} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.location}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {location.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {location.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={location.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}