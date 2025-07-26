"use client"

import { useState, useEffect } from "react"
import { Bike, Car, Gavel } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VehicleGrid } from "@/components/ogloszenia/vehicle-grid"
import { AuctionGrid } from "@/components/aukcje/auction-grid"

type TabType = "moto" | "auto" | "aukcje"

export function StickyTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("auto")
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.6
      setIsSticky(window.scrollY > heroHeight - 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const tabs = [
    { id: "moto" as TabType, label: "MOTO", icon: Bike, color: "teal" },
    { id: "auto" as TabType, label: "AUTO", icon: Car, color: "teal" },
    { id: "aukcje" as TabType, label: "AUKCJE", icon: Gavel, color: "red" },
  ]

  return (
    <div className={`bg-gray-900 ${isSticky ? "sticky top-0 z-50 shadow-lg" : ""} transition-all duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-5 border-b-3 transition-all duration-300 ${
                activeTab === tab.id
                  ? tab.id === "aukcje" 
                    ? "border-red-500 text-white bg-gray-800" 
                    : "border-teal-500 text-white bg-gray-800"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="font-bold text-lg">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 min-h-screen"
        >
          <div className="container mx-auto px-4 py-8">
            {activeTab === "aukcje" ? <AuctionGrid /> : <VehicleGrid category={activeTab} />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
