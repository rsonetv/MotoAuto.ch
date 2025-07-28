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
    <section className="gradient-hero min-h-[50vh] flex items-center justify-center text-white">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">MotoAuto.ch</h1>
          <p className="text-xl md:text-2xl mb-8">Największa platforma samochodowa w Szwajcarii</p>
          
          <form onSubmit={handleSearch} className="flex items-center justify-center mb-8">
            <Input
              type="text"
              placeholder="Wyszukaj pojazd..."
              className="w-full md:w-auto rounded-l-md py-2 text-black" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="rounded-l-none">
              <Search className="mr-2 h-4 w-4" />
              Szukaj
            </Button>
          </form>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={() => router.push("/how-it-works")}
            >
              Jak to działa
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={() => router.push("/pricing")}
            >
              Cennik
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={() => router.push("/contact")}
            >
              Kontakt
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
