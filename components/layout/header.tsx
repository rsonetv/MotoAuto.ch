"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe, User } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-gray-900 text-white border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            MotoAuto<span className="text-red-500">.ch</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/ogloszenia" className="text-gray-300 hover:text-white transition-colors">
              Moto
            </Link>
            <Link href="/ogloszenia" className="text-gray-300 hover:text-white transition-colors">
              Auto
            </Link>
            <Link href="/aukcje" className="text-gray-300 hover:text-white transition-colors">
              Aukcje
            </Link>
            <Link href="/dealerzy" className="text-gray-300 hover:text-white transition-colors">
              Dealerzy
            </Link>
            <Link href="/jak-to-dziala" className="text-gray-300 hover:text-white transition-colors">
              Jak to działa
            </Link>
            <Link href="/kontakt" className="text-gray-300 hover:text-white transition-colors">
              Kontakt
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <User className="w-5 h-5 mr-2" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>Wyloguj się</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
                Zaloguj się
              </Link>
            )}
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/ogloszenia/dodaj">Dodaj ogłoszenie</Link>
            </Button>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
