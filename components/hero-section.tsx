"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      toast.error("Wprowadź frazę do wyszukania")
      return
    }

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <section className="gradient-hero min-h-[60vh] flex items-center justify-center text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            Znajdź swój <span className="text-yellow-400">wymarzony</span> pojazd
          </h1>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Wyszukaj BMW, Honda, Yamaha…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-4 text-lg bg-white text-gray-900 border-0 focus:ring-2 focus:ring-teal-500"
                  aria-label="Wyszukaj pojazd"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold"
                aria-label="Szukaj pojazdów"
              >
                Szukaj
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
