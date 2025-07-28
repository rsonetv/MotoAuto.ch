"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface LocationData {
  address: string
  lat: number
  lng: number
  place_id: string
}

interface GoogleMapsLocationPickerProps {
  onLocationSelect: (location: LocationData) => void
}

export function GoogleMapsLocationPicker({ onLocationSelect }: GoogleMapsLocationPickerProps) {
  const [address, setAddress] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [isLoaded])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Initialize map centered on Switzerland
    const map = new google.maps.Map(mapRef.current, {
      zoom: 8,
      center: { lat: 46.8182, lng: 8.2275 }, // Switzerland center
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    mapInstanceRef.current = map

    // Initialize marker
    const marker = new google.maps.Marker({
      map,
      draggable: true,
    })

    markerRef.current = marker

    // Initialize autocomplete
    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ch' }, // Restrict to Switzerland
        fields: ['place_id', 'geometry', 'formatted_address'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        
        if (!place.geometry || !place.geometry.location) {
          return
        }

        const location = place.geometry.location
        const lat = location.lat()
        const lng = location.lng()

        // Update map and marker
        map.panTo(location)
        map.setZoom(14)
        marker.setPosition(location)

        // Update address input
        const formattedAddress = place.formatted_address || ""
        setAddress(formattedAddress)

        // Notify parent component
        onLocationSelect({
          address: formattedAddress,
          lat,
          lng,
          place_id: place.place_id || "",
        })
      })
    }

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      if (!position) return

      const lat = position.lat()
      const lng = position.lng()

      // Reverse geocoding to get address
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const formattedAddress = results[0].formatted_address
          setAddress(formattedAddress)
          
          onLocationSelect({
            address: formattedAddress,
            lat,
            lng,
            place_id: results[0].place_id || "",
          })
        }
      })
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address-input">Adres *</Label>
        <Input
          ref={inputRef}
          id="address-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Miasto, ulica, nr domu"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Zacznij pisać adres, aby zobaczyć podpowiedzi
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div 
          ref={mapRef}
          className="w-full h-64 bg-muted flex items-center justify-center"
        >
          {!isLoaded ? (
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Ładowanie mapy...</p>
            </div>
          ) : null}
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">
        💡 Możesz przeciągnąć marker na mapie, aby dokładnie określić lokalizację
      </p>
    </div>
  )
}