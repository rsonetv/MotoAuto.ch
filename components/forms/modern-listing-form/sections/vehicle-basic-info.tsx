"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { ModernListingFormValues, getModelsForBrand, bmwModels } from "@/lib/schemas/modern-listing-schema"
import { cn } from "@/lib/utils"

interface VehicleBasicInfoProps {
  onBrandChange: (brand: string) => void
}

export function VehicleBasicInfo({ onBrandChange }: VehicleBasicInfoProps) {
  const { control, watch, setValue } = useFormContext<ModernListingFormValues>()
  
  const watchedBrand = watch("brand")
  const watchedCategory = watch("mainCategory")
  const watchedTitle = watch("title")
  const watchedDescription = watch("description")

  // Dostępne marki
  const brands = [
    "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Toyota", "Honda", 
    "Ford", "Opel", "Peugeot", "Renault", "Fiat", "Skoda", "Hyundai",
    "BMW Motorrad", "Yamaha", "Kawasaki", "Suzuki", "Ducati", "Harley-Davidson"
  ]

  // Pobierz modele dla wybranej marki
  const getAvailableModels = () => {
    if (watchedBrand === "BMW") {
      const models = getModelsForBrand("BMW", watchedCategory)
      return Object.keys(models)
    }
    return []
  }

  // Pobierz warianty dla wybranego modelu BMW
  const getBMWVariants = (model: string) => {
    if (watchedBrand === "BMW" && model) {
      const models = watchedCategory === "SAMOCHODY" ? bmwModels.samochody : bmwModels.motocykle
      return models[model as keyof typeof models] || []
    }
    return []
  }

  const handleBrandChange = (brand: string) => {
    setValue("brand", brand)
    setValue("model", "") // Reset model when brand changes
    onBrandChange(brand)
  }

  // Walidacja inline
  const getFieldStatus = (value: string, minLength: number) => {
    if (!value) return null
    if (value.length < minLength) return "error"
    return "success"
  }

  const FieldStatusIcon = ({ status }: { status: "success" | "error" | null }) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tytuł ogłoszenia */}
      <div className="md:col-span-2">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Tytuł ogłoszenia
                <div className="flex items-center gap-2">
                  <FieldStatusIcon status={getFieldStatus(field.value, 10)} />
                  <Badge variant="outline" className="text-xs">
                    {field.value.length}/100
                  </Badge>
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="np. BMW 320i Sedan, 2020r, bezwypadkowy"
                  {...field}
                  className={cn(
                    getFieldStatus(field.value, 10) === "error" && "border-red-500",
                    getFieldStatus(field.value, 10) === "success" && "border-green-500"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Kategoria główna */}
      <FormField
        control={control}
        name="mainCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kategoria pojazdu</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SAMOCHODY">🚗 Samochody osobowe</SelectItem>
                <SelectItem value="MOTOCYKLE">🏍️ Motocykle</SelectItem>
                <SelectItem value="DOSTAWCZE">🚐 Pojazdy dostawcze</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Typ sprzedaży */}
      <FormField
        control={control}
        name="saleType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Typ sprzedaży</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ sprzedaży" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Kup Teraz">💰 Kup Teraz</SelectItem>
                <SelectItem value="Aukcja">🔨 Aukcja</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Marka */}
      <FormField
        control={control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Marka pojazdu
              <FieldStatusIcon status={field.value ? "success" : null} />
            </FormLabel>
            <Select onValueChange={handleBrandChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz markę" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Model */}
      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Model pojazdu
              <FieldStatusIcon status={field.value ? "success" : null} />
            </FormLabel>
            {watchedBrand === "BMW" ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz model BMW" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getAvailableModels().map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                <Input
                  placeholder="Wpisz model pojazdu"
                  {...field}
                  className={cn(
                    field.value && "border-green-500"
                  )}
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rok produkcji */}
      <FormField
        control={control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Rok produkcji
              <FieldStatusIcon status={field.value && field.value >= 1900 ? "success" : null} />
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
                {...field}
                className={cn(
                  field.value && field.value >= 1900 && "border-green-500"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Przebieg */}
      <FormField
        control={control}
        name="mileage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Przebieg (km)
              <FieldStatusIcon status={field.value !== undefined && field.value >= 0 ? "success" : null} />
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="50000"
                min="0"
                {...field}
                className={cn(
                  field.value !== undefined && field.value >= 0 && "border-green-500"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Opis */}
      <div className="md:col-span-2">
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Opis pojazdu
                <div className="flex items-center gap-2">
                  <FieldStatusIcon status={getFieldStatus(field.value, 50)} />
                  <Badge variant="outline" className="text-xs">
                    {field.value.length}/5000
                  </Badge>
                </div>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Opisz szczegółowo stan pojazdu, historię serwisową, wyposażenie dodatkowe..."
                  className={cn(
                    "min-h-[120px]",
                    getFieldStatus(field.value, 50) === "error" && "border-red-500",
                    getFieldStatus(field.value, 50) === "success" && "border-green-500"
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}