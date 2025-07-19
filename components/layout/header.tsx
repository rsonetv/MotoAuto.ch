"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe, User, Menu, Phone, Mail, Plus, Settings, LogOut, FileText, Gavel, Edit, Trash2, X } from "lucide-react"
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
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    { href: "/dealerzy", label: "Dealerzy" },
    { href: "/jak-to-dziala", label: "Jak to działa" },
    { href: "/kontakt", label: "Kontakt" },
  ]

  // Mock user listings for demonstration
  const userListings = [
    { id: 1, title: "Audi RS6 Avant", type: "listing", status: "active" },
    { id: 2, title: "Yamaha R1M", type: "listing", status: "sold" },
    { id: 3, title: "Porsche 911", type: "auction", status: "active" },
  ]

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    console.log(`Language changed to: ${langCode}`)
  }

  return (
    <header
      className={`bg-gray-900 text-white border-b border-gray-800 transition-all duration-300 ${
        isScrolled ? "shadow-lg backdrop-blur-sm bg-gray-900/95" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity">
            MotoAuto<span className="text-red-500">.ch</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-6 2xl:space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm 2xl:text-base font-medium relative group"
              >
                {link.href === "/kontakt" && <Phone className="w-4 h-4 mr-1 inline" />}
                <span>{link.label}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {/* Contact Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-2">
                  <Phone className="w-4 h-4" />
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
                  <Link href="/kontakt">Formularz kontaktowy</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Globe className="w-4 h-4 mr-1" />
                  <span className="hidden xl:inline">{selectedLanguage}</span>
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

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden xl:inline max-w-32 truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium truncate">{user.profile?.full_name || user.email}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

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

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {userListings.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Twoje ogłoszenia</DropdownMenuLabel>
                      {userListings.slice(0, 3).map((listing) => (
                        <DropdownMenuItem key={listing.id} className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            {listing.type === "auction" ? (
                              <Gavel className="w-4 h-4 mr-2 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{listing.title}</p>
                              <p className="text-xs text-gray-500">{listing.status}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1 ml-2">
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
                    <span className="hidden xl:inline">Konto</span>
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
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white hidden xl:flex">
                <Link href="/ogloszenia/dodaj">
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj ogłoszenie
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden text-gray-300 hover:text-white p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 bg-gray-900 text-white border-gray-800 p-0">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <Link href="/" className="text-xl font-bold" onClick={() => setMobileMenuOpen(false)}>
                  MotoAuto<span className="text-red-500">.ch</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-col h-full">
                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center py-3 px-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.href === "/kontakt" && <Phone className="w-4 h-4 mr-3" />}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Mobile User Section */}
                <div className="border-t border-gray-800 p-4 space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.profile?.full_name || user.email}</p>
                          <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                        <Link href="/ogloszenia/dodaj" onClick={() => setMobileMenuOpen(false)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Dodaj ogłoszenie
                        </Link>
                      </Button>

                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center py-3 px-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            signOut()
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center py-3 px-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-all duration-200 w-full text-left"
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
                <div className="border-t border-gray-800 p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href="tel:+41441234567" className="hover:text-white transition-colors">
                        +41 44 123 45 67
                      </a>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <a href="mailto:kontakt@motoauto.ch" className="hover:text-white transition-colors">
                        kontakt@motoauto.ch
                      </a>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-gray-400">Język:</span>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
