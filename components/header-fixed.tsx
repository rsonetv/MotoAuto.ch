"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe, Menu, User, Bell, Search } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
        : "bg-transparent"
    }`}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-dark via-brand to-brand-light">
            MotoAuto.ch
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/ogloszenia" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Ogłoszenia
          </Link>
          <Link 
            href="/aukcje" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Aukcje
          </Link>
          <Link 
            href="/jak-to-dziala" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Jak to działa
          </Link>
          
          {/* Search button */}
          <Button variant="outline" size="sm" className="gap-1">
            <Search className="h-4 w-4" />
            <span>Szukaj</span>
          </Button>
          
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span className="text-xs">PL</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Polski</DropdownMenuItem>
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Deutsch</DropdownMenuItem>
              <DropdownMenuItem>Français</DropdownMenuItem>
              <DropdownMenuItem>Italiano</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1">
                <User className="h-4 w-4" />
                <span>Konto</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/auth/login">Zaloguj się</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/register">Zarejestruj się</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Panel użytkownika</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ogloszenia/dodaj">Dodaj ogłoszenie</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg md:hidden z-50">
            <div className="container py-4 flex flex-col gap-2">
              <Link 
                href="/ogloszenia" 
                className="text-sm font-medium p-2 hover:bg-secondary rounded"
              >
                Ogłoszenia
              </Link>
              <Link 
                href="/aukcje" 
                className="text-sm font-medium p-2 hover:bg-secondary rounded"
              >
                Aukcje
              </Link>
              <Link 
                href="/jak-to-dziala" 
                className="text-sm font-medium p-2 hover:bg-secondary rounded"
              >
                Jak to działa
              </Link>
              
              <div className="flex items-center gap-2 p-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  <span>Szukaj</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Polski</DropdownMenuItem>
                    <DropdownMenuItem>English</DropdownMenuItem>
                    <DropdownMenuItem>Deutsch</DropdownMenuItem>
                    <DropdownMenuItem>Français</DropdownMenuItem>
                    <DropdownMenuItem>Italiano</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
              
              <div className="border-t my-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/auth/login">Zaloguj się</Link>
                  </Button>
                  <Button asChild variant="default" size="sm">
                    <Link href="/auth/register">Zarejestruj się</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">Panel użytkownika</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/ogloszenia/dodaj">Dodaj ogłoszenie</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
