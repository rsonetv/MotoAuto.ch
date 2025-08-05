"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Search } from "lucide-react"

interface SearchSuggestionsProps {
  query: string
  recentSearches: string[]
  popularSearches: string[]
  suggestions: string[]
  onSuggestionSelect: (suggestion: string) => void
  isVisible: boolean
  className?: string
}

export function SearchSuggestions({
  query,
  recentSearches,
  popularSearches,
  suggestions,
  onSuggestionSelect,
  isVisible,
  className
}: SearchSuggestionsProps) {
  if (!isVisible) return null

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6)

  const showRecent = query.length === 0 && recentSearches.length > 0
  const showPopular = query.length === 0 || filteredSuggestions.length < 3
  const showSuggestions = query.length > 0 && filteredSuggestions.length > 0

  return (
    <Card className={`absolute top-full mt-2 w-full z-50 shadow-lg ${className}`}>
      <CardContent className="p-3">
        {showSuggestions && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Sugestie</span>
            </div>
            <div className="space-y-1">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-accent p-2 rounded-md text-sm touch-friendly"
                  onClick={() => onSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

        {showRecent && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Ostatnie wyszukiwania</span>
            </div>
            <div className="space-y-1">
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-accent p-2 rounded-md text-sm touch-friendly"
                  onClick={() => onSuggestionSelect(search)}
                >
                  {search}
                </div>
              ))}
            </div>
          </div>
        )}

        {showPopular && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Popularne</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.slice(0, 6).map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent touch-friendly"
                  onClick={() => onSuggestionSelect(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {query.length > 0 && filteredSuggestions.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Brak wyników dla "{query}"
          </div>
        )}
      </CardContent>
    </Card>
  )
}