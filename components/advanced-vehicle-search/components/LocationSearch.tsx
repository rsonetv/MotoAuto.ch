"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPin, Navigation } from "lucide-react"
import { useGeolocation } from "../hooks/useGeolocation"
import { formatRadius } from "../string-formatters"

interface LocationSearchProps {
  location: string
  radius: number
  onLocationChange: (location: string) => void
  onRadiusChange: (radius: number) => void
  className?: string
}

export function LocationSearch({
  location,
  radius,
  onLocationChange,
  onRadiusChange,
  className
}: LocationSearchProps) {
  const [localLocation, setLocalLocation] = useState(location)
  const { getCurrentLocation, isLoading: gpsLoading } = useGeolocation()

  const handleLocationSubmit = () => {
    onLocationChange(localLocation)
  }

  const handleGPSLocation = async () => {
    getCurrentLocation()
    // In a real app, you'd reverse geocode the coordinates to get a location name
    // For now, we'll just set a placeholder
    setLocalLocation("Moja lokalizacja")
    onLocationChange("Moja lokalizacja")
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Lokalizacja
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="location"
            placeholder="Miasto, kod pocztowy"
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            onBlur={handleLocationSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleLocationSubmit()}
            className="touch-friendly"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGPSLocation}
            disabled={gpsLoading}
            className="touch-friendly shrink-0"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Promień wyszukiwania</Label>
        <div className="px-2 pt-2">
          <Slider
            value={[radius]}
            onValueChange={(values) => onRadiusChange(values[0])}
            max={100}
            min={0}
            step={5}
            className="touch-friendly"
          />
        </div>
        <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
          <span>{formatRadius(radius)}</span>
        </div>
      </div>
    </div>
  )
}