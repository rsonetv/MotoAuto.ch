"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Car, Bike, Gavel, User, Search, Heart, MessageCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const navigation = [
    { name: "Samochody", href: "/samochody", icon: Car },
    { name: "Motocykle", href: "/motocykle", icon: Bike },
    { name: "Aukcje", href: "/aukcje", icon: Gavel },
    { name: "Wyszukaj", href: "/search", icon: Search },
  ]

  const userNavigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: User },
        { name: "Ulubione", href: "/favorites", icon: Heart },
        { name: "Wiadomości", href: "/messages", icon: MessageCircle },
      ]
    : [{ name: "Zaloguj się", href: "/auth/login", icon: User }]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2 py-4">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">MotoAuto.ch</span>
          </div>

          <div className="space-y-2">
            <h3 className="px-2 text-sm font-medium text-muted-foreground">Kategorien</h3>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="space-y-2">
            <h3 className="px-2 text-sm font-medium text-muted-foreground">Konto</h3>
            {userNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {user && (
            <div className="mt-auto pt-4 border-t">
              <div className="px-2 py-2">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.user_metadata?.full_name || "Benutzer"}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  // Handle logout
                  setOpen(false)
                }}
              >
                Abmelden
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
