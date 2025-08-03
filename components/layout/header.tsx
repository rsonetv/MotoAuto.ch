"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, User, Menu, Plus, Settings, LogOut, FileText, Gavel, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { AuthUser } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"

export function Header() {
  const { user, signOut } = useAuth()
  const authUser = user as AuthUser
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("PL")
  const { theme, setTheme } = useTheme()

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
    { href: "/faq", label: "Jak to działa" },
    { href: "/cennik", label: "Cennik" },
  ]

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl">
              MotoAuto<span className="text-red-600">.ch</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex mx-6 items-center space-x-6 flex-1">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 p-0"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <div className="h-4 w-4 fill-current">
              {theme === "dark" ? "🌞" : "🌙"}
            </div>
          </Button>

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-2" aria-label="Select language">
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-sm">{selectedLanguage}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="min-w-[140px] bg-background border border-border"
            >
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu / Auth buttons */}
          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="User menu">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-background border border-border"
              >
                <DropdownMenuLabel className="text-foreground">
                  {authUser.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/add" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj ogłoszenie
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem 
                  onClick={signOut}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Zaloguj się</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Zarejestruj się</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0 mobile-menu-trigger"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[400px] bg-background border-l border-border"
            >
              <div className="flex flex-col h-full">
                {/* Header with logo and close button (close button is auto-added by SheetContent) */}
                <div className="flex items-center pb-4 border-b border-border">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">M</span>
                    </div>
                    <span className="font-bold text-xl text-foreground">
                      MotoAuto<span className="text-red-600">.ch</span>
                    </span>
                  </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6">
                  <div className="space-y-4">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Auth section for mobile */}
                  {!authUser && (
                    <div className="mt-8 space-y-3">
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/auth/login">Zaloguj się</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/auth/register">Zarejestruj się</Link>
                      </Button>
                    </div>
                  )}

                  {/* User listings for authenticated users */}
                  {authUser && (
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-4">Twoje ogłoszenia</h3>
                      <div className="space-y-2">
                        {userListings.map((listing) => (
                          <div key={listing.id} className="p-3 rounded-lg bg-muted">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{listing.title}</span>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground capitalize">{listing.type}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                listing.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {listing.status === 'active' ? 'Aktywne' : 'Sprzedane'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </nav>

                {/* Footer with theme toggle and language */}
                <div className="border-t border-border pt-4 space-y-4">
                  {/* Theme toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Motyw:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="h-8 px-3"
                    >
                      {theme === "dark" ? "🌞 Jasny" : "🌙 Ciemny"}
                    </Button>
                  </div>

                  {/* Language selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Język:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-3">
                          <span className="mr-1">
                            {languages.find(lang => lang.code === selectedLanguage)?.flag}
                          </span>
                          {selectedLanguage}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        className="bg-background border border-border"
                      >
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className="cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Sign out for authenticated users */}
                  {authUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={signOut}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Wyloguj się
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
