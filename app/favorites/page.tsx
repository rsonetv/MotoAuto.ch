"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { useFavorites } from "@/hooks/use-favorites"
import { Vehicle } from "@/types"
import { VehicleGrid } from "@/components/ogloszenia/vehicle-grid"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Mock function to get vehicles by IDs
const getVehiclesByIds = async (ids: string[]): Promise<Vehicle[]> => {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return ids.map(id => ({
    id,
    title: `Samochód ${id}`,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    price: Math.floor(Math.random() * 50000) + 10000,
    mileage: Math.floor(Math.random() * 100000) + 10000,
    year: Math.floor(Math.random() * 10) + 2010,
    fuel: ["benzyna", "diesel", "elektryczny", "hybrid"][Math.floor(Math.random() * 4)] as any,
    transmission: Math.random() > 0.5 ? "manualna" : "automatyczna",
    bodyType: ["Sedan", "SUV", "Kombi", "Hatchback"][Math.floor(Math.random() * 4)],
    brand: ["BMW", "Audi", "Mercedes", "Volkswagen"][Math.floor(Math.random() * 4)],
    model: `Model ${Math.floor(Math.random() * 10)}`,
    images: ["/placeholder.jpg"],
    location: ["Zürich", "Bern", "Geneva", "Basel"][Math.floor(Math.random() * 4)],
    sellerId: "seller-" + Math.floor(Math.random() * 1000),
    sellerName: "Sprzedawca " + Math.floor(Math.random() * 100),
    category: Math.random() > 0.5 ? "auto" : "moto",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    views: Math.floor(Math.random() * 1000),
    favorites: Math.floor(Math.random() * 100),
    features: ["ABS", "ESP", "Klimatyzacja", "Podgrzewane fotele"],
    listingType: Math.random() > 0.7 ? "aukcja" : "ogłoszenie",
  }))
}

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (favorites.length === 0) {
        setVehicles([])
        setIsLoading(false)
        return
      }

      try {
        const vehicleData = await getVehiclesByIds(favorites)
        setVehicles(vehicleData)
      } catch (error) {
        console.error("Error loading favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [favorites])

  const handleClearAll = () => {
    // This would clear all favorites
    // In a real app, you'd want a confirmation dialog
    favorites.forEach(id => removeFromFavorites(id))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <Breadcrumbs 
            items={[
              { label: "Ulubione" }
            ]}
            className="mb-6"
          />
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Twoje ulubione pojazdy</h1>
              <p className="text-muted-foreground">
                {favorites.length === 0 
                  ? "Nie masz jeszcze żadnych ulubionych pojazdów" 
                  : `Zapisane pojazdy: ${favorites.length}`}
              </p>
            </div>
            
            {favorites.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Wyczyść wszystkie
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted" />
              <h2 className="text-xl font-semibold mb-2">Twoja lista ulubionych jest pusta</h2>
              <p className="text-muted-foreground mb-6">
                Dodaj pojazdy do ulubionych, klikając ikonę serca na ogłoszeniach
              </p>
              <Button asChild>
                <a href="/ogloszenia">Przeglądaj ogłoszenia</a>
              </Button>
            </div>
          ) : (
            <VehicleGrid vehicles={vehicles} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}