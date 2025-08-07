"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getListings } from "@/lib/queries/listings"
import Link from "next/link"
import { useCountdown } from "@/hooks/use-countdown"
import AuctionCard from "./auction-card"

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
          <div key={i} className="bg-white dark:bg-card rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-100 dark:border-gray-700">
            <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
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
        <h2 className="text-2xl font-bold text-gray-900">Aktywne aukcje ({auctions.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction, index) => (
          <AuctionCard key={auction.id} auction={auction} index={index} />
        ))}
      </div>
    </div>
  )
}

