import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
export const dynamic = 'force-dynamic'
import { cookies } from "next/headers"
import { Auction } from "@/lib/schemas/auction"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getAuctions(): Promise<Auction[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase.from("auctions").select("*")

  if (error) {
    console.error("Error fetching auctions:", error)
    return []
  }
  return data as Auction[]
}

export default async function AuctionsPage() {
  const auctions = await getAuctions()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Auction Management</h1>
        <Button asChild>
          <Link href="/admin/auctions/live">Live Dashboard</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={auctions} />
    </div>
  )
}