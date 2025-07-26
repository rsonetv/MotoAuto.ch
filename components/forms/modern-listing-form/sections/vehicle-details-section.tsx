"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  VEHICLE_MODELS, 
  CAR_BODY_TYPES, 
  CAR_SEGMENTS, 
  MOTORCYCLE_TYPES, 
  MOTORCYCLE_CAPACITIES,
  MOTORCYCLE_LICENSE_CATEGORIES,
  FUEL_TYPES, 
  TRANSMISSION_TYPES, 
  DRIVE_TYPES, 
  VEHICLE_CONDITIONS 
} from "@/lib/constants"

interface VehicleDetailsSectionProps {
  form: UseFormReturn<any>
  categories: any
}

export function VehicleDetailsSection({ form, categories }: VehicleDetailsSectionProps) {
  const watchedCategory = form.watch("mainCategory")
  const watchedBrand = form.watch("brand")

  // Funkcja do pobierania marek dla wybranej kategorii
  const getBrandsForCategory = (category: string) => {
    if (!categories[category]) return []
    
    return Object.values(categories[category]).flat()
  }

  // Funkcja do pobierania modeli dla wybranej marki
  const getModelsForBrand = (brand: string) => {
    // Specjalna obsługa BMW - rozróżnienie samochodów i motocykli
    if (brand === "BMW") {
      return watchedCategory === "MOTOCYKLE" 
        ? VEHICLE_MODELS.BMWMoto || []
        : VEHICLE_MODELS.BMW || []
    }
    
    // Dla motocykli Honda używamy HondaMoto
    if (brand === "Honda" && watchedCategory === "MOTOCYKLE") {
      return VEHICLE_MODELS.HondaMoto || []
    }
    
    return VEHICLE_MODELS[brand as keyof typeof VEHICLE_MODELS] || []
  }

  const availableBrands = getBrandsForCategory(watchedCategory)
  const availableModels = getModelsForBrand(watchedBrand)

  return (
    <div className="space-y-6">
      {/* Podstawowe informacje */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł ogłoszenia *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="np. BMW 320i Sedan, 2020r, Automat, Xenon"
                    {...field}
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Dobry tytuł zwiększa szanse na sprzedaż. Podaj markę, model, rok i najważniejsze cechy.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opis pojazdu *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Opisz szczegółowo stan pojazdu, wyposażenie, historię serwisową..."
                    className="min-h-[120px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Szczegółowy opis pomoże kupującym podjąć decyzję. Minimum 50 znaków.
                </p>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Kategoria i typ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategoria pojazdu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="mainCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Główna kategoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SAMOCHODY">🚗 Samochody</SelectItem>
                    <SelectItem value="MOTOCYKLE">🏍️ Motocykle</SelectItem>
                    <SelectItem value="DOSTAWCZE">🚚 Pojazdy dostawcze</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedCategory === "SAMOCHODY" && (
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ nadwozia *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ nadwozia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAR_BODY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchedCategory === "MOTOCYKLE" && (
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ motocykla *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ motocykla" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOTORCYCLE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Marka i model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Marka i model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka *</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue("model", "") // Reset model when brand changes
                }} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz markę" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                        {brand === "BMW" && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {watchedCategory === "MOTOCYKLE" ? "Motocykle" : "Samochody"}
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedBrand}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchedBrand ? "Wybierz model" : "Najpierw wybierz markę"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {watchedBrand === "BMW" && (
                  <p className="text-sm text-muted-foreground">
                    ✅ Modele BMW są teraz poprawnie rozdzielone na samochody i motocykle
                  </p>
                )}
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Dane techniczne */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dane techniczne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rok produkcji *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="2020"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Przebieg (km)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="50000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rodzaj paliwa *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz paliwo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUEL_TYPES.map((fuel) => (
                        <SelectItem key={fuel} value={fuel}>
                          {fuel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skrzynia biegów *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz skrzynię" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSMISSION_TYPES.map((transmission) => (
                        <SelectItem key={transmission} value={transmission}>
                          {transmission}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchedCategory === "MOTOCYKLE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engineCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pojemność silnika (cm³)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="600"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria prawa jazdy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOTORCYCLE_LICENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stan pojazdu *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz stan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VEHICLE_CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}