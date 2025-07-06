"use client"

import Link from "next/link"

export function DashboardNav() {
  const links = [
    { href: "/dashboard", label: "Statystyki" },
    { href: "/dashboard/listings", label: "Moje ogłoszenia" },
    { href: "/dashboard/bids", label: "Moje licytacje" },
  ]
  return (
    <nav className="space-y-2">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="block px-4 py-2 rounded hover:bg-gray-200 text-gray-700">
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
