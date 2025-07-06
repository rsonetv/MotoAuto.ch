"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function UserListings() {
  // Placeholder list
  const listings = [
    { id: 1, title: "Audi RS6 Avant", status: "active" },
    { id: 2, title: "Yamaha R1M", status: "sold" },
  ]
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Moje ogłoszenia</h2>
      <ul className="space-y-3">
        {listings.map((l) => (
          <li key={l.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
            <span>{l.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{l.status}</span>
              <Button size="sm" asChild>
                <Link href={`/ogloszenia/${l.id}`}>Podgląd</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
