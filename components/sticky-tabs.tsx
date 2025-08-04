"use client"

import { useState, useEffect } from "react"
import { Bike, Car, Gavel } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "./ui/theme-toggle"
import { VehicleGrid } from "./vehicle-grid"
import { AuctionGrid } from "./auction-grid"

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
    <div className={`${isSticky ? "sticky top-0 z-50 shadow-lg" : ""} transition-all duration-300 bg-white dark:bg-gray-900`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 ${tab.id === 'aukcje' 
                        ? 'text-red-600 dark:text-white bg-red-50 dark:bg-gray-800 shadow-sm border-l border-r border-t border-red-300 dark:border-transparent border-opacity-70 rounded-t-lg' 
                        : 'text-teal-600 dark:text-white bg-teal-50 dark:bg-gray-800 shadow-sm border-l border-r border-t border-teal-300 dark:border-transparent border-opacity-70 rounded-t-lg'}`
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:rounded-t-lg hover:border-l hover:border-r hover:border-t hover:border-gray-200 dark:hover:border-transparent"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id 
                  ? (tab.id === 'aukcje' 
                    ? 'text-red-600 dark:text-white' 
                    : 'text-teal-600 dark:text-white') 
                  : ''}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center px-4">
            <ThemeToggle isScrolled={true} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 dark:bg-gray-100 min-h-screen rounded-b-lg"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              {activeTab === "aukcje" ? <AuctionGrid /> : <VehicleGrid category={activeTab} />}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
