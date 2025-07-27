"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FavoriteButton } from "./favorite-button"
import { Eye, MapPin, Calendar, Fuel, Gauge, Palette, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de, fr, pl, enUS } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

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

interface FavoritesGridProps {
  favorites: FavoriteItem[]
  isLoading?: boolean
  onFavoriteRemove?: (listingId: string) => void
  viewMode?: "grid" | "list"
  language?: "de" | "fr" | "pl" | "en"
  className?: string
}

export function FavoritesGrid({
  favorites,
  isLoading = false,
  onFavoriteRemove,
  viewMode = "grid",
  language = "de",
  className
}: FavoritesGridProps) {
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const getLocale = () => {
    switch (language) {
      case "de": return de
      case "fr": return fr
      case "pl": return pl
      default: return enUS
    }
  }

  const getCategoryName = (category: FavoriteItem['categories']) => {
    switch (language) {
      case "de": return category.name_de
      case "fr": return category.name_fr
      case "pl": return category.name_pl
      default: return category.name_en
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === "de" ? "de-CH" : "en-CH", {
      style: "currency",
      currency: currency || "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleFavoriteChange = (listingId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      setRemovingIds(prev => new Set(prev).add(listingId))
      setTimeout(() => {
        onFavoriteRemove?.(listingId)
        setRemovingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(listingId)
          return newSet
        })
      }, 300)
    }
  }

  const getAuctionStatus = (item: FavoriteItem) => {
    if (!item.is_auction || !item.auction_end_time) return null
    
    const endTime = new Date(item.auction_end_time)
    const now = new Date()
    
    if (endTime <= now) {
      return { status: "ended", color: "destructive" as const }
    }
    
    const timeLeft = endTime.getTime() - now.getTime()
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    
    if (hoursLeft <= 1) {
      return { status: "ending_soon", color: "destructive" as const }
    } else if (hoursLeft <= 24) {
      return { status: "ending_today", color: "secondary" as const }
    }
    
    return { status: "active", color: "default" as const }
  }

  if (isLoading) {
    return (
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4",
        className
      )}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Heart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
        <p className="text-muted-foreground mb-4">
          Start adding vehicles to your favorites to see them here
        </p>
        <Button asChild>
          <Link href="/ogloszenia">Browse Listings</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4",
      className
    )}>
      {favorites.map((item) => {
        const isRemoving = removingIds.has(item.listing_id)
        const auctionStatus = getAuctionStatus(item)
        const href = item.is_auction 
          ? `/aukcje/${item.auction_id || item.listing_id}`
          : `/ogloszenia/${item.listing_id}`

        return (
          <Card 
            key={item.id} 
            className={cn(
              "overflow-hidden transition-all duration-300 hover:shadow-lg",
              isRemoving && "opacity-50 scale-95",
              viewMode === "list" && "flex flex-row"
            )}
          >
            <div className={cn(
              "relative",
              viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-[4/3]"
            )}>
              <Link href={href}>
                <Image
                  src={item.images[0] || "/placeholder.svg?height=300&width=400"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
              
              {/* Favorite Button */}
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  listingId={item.listing_id}
                  auctionId={item.auction_id}
                  initialIsFavorited={true}
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  onFavoriteChange={(isFavorited) => 
                    handleFavoriteChange(item.listing_id, isFavorited)
                  }
                />
              </div>

              {/* Auction Status Badge */}
              {auctionStatus && (
                <div className="absolute top-2 left-2">
                  <Badge variant={auctionStatus.color} className="text-xs">
                    {auctionStatus.status === "ended" && "Ended"}
                    {auctionStatus.status === "ending_soon" && "Ending Soon"}
                    {auctionStatus.status === "ending_today" && "Ending Today"}
                    {auctionStatus.status === "active" && "Live Auction"}
                  </Badge>
                </div>
              )}

              {/* Dealer Badge */}
              {item.profiles.is_dealer && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    Dealer
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={href}>
                      <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.brand} {item.model} {item.year && `(${item.year})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(item.categories)}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Price/Bid Information */}
                <div className="mb-3">
                  {item.is_auction ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(item.current_bid || item.price, item.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.bid_count || 0} bids
                        </span>
                      </div>
                      {item.auction_end_time && (
                        <p className="text-xs text-muted-foreground">
                          Ends {formatDistanceToNow(new Date(item.auction_end_time), { 
                            addSuffix: true, 
                            locale: getLocale() 
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-lg font-bold">
                      {formatPrice(item.price, item.currency)}
                    </span>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  {item.mileage && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      {item.mileage.toLocaleString()} km
                    </div>
                  )}
                  {item.fuel_type && (
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      {item.fuel_type}
                    </div>
                  )}
                  {item.color && (
                    <div className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {item.color}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views} views
                  </div>
                </div>

                {/* Favorited Date */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Added {formatDistanceToNow(new Date(item.favorited_at), { 
                      addSuffix: true, 
                      locale: getLocale() 
                    })}
                  </span>
                  <span>{item.favorites_count} favorites</span>
                </div>
              </CardContent>
            </div>
          </Card>
        )
      })}
    </div>
  )
}