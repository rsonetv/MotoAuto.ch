"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { debounce } from "@/lib/utils"

interface VehicleSearchProps {
  onSearchChange: (searchTerm: string) => void
  initialValue?: string
  placeholder?: string
}

export function VehicleSearch({
  onSearchChange,
  initialValue = "",
  placeholder = "Szukaj pojazdów...",
}: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        onSearchChange(term)
      }, 300),
    [onSearchChange],
  )

  // Handle search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchTerm(value)
      debouncedSearch(value)
    },
    [debouncedSearch],
  )

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("")
    onSearchChange("")
  }, [onSearchChange])

  // Handle key press events
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        onSearchChange(searchTerm)
      }
      if (e.key === "Escape") {
        handleClearSearch()
      }
    },
    [searchTerm, onSearchChange, handleClearSearch],
  )

  // Update local state when initialValue changes
  useEffect(() => {
    setSearchTerm(initialValue)
  }, [initialValue])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
          className="pl-10 pr-10 h-12 text-base border-2 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search suggestions could be added here in the future */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 text-sm text-gray-500 px-3">
          Wyszukiwanie: "{searchTerm}"
        </div>
      )}
    </div>
  )
}
