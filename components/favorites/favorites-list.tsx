"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FavoriteButton } from "./favorite-button"
import { Eye, MapPin, Calendar, Fuel, Gauge, Palette, Clock, Users, Heart } from "lucide-react"
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

interface FavoritesListProps {
  favorites: FavoriteItem[]
  isLoading?: boolean
  onFavoriteRemove?: (listingId: string) => void
  onSelectionChange?: (selectedIds: string[]) => void
  language?: "de" | "fr" | "pl" | "en"
  showSelection?: boolean
  className?: string
}

export function FavoritesList({
  favorites,
  isLoading = false,
  onFavoriteRemove,
  onSelectionChange,
  language = "de",
  showSelection = false,
  className
}: FavoritesListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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

  const handleSelectionChange = (listingId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds)
    if (checked) {
      newSelectedIds.add(listingId)
    } else {
      newSelectedIds.delete(listingId)
    }
    setSelectedIds(newSelectedIds)
    onSelectionChange?.(Array.from(newSelectedIds))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(favorites.map(item => item.listing_id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    } else {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    }
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
      return { status: "ended", color: "destructive" as const, text: "Ended" }
    }
    
    const timeLeft = endTime.getTime() - now.getTime()
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    
    if (hoursLeft <= 1) {
      return { status: "ending_soon", color: "destructive" as const, text: "Ending Soon" }
    } else if (hoursLeft <= 24) {
      return { status: "ending_today", color: "secondary" as const, text: "Ending Today" }
    }
    
    return { status: "active", color: "default" as const, text: "Live Auction" }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <div className="w-32 h-24 bg-muted rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
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
    <div className={cn("space-y-4", className)}>
      {showSelection && favorites.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            checked={selectedIds.size === favorites.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            Select All ({selectedIds.size} of {favorites.length} selected)
          </span>
        </div>
      )}

      {favorites.map((item) => {
        const isRemoving = removingIds.has(item.listing_id)
        const isSelected = selectedIds.has(item.listing_id)
        const auctionStatus = getAuctionStatus(item)
        const href = item.is_auction 
          ? `/aukcje/${item.auction_id || item.listing_id}`
          : `/ogloszenia/${item.listing_id}`

        return (
          <Card 
            key={item.id} 
            className={cn(
              "transition-all duration-300 hover:shadow-md",
              isRemoving && "opacity-50 scale-95",
              isSelected && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Selection Checkbox */}
                {showSelection && (
                  <div className="flex items-start pt-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleSelectionChange(item.listing_id, checked as boolean)
                      }
                    />
                  </div>
                )}

                {/* Image */}
                <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Link href={href}>
                    <Image
                      src={item.images[0] || "/placeholder.svg?height=96&width=128"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  
                  {/* Auction Status Badge */}
                  {auctionStatus && (
                    <div className="absolute top-1 left-1">
                      <Badge variant={auctionStatus.color} className="text-xs">
                        {auctionStatus.text}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <Link href={href}>
                        <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.brand} {item.model} {item.year && `(${item.year})`}
                      </p>
                    </div>

                    {/* Favorite Button */}
                    <FavoriteButton
                      listingId={item.listing_id}
                      auctionId={item.auction_id}
                      initialIsFavorited={true}
                      size="sm"
                      variant="ghost"
                      onFavoriteChange={(isFavorited) => 
                        handleFavoriteChange(item.listing_id, isFavorited)
                      }
                    />
                  </div>

                  {/* Price/Bid Information */}
                  <div className="mb-3">
                    {item.is_auction ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(item.current_bid || item.price, item.currency)}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.bid_count || 0} bids
                          </span>
                          {item.auction_end_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(item.auction_end_time), { 
                                addSuffix: true, 
                                locale: getLocale() 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl font-bold">
                        {formatPrice(item.price, item.currency)}
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
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
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views} views
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(item.categories)}
                      </Badge>
                      {item.profiles.is_dealer && (
                        <Badge variant="secondary" className="text-xs">
                          Dealer
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Added {formatDistanceToNow(new Date(item.favorited_at), { 
                          addSuffix: true, 
                          locale: getLocale() 
                        })}
                      </span>
                      <span>{item.favorites_count} favorites</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}