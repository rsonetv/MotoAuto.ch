"use client"

import { useEffect, useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import { COUNTRIES } from "@/lib/constants"

interface LocationSectionProps {
  form: UseFormReturn<any>
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function LocationSection({ form }: LocationSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Inicjalizacja Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      // Sprawdź czy skrypt już istnieje
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      
      window.initMap = initializeMap
      
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return

      // Inicjalizacja mapy (centrum na Szwajcarii)
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 8,
        center: { lat: 46.8182, lng: 8.2275 }, // Centrum Szwajcarii
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      mapInstanceRef.current = map

      // Inicjalizacja markera
      const marker = new window.google.maps.Marker({
        map: map,
        draggable: true,
      })

      markerRef.current = marker

      // Obsługa przeciągania markera
      marker.addListener('dragend', () => {
        const position = marker.getPosition()
        if (position) {
          form.setValue('location.lat', position.lat())
          form.setValue('location.lng', position.lng())
          
          // Reverse geocoding
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: position }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const addressComponents = results[0].address_components
              const city = addressComponents.find((comp: any) => 
                comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
              )?.long_name || ''
              
              const postalCode = addressComponents.find((comp: any) => 
                comp.types.includes('postal_code')
              )?.long_name || ''

              if (city) form.setValue('location.city', city)
              if (postalCode) form.setValue('location.postalCode', postalCode)
              form.setValue('location.address', results[0].formatted_address)
            }
          })
        }
      })

      // Inicjalizacja autocomplete
      const addressInput = document.getElementById('address-input') as HTMLInputElement
      if (addressInput) {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
          types: ['address'],
          componentRestrictions: { country: ['ch', 'de', 'at', 'fr', 'it'] }, // Ograniczenie do krajów europejskich
        })

        autocompleteRef.current = autocomplete

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (!place.geometry) return

          // Aktualizacja mapy
          map.panTo(place.geometry.location)
          map.setZoom(14)
          marker.setPosition(place.geometry.location)

          // Aktualizacja formularza
          const addressComponents = place.address_components || []
          
          const city = addressComponents.find((comp: any) => 
            comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
          )?.long_name || ''
          
          const postalCode = addressComponents.find((comp: any) => 
            comp.types.includes('postal_code')
          )?.long_name || ''

          const country = addressComponents.find((comp: any) => 
            comp.types.includes('country')
          )?.long_name || ''

          form.setValue('location.address', place.formatted_address || '')
          form.setValue('location.city', city)
          form.setValue('location.postalCode', postalCode)
          form.setValue('location.lat', place.geometry.location.lat())
          form.setValue('location.lng', place.geometry.location.lng())
          form.setValue('location.placeId', place.place_id || '')
          
          // Mapowanie nazw krajów
          const countryMapping: { [key: string]: string } = {
            'Switzerland': 'Szwajcaria',
            'Germany': 'Niemcy',
            'Austria': 'Austria',
            'France': 'Francja',
            'Italy': 'Włochy',
          }
          
          if (countryMapping[country]) {
            form.setValue('location.country', countryMapping[country])
          }
        })
      }

      setIsMapLoaded(true)
    }

    loadGoogleMaps()
  }, [form])

  // Funkcja do pobierania aktualnej lokalizacji
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.')
      return
    }

    setIsLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        if (mapInstanceRef.current && markerRef.current) {
          const location = { lat: latitude, lng: longitude }
          
          mapInstanceRef.current.panTo(location)
          mapInstanceRef.current.setZoom(14)
          markerRef.current.setPosition(location)
          
          form.setValue('location.lat', latitude)
          form.setValue('location.lng', longitude)

          // Reverse geocoding
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const addressComponents = results[0].address_components
              
              const city = addressComponents.find((comp: any) => 
                comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
              )?.long_name || ''
              
              const postalCode = addressComponents.find((comp: any) => 
                comp.types.includes('postal_code')
              )?.long_name || ''

              form.setValue('location.address', results[0].formatted_address)
              if (city) form.setValue('location.city', city)
              if (postalCode) form.setValue('location.postalCode', postalCode)
            }
          })
        }
        
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki.')
        setIsLoadingLocation(false)
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Podstawowe dane lokalizacji */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lokalizacja pojazdu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="location.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kraj *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kraj" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miasto *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="np. Zürich"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kod pocztowy</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="np. 8001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wyszukiwanie adresu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dokładny adres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      id="address-input"
                      placeholder="Wpisz adres, miasto lub kod pocztowy"
                      {...field}
                      className="flex-1"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="shrink-0"
                  >
                    <Navigation className="w-4 h-4" />
                    {isLoadingLocation ? "Lokalizuję..." : "Moja lokalizacja"}
                  </Button>
                </div>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Wpisz adres lub użyj przycisku "Moja lokalizacja" aby automatycznie wykryć położenie
                </p>
              </FormItem>
            )}
          />

          {/* Mapa Google */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lokalizacja na mapie</label>
            <div 
              ref={mapRef}
              className="w-full h-64 bg-gray-100 rounded-lg border"
              style={{ minHeight: '256px' }}
            >
              {!isMapLoaded && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Ładowanie mapy...
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Przeciągnij czerwony marker, aby dokładnie określić lokalizację pojazdu
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informacje o prywatności */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-yellow-900 mb-2">🔒 Informacje o prywatności</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Dokładny adres nie będzie widoczny w ogłoszeniu</li>
            <li>• Kupujący zobaczą tylko miasto i przybliżoną lokalizację</li>
            <li>• Dokładny adres zostanie udostępniony tylko po kontakcie</li>
            <li>• Możesz wskazać miejsce spotkania inne niż lokalizacja pojazdu</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}