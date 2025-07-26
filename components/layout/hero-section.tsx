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

    router.push(`/ogloszenia?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <section className="gradient-hero min-h-[40vh] flex items-center justify-center text-white relative">
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="container mx-auto px-4 text-center z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">MotoAuto.ch</h1>
          <p className="text-xl md:text-2xl mb-8">Znajdź swój wymarzony pojazd</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSearch} className="flex items-center justify-center">
            <Input
              type="text"
              placeholder="Wyszukaj pojazd..."
              className="w-full md:w-auto rounded-l-md py-3 text-lg border-2 border-r-0 border-white/20 bg-black/30 backdrop-blur-sm text-white placeholder:text-white/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="rounded-l-none bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 text-lg">
              <Search className="mr-2 h-5 w-5" />
              Szukaj
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
