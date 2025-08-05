"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickFilter, SearchFilters } from "../schema"

interface QuickFilterChipsProps {
  quickFilters: QuickFilter[]
  activeFilters: SearchFilters
  onFilterSelect: (filter: Partial<SearchFilters>) => void
  className?: string
}

export function QuickFilterChips({ 
  quickFilters, 
  activeFilters, 
  onFilterSelect, 
  className 
}: QuickFilterChipsProps) {
  const isFilterActive = (filter: Partial<SearchFilters>) => {
    return Object.entries(filter).every(([key, value]) => {
      return activeFilters[key as keyof SearchFilters] === value
    })
  }

  return (
    <div className={`swipe-indicator ${className}`}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2 filter-chips-scroll">
          {quickFilters.map((quickFilter, index) => {
            const isActive = isFilterActive(quickFilter.filter)
            
            return (
              <Badge
                key={index}
                variant={isActive ? "default" : "secondary"}
                className="cursor-pointer touch-friendly shrink-0 px-3 py-2 text-sm"
                onClick={() => onFilterSelect(quickFilter.filter)}
              >
                {quickFilter.label}
              </Badge>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}