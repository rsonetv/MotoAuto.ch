'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Rows } from 'lucide-react'
import { useCountdown } from '@/hooks/use-countdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useComparisonStore, Vehicle } from '@/hooks/use-comparison-store'
import { Auction } from '@/types/auctions'

export default function AuctionCard({ auction, index }: { auction: any; index: number }) {
  const timeLeft = useCountdown(auction.auction_end_time || '')
  const { vehicles, addToCompare, removeFromCompare } = useComparisonStore()

  const isComparing = vehicles.some((v) => v.id === auction.id)

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const vehicle: Vehicle = {
      id: auction.id,
      make: auction.vehicle.make,
      model: auction.vehicle.model,
      year: auction.vehicle.year,
      price: auction.current_bid || auction.starting_price,
      mileage: auction.vehicle.mileage,
      engine_size: auction.vehicle.engine_size,
      power: auction.vehicle.power,
      image_url: auction.images?.[0]?.url || '/placeholder.svg',
    }

    if (isComparing) {
      removeFromCompare(auction.id)
    } else {
      addToCompare(vehicle)
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-transform duration-300 ease-in-out hover:-translate-y-2 group"
      data-wow-delay={`${index * 0.1}s`}
    >
      <Link href={`/aukcje/${auction.id}`} className="block">
        <div className="relative h-60 w-full">
          <Image
            src={auction.images?.[0]?.url || '/placeholder.svg'}
            alt={auction.title || 'Auction image'}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 bg-background/80 text-foreground backdrop-blur-sm"
          >
            {timeLeft}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold leading-tight tracking-tight">
            {auction.title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: 'PLN',
              }).format(auction.current_bid || auction.starting_price)}
            </span>
            {auction.buy_now_price && (
              <span className="text-sm text-muted-foreground">
                or {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                }).format(auction.buy_now_price)} buy now
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {auction.bids_count || 0} bids
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Button
          size="icon"
          variant={isComparing ? 'default' : 'outline'}
          onClick={handleCompareClick}
          aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Rows className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Add to watchlist">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}