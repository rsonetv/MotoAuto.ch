"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface GoogleMapsLocationPickerProps {
  onLocationSelected: (locationData: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
    city: string;
  }) => void;
  defaultAddress?: string;
}

export function GoogleMapsLocationPicker({ 
  onLocationSelected, 
  defaultAddress 
}: GoogleMapsLocationPickerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [address, setAddress] = useState(defaultAddress || "")
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    // Load Google Maps script dynamically
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!googleMapsApiKey) {
      toast.error("Google Maps API key is not configured")
      return
    }
    
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = initMap
    
    document.head.appendChild(script)
    
    return () => {
      document.head.removeChild(script)
    }
  }, [])
  
  const initMap = () => {
    if (!mapRef.current) return
    
    const defaultLocation = { lat: 47.3769, lng: 8.5417 } // Zurich, Switzerland
    
    // Create map instance
    const map = new google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: false
    })
    
    mapInstanceRef.current = map
    
    // Create marker
    const marker = new google.maps.Marker({
      map,
      position: defaultLocation,
      draggable: true
    })
    
    markerRef.current = marker
    
    // Handle marker drag events
    marker.addListener("dragend", () => {
      const position = marker.getPosition()
      if (position) {
        reverseGeocode(position.lat(), position.lng())
      }
    })
    
    // Set up autocomplete if input exists
    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ch' }
      })
      
      autocompleteRef.current = autocomplete
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        
        if (!place.geometry || !place.geometry.location) {
          toast.error("Cannot find that address. Please try again.")
          return
        }
        
        // Update map and marker
        map.setCenter(place.geometry.location)
        map.setZoom(17)
        marker.setPosition(place.geometry.location)
        
        // Extract city from address components
        let city = ""
        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes("locality")) {
              city = component.long_name
              break
            }
          }
        }
        
        // Notify parent component
        onLocationSelected({
          address: place.formatted_address || "",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || "",
          city
        })
      })
    }
    
    setIsLoaded(true)
  }
  
  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder()
    
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const place = results[0]
        
        // Update input value
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address || ""
          setAddress(place.formatted_address || "")
        }
        
        // Extract city from address components
        let city = ""
        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes("locality")) {
              city = component.long_name
              break
            }
          }
        }
        
        // Notify parent component
        onLocationSelected({
          address: place.formatted_address || "",
          lat,
          lng,
          placeId: place.place_id || "",
          city
        })
      } else {
        toast.error("Could not find address for this location")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Adres *</Label>
        <Input
          ref={inputRef}
          id="address"
          placeholder="Wpisz adres (np. Zurich, Bahnhofstrasse 1)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-[300px] rounded-md border border-gray-300 relative"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Przesuń marker, aby dokładnie określić lokalizację
      </p>
    </div>
  )
}
