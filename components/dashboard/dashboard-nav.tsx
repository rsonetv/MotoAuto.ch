"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  LayoutGrid,
  Car,
  Gavel,
  Package,
  User,
  CreditCard,
  Settings,
  LogOut,
  Bell
} from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const navigation = [
    {
      name: "Przegląd",
      href: `/dashboard`,
      icon: LayoutGrid,
      current: pathname === `/dashboard`,
    },
    {
      name: "Moje ogłoszenia",
      href: `/dashboard/listings`,
      icon: Car,
      current: pathname === `/dashboard/listings`,
      badge: "3" // Liczba aktywnych ogłoszeń
    },
    {
      name: "Moje licytacje",
      href: `/dashboard/bids`,
      icon: Gavel,
      current: pathname === `/dashboard/bids`,
      badge: "2" // Liczba aktywnych licytacji
    },
    {
       name: "Wygrane aukcje",
       href: `/dashboard/won-auctions`,
       icon: Gavel,
       current: pathname === `/dashboard/won-auctions`,
     },
     {
       name: "Sprzedane pojazdy",
       href: `/dashboard/sold-vehicles`,
       icon: Car,
       current: pathname === `/dashboard/sold-vehicles`,
     },
    {
      name: "Pakiety",
      href: `/dashboard/packages`,
      icon: Package,
      current: pathname === `/dashboard/packages`,
    },
    {
      name: "Profil",
      href: `/dashboard/profile`,
      icon: User,
      current: pathname === `/dashboard/profile`,
    },
    {
      name: "Płatności",
      href: `/dashboard/payments`,
      icon: CreditCard,
      current: pathname === `/dashboard/payments`,
    },
  ]

  const secondaryNavigation = [
  {
    name: "Ustawienia",
    href: `/dashboard/settings`,
    icon: Settings,
    current: pathname === `/dashboard/settings`,
  },
  {
    name: "Wyloguj",
    href: "/auth/signout",
    icon: LogOut,
  },
]

  return (
    <nav className="space-y-2">
      <div className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.current
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    "w-5 h-5",
                    item.current ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>

      <div className="pt-4 mt-4 border-t border-border">
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon
            if (item.name === "Wyloguj") {
              return (
                <form action={item.href} method="post" key={item.name}>
                  <button
                    type="submit"
                    className="group flex w-full items-center px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground mr-3" />
                    <span>{item.name}</span>
                  </button>
                </form>
              )
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.current
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 mr-3",
                    item.current ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Powiadomienia */}
      <div className="pt-4 mt-4 border-t border-border">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Powiadomienia
            </span>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-foreground p-2 bg-primary/10 rounded">
              <strong>Nowa wiadomość</strong> dotycząca BMW X5
            </div>
            <div className="text-xs text-foreground p-2 bg-green-500/10 rounded">
              <strong>Oferta przyjęta</strong> za Mercedes C-Class
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
