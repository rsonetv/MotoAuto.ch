"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, User, Menu, Phone, Mail, Plus, Settings, LogOut, FileText, Gavel, Edit, Trash2, Heart } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("PL")

  const languages = [
    { code: "PL", name: "Polski", flag: "🇵🇱" },
    { code: "DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "FR", name: "Français", flag: "🇫🇷" },
    { code: "EN", name: "English", flag: "🇬🇧" },
  ]

  const navigationLinks = [
    { href: "/ogloszenia?category=moto", label: "Moto" },
    { href: "/ogloszenia?category=auto", label: "Auto" },
    { href: "/aukcje", label: "Aukcje" },
    { href: "/pricing", label: "Cennik" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Kontakt" },
  ]

  // Mock user listings for demonstration
  const userListings = [
    { id: 1, title: "Audi RS6 Avant", type: "listing", status: "active" },
    { id: 2, title: "Yamaha R1M", type: "listing", status: "sold" },
    { id: 3, title: "Porsche 911", type: "auction", status: "active" },
  ]

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    // Here you would implement actual language switching logic
    console.log(`Language changed to: ${langCode}`)
  }

  return (
    <header className="bg-gray-900 text-white border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            MotoAuto<span className="text-red-500">.ch</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-300 hover:text-white transition-colors ${
                  link.href === "/contact" ? "flex items-center space-x-1" : ""
                }`}
              >
                {link.href === "/contact" && <Phone className="w-4 h-4" />}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Consolidated Top-Right Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Contact Information Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Kontakt</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Phone className="w-4 h-4 mr-2" />
                  +41 44 123 45 67
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 mr-2" />
                  kontakt@motoauto.ch
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/contact">Formularz kontaktowy</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Globe className="w-4 h-4 mr-1" />
                  {selectedLanguage}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Wybierz język</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={selectedLanguage === lang.code ? "bg-gray-100" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Authentication/Account Management */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user.profile?.full_name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Quick Actions */}
                  <DropdownMenuItem asChild>
                    <Link href="/ogloszenia/dodaj">
                      <Plus className="w-4 h-4 mr-2" />
                      Dodaj ogłoszenie
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/aukcje/create">
                      <Gavel className="w-4 h-4 mr-2" />
                      Utwórz aukcję
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* User Management */}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">
                      <Heart className="w-4 h-4 mr-2" />
                      Ulubione
                    </Link>
                  </DropdownMenuItem>

                  {/* User Listings/Auctions */}
                  {userListings.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Twoje ogłoszenia</DropdownMenuLabel>
                      {userListings.slice(0, 3).map((listing) => (
                        <DropdownMenuItem key={listing.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {listing.type === "auction" ? (
                              <Gavel className="w-4 h-4 mr-2" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{listing.title}</p>
                              <p className="text-xs text-gray-500">{listing.status}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {userListings.length > 3 && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/listings" className="text-center">
                            Zobacz wszystkie ({userListings.length})
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Konto</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Zaloguj się</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register">Zarejestruj się</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Add Listing Button */}
            {user && (
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white hidden sm:flex">
                <Link href="/ogloszenia/dodaj">Dodaj ogłoszenie</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-gray-300 hover:text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gray-900 text-white border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="text-xl font-bold">
                  MotoAuto<span className="text-red-500">.ch</span>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4 mb-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Section */}
              <div className="border-t border-gray-800 pt-6 space-y-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="w-8 h-8 bg-gray-700 rounded-full p-2" />
                      <div>
                        <p className="font-medium">{user.profile?.full_name || user.email}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 mb-4">
                      <Link href="/ogloszenia/dodaj" onClick={() => setMobileMenuOpen(false)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Dodaj ogłoszenie
                      </Link>
                    </Button>

                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center py-2 text-gray-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        href="/favorites"
                        className="flex items-center py-2 text-gray-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        Ulubione
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center py-2 text-red-400 hover:text-red-300 w-full text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Wyloguj się
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        Zaloguj się
                      </Link>
                    </Button>
                    <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        Zarejestruj się
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Contact & Language */}
              <div className="border-t border-gray-800 pt-6 mt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    +41 44 123 45 67
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    kontakt@motoauto.ch
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Język:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
