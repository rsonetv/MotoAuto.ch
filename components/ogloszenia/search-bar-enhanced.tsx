"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Card } from "@/components/ui/card"

// Popularne wyszukiwania i modele dla podpowiedzi
const POPULAR_SEARCHES = [
  "Toyota", "BMW", "Mercedes", "Audi", "Volkswagen", "Ford", "Skoda", "Renault",
  "SUV", "Sedan", "Kombi", "Elektryk", "Hybrid", "4x4"
];

const POPULAR_MODELS = {
  "Toyota": ["Corolla", "RAV4", "Yaris", "Camry", "C-HR"],
  "BMW": ["Seria 3", "Seria 5", "X3", "X5", "i4"],
  "Mercedes": ["Klasa C", "Klasa E", "GLC", "GLE", "EQC"],
  "Audi": ["A3", "A4", "Q3", "Q5", "e-tron"],
  "Volkswagen": ["Golf", "Passat", "Tiguan", "ID.4", "Polo"],
  "Ford": ["Focus", "Kuga", "Puma", "Mustang Mach-E"],
  "Skoda": ["Octavia", "Superb", "Kodiaq", "Enyaq"],
  "Renault": ["Clio", "Captur", "Megane E-Tech"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X"]
};

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  recentSearches?: string[]
  onSearchSelect?: (search: string) => void
}

export function SearchBarEnhanced({ 
  value, 
  onChange, 
  placeholder = "Szukaj marki, modelu lub słowa kluczowe...",
  recentSearches = [],
  onSearchSelect
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Generowanie sugestii na podstawie wprowadzonego tekstu
  useEffect(() => {
    if (localValue.length > 0) {
      const query = localValue.toLowerCase();
      
      const brandMatches = POPULAR_SEARCHES.filter(item =>
        item.toLowerCase().startsWith(query)
      );
      
      const modelSuggestions: string[] = [];
      Object.entries(POPULAR_MODELS).forEach(([brand, models]) => {
        // If brand matches, suggest all its models
        if (brand.toLowerCase().includes(query)) {
          models.forEach(model => {
            modelSuggestions.push(`${brand} ${model}`);
          });
        } else { // Otherwise, check for model matches
          const matchingModels = models.filter(model =>
            model.toLowerCase().includes(query)
          );
          matchingModels.forEach(model => {
            modelSuggestions.push(`${brand} ${model}`);
          });
        }
      });
      
      const combined = [...brandMatches, ...modelSuggestions];
      const uniqueSuggestions = Array.from(new Set(combined));

      setSuggestions(uniqueSuggestions.slice(0, 8));
    } else {
      setSuggestions([]);
    }
  }, [localValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(localValue)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion)
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={handleFocus}
            className="pl-10 pr-20"
            autoComplete="off"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            {localValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" size="sm" className="h-8">
              Szukaj
            </Button>
          </div>
        </div>
      </form>
      
      {showSuggestions && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <div className="p-2">
            {suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground px-2 py-1.5">Sugestie</h4>
                <ul>
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="cursor-pointer hover:bg-accent p-2 rounded-md text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {localValue.length === 0 && recentSearches.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground px-2 py-1.5">Ostatnie wyszukiwania</h4>
                <ul>
                  {recentSearches.map(search => (
                    <li
                      key={search}
                      onClick={() => handleSuggestionClick(search)}
                      className="cursor-pointer hover:bg-accent p-2 rounded-md text-sm"
                    >
                      {search}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground px-2 py-1.5">Popularne</h4>
              <ul>
                {POPULAR_SEARCHES.slice(0, 5).map(search => (
                  <li
                    key={search}
                    onClick={() => handleSuggestionClick(search)}
                    className="cursor-pointer hover:bg-accent p-2 rounded-md text-sm"
                  >
                    {search}
                  </li>
                ))}
              </ul>
            </div>

            {suggestions.length === 0 && localValue.length > 0 && (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Brak wyników.
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
