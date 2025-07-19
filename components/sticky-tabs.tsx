"use client"

import { useState, useEffect } from "react"
import { Bike, Car, Gavel, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
    {
      id: "auto" as TabType,
      label: "AUTO",
      icon: Car,
      color: "teal",
      count: "8,234",
      description: "Samochody osobowe i dostawcze",
    },
    {
      id: "moto" as TabType,
      label: "MOTO",
      icon: Bike,
      color: "orange",
      count: "2,156",
      description: "Motocykle i skutery",
    },
    {
      id: "aukcje" as TabType,
      label: "AUKCJE",
      icon: Gavel,
      color: "red",
      count: "342",
      description: "Licytacje na żywo",
    },
  ]

  return (
    <div className={`bg-gray-900 ${isSticky ? "sticky top-0 z-50 shadow-2xl" : ""} transition-all duration-300`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop tabs */}
        <div className="hidden md:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-4 lg:py-6 border-b-3 transition-all duration-300 group relative overflow-hidden ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 text-white bg-gray-800`
                  : "border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {/* Background animation */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${
                  tab.color === "teal"
                    ? "from-teal-600/10 to-teal-500/10"
                    : tab.color === "orange"
                      ? "from-orange-600/10 to-orange-500/10"
                      : "from-red-600/10 to-red-500/10"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeTab === tab.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative z-10 flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-3">
                  <tab.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="font-semibold text-sm lg:text-base">{tab.label}</span>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === tab.id ? `bg-${tab.color}-500 text-white` : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {tab.count}
                  </div>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{tab.description}</p>
              </div>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-${tab.color}-500`}
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden py-4">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
            <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Mobile stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`text-center p-3 rounded-lg transition-all ${
                  activeTab === tab.id ? `bg-${tab.color}-500/20 border border-${tab.color}-500/30` : "bg-gray-800/50"
                }`}
              >
                <tab.icon
                  className={`w-6 h-6 mx-auto mb-1 ${activeTab === tab.id ? `text-${tab.color}-400` : "text-gray-400"}`}
                />
                <div className="text-sm font-semibold text-white">{tab.count}</div>
                <div className="text-xs text-gray-400">{tab.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-gray-50 min-h-screen"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            {activeTab === "aukcje" ? <AuctionGrid /> : <VehicleGrid category={activeTab} />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
