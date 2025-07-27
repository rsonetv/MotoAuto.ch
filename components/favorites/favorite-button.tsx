"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface FavoriteButtonProps {
  listingId: string
  auctionId?: string
  initialIsFavorited?: boolean
  initialFavoritesCount?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
  showCount?: boolean
  className?: string
  onFavoriteChange?: (isFavorited: boolean, count: number) => void
}

export function FavoriteButton({
  listingId,
  auctionId,
  initialIsFavorited = false,
  initialFavoritesCount = 0,
  size = "md",
  variant = "ghost",
  showCount = false,
  className,
  onFavoriteChange
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check favorite status on mount
  useEffect(() => {
    checkFavoriteStatus()
  }, [listingId, auctionId])

  const checkFavoriteStatus = async () => {
    try {
      const endpoint = auctionId 
        ? `/api/auctions/${auctionId}/watch`
        : `/api/listings/${listingId}/favorite`
      
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const favorited = auctionId ? data.is_watched : data.is_favorited
        setIsFavorited(favorited)
        if (data.total_watched !== undefined) {
          setFavoritesCount(data.total_watched)
        }
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const endpoint = auctionId 
        ? `/api/auctions/${auctionId}/watch`
        : `/api/listings/${listingId}/favorite`
      
      const action = isFavorited ? 'remove' : 'add'
      const method = isFavorited && !auctionId ? 'DELETE' : 'POST'
      
      const body = auctionId || !isFavorited ? { action } : undefined

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...(body && { body: JSON.stringify(body) })
      })

      if (response.ok) {
        const data = await response.json()
        const newIsFavorited = !isFavorited
        const newCount = auctionId 
          ? (data.total_watched || favoritesCount)
          : (newIsFavorited ? favoritesCount + 1 : Math.max(0, favoritesCount - 1))

        setIsFavorited(newIsFavorited)
        setFavoritesCount(newCount)
        onFavoriteChange?.(newIsFavorited, newCount)

        toast({
          title: newIsFavorited ? "Added to favorites" : "Removed from favorites",
          description: auctionId 
            ? (newIsFavorited ? "Auction added to your watchlist" : "Auction removed from your watchlist")
            : (newIsFavorited ? "Listing added to your favorites" : "Listing removed from your favorites"),
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update favorite status')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorite status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg"
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size="icon"
        className={cn(
          sizeClasses[size],
          "transition-all duration-200 hover:scale-105",
          isFavorited && "text-red-500 hover:text-red-600",
          !isFavorited && "text-gray-400 hover:text-red-500",
          className
        )}
        onClick={toggleFavorite}
        disabled={isLoading}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={iconSizes[size]}
          className={cn(
            "transition-all duration-200",
            isFavorited && "fill-current",
            isLoading && "animate-pulse"
          )}
        />
      </Button>
      
      {showCount && favoritesCount > 0 && (
        <span className="text-sm text-muted-foreground font-medium">
          {favoritesCount}
        </span>
      )}
    </div>
  )
}