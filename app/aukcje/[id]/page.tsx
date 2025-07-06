import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AuctionDetails } from "@/components/aukcje/auction-details"
import { BiddingPanel } from "@/components/aukcje/bidding-panel"
import { notFound } from "next/navigation"

interface AuctionPageProps {
  params: {
    id: string
  }
}

export default async function AuctionPage({ params }: AuctionPageProps) {
  // In a real app, you would fetch the auction data here
  const auction = await getAuction(params.id)

  if (!auction) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AuctionDetails auction={auction} />
          </div>
          <div className="lg:col-span-1">
            <BiddingPanel auction={auction} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

async function getAuction(id: string) {
  // Mock function - replace with actual Supabase query
  return {
    id,
    title: "Porsche 911 Carrera",
    description: "Piękny egzemplarz Porsche 911 w doskonałym stanie...",
    current_bid: 122500,
    image_urls: ["/placeholder.svg?height=400&width=600"],
    ends_at: "2024-01-15T18:00:00Z",
    view_count: 890,
    bid_count: 23,
  }
}
