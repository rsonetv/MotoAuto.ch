"use client"

import { useState, useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, MapPin, Search, Loader2 } from "lucide-react"
import { ModernListingFormValues } from "@/lib/schemas/modern-listing-schema"
import { cn } from "@/lib/utils"

// Typ dla Google Places API
declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

export function VehicleLocation() {
  const { control, setValue, watch } = useFormContext<ModernListingFormValues>()
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const autocompleteRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const watchedLocation = watch("location")

  // Ładowanie Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsGoogleMapsLoaded(true)
      return
    }

    // Funkcja callback dla Google Maps
    window.initGoogleMaps = () => {
      setIsGoogleMapsLoaded(true)
    }

    // Ładowanie skryptu Google Maps
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  // Inicjalizacja Google Places Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: ['ch', 'de', 'at', 'fr', 'it'] }, // Szwajcaria i kraje sąsiadujące
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        
        if (place.geometry) {
          const addressComponents = place.address_components || []
          
          // Parsowanie komponentów adresu
          let city = ""
          let postalCode = ""
          let country = ""

          addressComponents.forEach((component: any) => {
            const types = component.types
            
            if (types.includes('locality')) {
              city = component.long_name
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name
            } else if (types.includes('country')) {
              country = component.long_name
            }
          })

          // Aktualizacja formularza
          setValue("location", {
            city: city || place.name,
            postalCode: postalCode,
            country: country || "Szwajcaria",
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            placeId: place.place_id,
          })
        }
      })
    }
  }, [isGoogleMapsLoaded, setValue])

  // Wyszukiwanie miejscowości bez Google Maps (fallback)
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsSearching(true)
    
    try {
      // Fallback do Nominatim API (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ch,de,at,fr,it&limit=5&addressdetails=1`
      )
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Błąd wyszukiwania lokalizacji:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Wybór sugestii z fallback API
  const selectSuggestion = (suggestion: any) => {
    setValue("location", {
      city: suggestion.display_name.split(',')[0],
      postalCode: suggestion.address?.postcode || "",
      country: suggestion.address?.country || "Szwajcaria",
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      },
      placeId: suggestion.place_id?.toString(),
    })
    setSuggestions([])
  }

  // Walidacja inline
  const getFieldStatus = (value: string) => {
    if (!value) return null
    if (value.length < 2) return "error"
    return "success"
  }

  const FieldStatusIcon = ({ status }: { status: "success" | "error" | null }) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Wyszukiwanie lokalizacji */}
      <div className="relative">
        <FormField
          control={control}
          name="location.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Miasto / Miejscowość
                <div className="flex items-center gap-2">
                  <FieldStatusIcon status={getFieldStatus(field.value)} />
                  {isGoogleMapsLoaded && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      Google Maps
                    </Badge>
                  )}
                </div>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    placeholder="Wpisz nazwę miasta..."
                    className={cn(
                      "pl-10",
                      getFieldStatus(field.value) === "success" && "border-green-500"
                    )}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      if (!isGoogleMapsLoaded) {
                        searchLocation(e.target.value)
                      }
                    }}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
              </FormControl>
              <FormDescription>
                {isGoogleMapsLoaded 
                  ? "Wpisz nazwę miasta - automatyczne podpowiedzi z Google Maps"
                  : "Wpisz co najmniej 3 znaki, aby wyszukać miasto"
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sugestie (fallback gdy Google Maps nie jest dostępne) */}
        {!isGoogleMapsLoaded && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <div>
                    <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                    <div className="text-sm text-gray-500">{suggestion.display_name}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Szczegóły lokalizacji */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kod pocztowy */}
        <FormField
          control={control}
          name="location.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Kod pocztowy
                <FieldStatusIcon status={getFieldStatus(field.value)} />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="8001"
                  {...field}
                  className={cn(
                    getFieldStatus(field.value) === "success" && "border-green-500"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kraj */}
        <FormField
          control={control}
          name="location.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kraj</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  readOnly
                  className="bg-gray-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Podgląd wybranej lokalizacji */}
      {watchedLocation?.coordinates?.lat && watchedLocation?.coordinates?.lng && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Wybrana lokalizacja
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Miasto:</strong> {watchedLocation.city}</p>
              <p><strong>Kod pocztowy:</strong> {watchedLocation.postalCode}</p>
              <p><strong>Kraj:</strong> {watchedLocation.country}</p>
              <p><strong>Współrzędne:</strong> {watchedLocation.coordinates.lat.toFixed(6)}, {watchedLocation.coordinates.lng.toFixed(6)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informacje o prywatności */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Prywatność lokalizacji</h4>
          <p className="text-sm text-blue-700">
            Dokładny adres nie będzie widoczny publicznie. Potencjalni kupcy zobaczą tylko 
            ogólną lokalizację (miasto i kod pocztowy) do momentu nawiązania kontaktu.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}