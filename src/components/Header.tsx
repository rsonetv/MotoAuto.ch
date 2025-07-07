"use client"

import { useState } from "react"
import { Menu, X, Globe } from "lucide-react"

interface HeaderProps {
  activeTab: "moto" | "auto" | "auction"
  onTabChange: (tab: "moto" | "auto" | "auction") => void
  onFilterClick: () => void
}

export default function Header({ activeTab, onTabChange, onFilterClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: "moto" as const, label: "MOTO", icon: "🏍️" },
    { id: "auto" as const, label: "AUTO", icon: "🚗" },
    { id: "auction" as const, label: "AUKCJE", icon: "🔨" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              MotoAuto<span className="text-primary-600">.ch</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Moto
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Auto
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Aukcje
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Dealerzy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Jak to działa
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Kontakt
            </a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <button className="hidden md:block text-gray-600 hover:text-gray-900">Zaloguj się</button>
            <button className="hidden md:block btn-primary">Dodaj ogłoszenie</button>
            <Globe className="w-5 h-5 text-gray-400" />

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Moto
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Auto
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Aukcje
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Dealerzy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Jak to działa
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Kontakt
              </a>
              <div className="pt-3 border-t border-gray-200">
                <a href="#" className="block text-gray-600 hover:text-gray-900 mb-3">
                  Zaloguj się
                </a>
                <button className="btn-primary w-full">Dodaj ogłoszenie</button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Znaleziono 6 ofert</span>
          <button
            onClick={onFilterClick}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
            <span>Filtruj</span>
          </button>
        </div>
      </div>
    </header>
  )
}
