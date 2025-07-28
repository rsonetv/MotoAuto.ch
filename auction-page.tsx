"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Car, Bike, Gavel, Globe, Clock, Eye } from "lucide-react"

export default function AuctionPage() {
  const [activeTab, setActiveTab] = useState("aukcje")

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              MotoAuto<span className="text-red-500">.ch</span>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/moto" className="text-gray-300 hover:text-white transition-colors">
                Moto
              </Link>
              <Link href="/auto" className="text-gray-300 hover:text-white transition-colors">
                Auto
              </Link>
              <Link href="/aukcje" className="text-white font-medium">
                Aukcje
              </Link>
              <Link href="/jak-to-dziala" className="text-gray-300 hover:text-white transition-colors">
                Jak to działa
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Zaloguj się
              </Link>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Dodaj ogłoszenie</Button>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("moto")}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === "moto" ? "border-red-500 text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Bike className="w-5 h-5" />
              <span>MOTO</span>
            </button>
            <button
              onClick={() => setActiveTab("auto")}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === "auto" ? "border-red-500 text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Car className="w-5 h-5" />
              <span>AUTO</span>
            </button>
            <button
              onClick={() => setActiveTab("aukcje")}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === "aukcje"
                  ? "border-red-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Gavel className="w-5 h-5" />
              <span>AUKCJE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Aukcje Specjalne</h1>
          <p className="text-gray-400 text-lg">Nie przegap wyjątkowych okazji dostępnych tylko u nas.</p>
        </div>

        {/* Auction Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Blind Auctions */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Licytacje w ciemno</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative h-64 bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚗</div>
                    <p className="text-gray-400">Mercedes-AMG GT</p>
                  </div>
                </div>
                <Badge className="absolute top-4 left-4 bg-teal-600 hover:bg-teal-600 text-white flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Blind Auction
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Mercedes-AMG GT</h3>
                <p className="text-gray-400 mb-2">Cena startowa</p>
                <p className="text-2xl font-bold mb-4">CHF 80,000</p>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Złóż ofertę</Button>
              </div>
            </div>
          </div>

          {/* User Auctions */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Aukcje użytkowników</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                <img src="/motorcycle-auction.png" alt="Porsche 911 Carrera" className="w-full h-64 object-cover" />
                <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-600 text-white flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Live
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Porsche 911 Carrera</h3>
                <p className="text-gray-400 mb-2">Aktualna oferta</p>
                <p className="text-2xl font-bold mb-4">CHF 122,500</p>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white mb-4">Licytuj teraz</Button>
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Kończy się za: 1d 8h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
