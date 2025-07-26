"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getListings } from "@/lib/queries/listings"
import Link from "next/link"

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = React.useState("")

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeLeft("Zakończona")
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      setTimeLeft(`${days}d ${hours}h`)
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return timeLeft
}

export function AuctionGrid() {
  const {
    data: auctions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auctions"],
    queryFn: () => getListings({ isAuction: true, limit: 12 }),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Wystąpił błąd podczas ładowania aukcji.</p>
      </div>
    )
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Brak aktywnych aukcji.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Aktywne aukcje ({auctions.length})</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Link href="/aukcje/dodaj">Dodaj aukcję</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction, index) => (
          <AuctionCard key={auction.id} auction={auction} index={index} />
        ))}
      </div>
    </div>
  )
}

function AuctionCard({ auction, index }: { auction: any; index: number }) {
  const timeLeft = useCountdown(auction.auction_end_time || "")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100"
    >
      <div className="relative overflow-hidden">
        <img
          src={auction.images?.[0] || "/placeholder.svg?height=300&width=400"}
          alt={auction.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-red-600 text-white flex items-center gap-1 font-bold px-3 py-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Live
        </Badge>
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-sm">
          <Eye className="w-4 h-4" />
          <span>{auction.views}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <h3 className="font-bold text-xl text-gray-900 group-hover:text-red-600 transition-colors duration-300">{auction.title}</h3>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Aktualna oferta</div>
          <div className="flex items-center text-red-600 text-sm bg-red-50 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 mr-2" />
            <span>{timeLeft}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-2xl font-bold text-gray-900">
            CHF {(auction.current_bid || auction.price).toLocaleString()}
          </div>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href={`/aukcje/${auction.id}`}>Licytuj teraz</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
