"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
      href: "/dashboard",
      icon: LayoutGrid,
      current: pathname === "/dashboard",
    },
    {
      name: "Moje ogłoszenia",
      href: "/dashboard/listings",
      icon: Car,
      current: pathname === "/dashboard/listings",
      badge: "3" // Liczba aktywnych ogłoszeń
    },
    {
      name: "Moje licytacje",
      href: "/dashboard/bids",
      icon: Gavel,
      current: pathname === "/dashboard/bids",
      badge: "2" // Liczba aktywnych licytacji
    },
    {
      name: "Pakiety",
      href: "/dashboard/packages",
      icon: Package,
      current: pathname === "/dashboard/packages",
    },
    {
      name: "Profil",
      href: "/dashboard/profile",
      icon: User,
      current: pathname === "/dashboard/profile",
    },
    {
      name: "Płatności",
      href: "/dashboard/payments",
      icon: CreditCard,
      current: pathname === "/dashboard/payments",
    },
  ]

  const secondaryNavigation = [
  {
    name: "Ustawienia",
    href: "/dashboard/settings",
    icon: Settings,
    current: pathname === "/dashboard/settings",
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
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    "w-5 h-5",
                    item.current ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
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

      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon
            if (item.name === "Wyloguj") {
              return (
                <form action={item.href} method="post" key={item.name}>
                  <button
                    type="submit"
                    className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mr-3" />
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
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 mr-3",
                    item.current ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Powiadomienia */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Powiadomienia
            </span>
            <Bell className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
              <strong>Nowa wiadomość</strong> dotycząca BMW X5
            </div>
            <div className="text-xs text-gray-600 p-2 bg-green-50 rounded">
              <strong>Oferta przyjęta</strong> za Mercedes C-Class
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
