"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Props {
  auction: any
}

export function BiddingPanel({ auction }: Props) {
  const [amount, setAmount] = useState(auction.current_bid + auction.min_increment)

  return (
    <aside className="bg-white p-6 rounded shadow space-y-4">
      <p className="text-lg">
        Aktualna oferta: <span className="font-bold">CHF {auction.current_bid.toLocaleString()}</span>
      </p>
      <input
        type="number"
        className="w-full border rounded p-2"
        min={amount}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <Button className="w-full">Złóż ofertę</Button>
    </aside>
  )
}
