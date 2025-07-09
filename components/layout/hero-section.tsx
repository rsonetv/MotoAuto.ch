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
    <section className="gradient-hero min-h-[20vh] flex items-center justify-center text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <form onSubmit={handleSearch} className="flex items-center justify-center">
            <Input
              type="text"
              placeholder="Wyszukaj pojazd..."
              className="w-full md:w-auto rounded-l-md py-2" // Changed py-3 to py-2 for smaller height
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="rounded-l-none">
              <Search className="mr-2 h-4 w-4" />
              Szukaj
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
