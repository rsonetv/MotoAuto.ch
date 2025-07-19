"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight } from "lucide-react"
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
    <section className="gradient-hero flex items-center justify-center text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100&text=pattern')] bg-repeat opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Main heading with responsive text sizing */}
          <h1 className="text-responsive-3xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
            Znajdź swój{" "}
            <span className="text-yellow-400 relative">
              wymarzony
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </span>{" "}
            pojazd
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-responsive-lg text-gray-200 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Największa platforma sprzedaży samochodów i motocykli w Szwajcarii. Ponad 10,000 aktywnych ogłoszeń czeka na
            Ciebie!
          </motion.p>

          {/* Search form */}
          <motion.form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Wyszukaj BMW, Honda, Yamaha, Audi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input-responsive pl-12 bg-white/95 backdrop-blur-sm text-gray-900 border-0 focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  aria-label="Wyszukaj pojazd"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="btn-responsive bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                aria-label="Szukaj pojazdów"
              >
                <span className="hidden sm:inline">Szukaj</span>
                <span className="sm:hidden">Szukaj</span>
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.form>

          {/* Popular searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-6 sm:mt-8"
          >
            <p className="text-sm text-gray-300 mb-3">Popularne wyszukiwania:</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {["BMW", "Audi", "Mercedes", "Honda", "Yamaha", "Kawasaki"].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term)
                    router.push(`/search?q=${encodeURIComponent(term)}`)
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-responsive-2xl font-bold text-yellow-400">10K+</div>
              <div className="text-sm sm:text-base text-gray-300">Aktywnych ogłoszeń</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-2xl font-bold text-yellow-400">500+</div>
              <div className="text-sm sm:text-base text-gray-300">Dealerów</div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-responsive-2xl font-bold text-yellow-400">50K+</div>
              <div className="text-sm sm:text-base text-gray-300">Zadowolonych klientów</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  )
}
