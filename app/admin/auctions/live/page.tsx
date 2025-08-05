import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Auction } from "@/lib/schemas/auction"
import { LiveAuctionCard } from "@/components/admin/auctions/live-auction-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getLiveAuctions(): Promise<Auction[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from("auctions")
    .select("*")
    .eq("status", "live")

  if (error) {
    console.error("Error fetching live auctions:", error)
    return []
  }
  return data as Auction[]
}

export default async function LiveAuctionsPage() {
  const liveAuctions = await getLiveAuctions()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Auction Dashboard</h1>
        <Button asChild variant="outline">
          <Link href="/admin/auctions">All Auctions</Link>
        </Button>
      </div>
      {liveAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveAuctions.map((auction) => (
            <LiveAuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl">No live auctions at the moment.</p>
        </div>
      )}
    </div>
  )
}