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
    <section className="bg-white bg-opacity-95 dark:gradient-hero min-h-[12vh] py-4 flex items-center justify-center text-gray-800 dark:text-white shadow-md border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-3 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <form onSubmit={handleSearch} className="flex items-center justify-center max-w-sm mx-auto">
            <Input
              type="text"
              placeholder="Wyszukaj pojazd..."
              className="w-full rounded-l-md h-9 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-primary text-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="rounded-l-none bg-primary hover:bg-primary/90 text-white dark:bg-blue-600 dark:hover:bg-blue-700 h-9 px-3">
              <Search className="h-3.5 w-3.5" />
              <span className="ml-1 text-sm">Szukaj</span>
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
