import { Metadata } from "next"
import { WatchlistDashboard } from "@/components/favorites"

export const metadata: Metadata = {
  title: "My Watchlist | MotoAuto.ch",
  description: "Manage your favorite listings and auctions on MotoAuto.ch",
}

export default function WatchlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WatchlistDashboard />
    </div>
  )
}