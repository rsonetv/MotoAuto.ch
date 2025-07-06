"use client"

import { AuctionGrid } from "./auction-grid"

export function AuctionList() {
  /* This wrapper lets you add pagination or filters later */
  return (
    <section>
      <AuctionGrid />
    </section>
  )
}
