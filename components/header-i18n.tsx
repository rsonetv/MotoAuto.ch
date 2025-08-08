'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '../i18n/routing';
import { Button } from "./ui/button";
import { useState } from "react";
import { Menu, X, User, Heart, Search, Bell, Plus } from "lucide-react";
import { LanguageSelector } from './i18n/LanguageSelector';
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

export function HeaderI18n() {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigation = [
    { href: '/', label: t('home') },
    { href: '/ogloszenia', label: t('listings') },
    { href: '/aukcje', label: t('auctions') },
    { href: '/cennik', label: t('pricing') },
    { href: '/faq', label: t('faq') },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-primary">Moto</span>
              <span className="text-foreground">Auto</span>
              <span className="text-destructive">.ch</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Add Listing Button */}
            <Link href="/ogloszenia/nowe">
              <Button size="sm" className="hidden md:flex">
                <Plus className="h-4 w-4 mr-2" />
                {t('addListing')}
              </Button>
            </Link>

            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hidden md:flex">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
              >
                2
              </Badge>
            </Button>

            {/* Watchlist */}
            <Link href="/watchlist">
              <Button variant="ghost" size="sm" className="relative hidden md:flex">
                <Heart className="h-4 w-4" />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                >
                  5
                </Badge>
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden md:flex"
            >
              <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Language Selector */}
            <LanguageSelector variant="compact" />

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {t('login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  {t('register')}
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t pt-4 mt-4">
                {/* Add Listing Mobile */}
                <Link 
                  href="/ogloszenia/nowe" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 mb-3"
                >
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addListing')}
                  </Button>
                </Link>

                {/* Language Selector Mobile */}
                <div className="px-3 pb-3">
                  <LanguageSelector variant="mobile" />
                </div>

                {/* Auth Buttons Mobile */}
                <div className="flex flex-col space-y-2 px-3">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      {t('register')}
                    </Button>
                  </Link>
                </div>

                {/* Theme Toggle Mobile */}
                <div className="px-3 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTheme(theme === "light" ? "dark" : "light");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <SunIcon className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <MoonIcon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}