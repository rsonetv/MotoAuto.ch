"use client"

import { useState, useEffect } from "react"
import { Bike, Car, Truck, Gavel, PlusCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ThemeToggle } from "./ui/theme-toggle"

type TabType = "moto" | "auto" | "ciezarowe" | "aukcje"

export function StickyTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("auto")
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.7 // Match hero height
      setIsSticky(window.scrollY > heroHeight - 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const tabs = [
    { id: "auto" as TabType, label: "Samochody osobowe", icon: Car },
    { id: "moto" as TabType, label: "Motocykle", icon: Bike },
    { id: "ciezarowe" as TabType, label: "Ciężarowe", icon: Truck },
    { id: "aukcje" as TabType, label: "Aukcje", icon: Gavel },
  ]

  return (
    <div 
      className={`bg-white dark:bg-background border-b border-border transition-all duration-300 ${
        isSticky ? "sticky top-0 z-40 shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center space-x-2 py-4 px-5 border-b-2 transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? `border-primary text-primary font-medium`
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-primary" : ""}`} />
              <span>{tab.label}</span>
            </button>
          ))}
          
          <Link
            href="/ogloszenia/dodaj"
            className="flex items-center justify-center space-x-2 py-4 px-5 border-b-2 border-transparent text-accent ml-auto whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Dodaj ogłoszenie</span>
          </Link>
          
          <div className="flex items-center ml-4">
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
          className="bg-secondary/20 min-h-screen rounded-b-lg"
        >
          <div className="container mx-auto px-4 py-8">
            {activeTab === "aukcje" ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="text-center py-6">
                  <h2 className="text-2xl font-bold mb-4">Aktualne aukcje</h2>
                  <p className="text-muted-foreground mb-6">Najciekawsze oferty aukcyjne w jednym miejscu</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="bg-white dark:bg-card rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="aspect-video bg-secondary/40 rounded-lg mb-4"></div>
                      <h3 className="font-medium mb-2">Aukcja pojazdu #{index}</h3>
                      <p className="text-sm text-muted-foreground">
                        Kończy się za: 2 godz. 15 min
                      </p>
                    </div>
                  ))}
                </div>
               </div>
             </div>
           ) : (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
               <div className="text-center py-6">
                 <h2 className="text-2xl font-bold mb-4">
                   {activeTab === "moto"
                     ? "Najnowsze motocykle"
                     : activeTab === "auto"
                     ? "Najnowsze samochody osobowe"
                     : "Najnowsze samochody ciężarowe"}
                 </h2>
                 <p className="text-muted-foreground mb-6">
                   Przeglądaj najnowsze oferty w wybranej kategorii
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[1, 2, 3, 4, 5, 6].map((index) => (
                     <div
                       key={index}
                       className="bg-white dark:bg-card rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
                     >
                       <div className="aspect-video bg-secondary/40 rounded-lg mb-4"></div>
                       <h3 className="font-medium mb-2">Pojazd #{index}</h3>
                       <p className="text-sm text-muted-foreground">
                         Rocznik: 2020 | Przebieg: 45 000 km
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}
         </div>
       </motion.div>
     </AnimatePresence>
   </div>
 )
}
