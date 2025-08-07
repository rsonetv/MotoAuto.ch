"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Bike, Truck, Wand2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VEHICLE_CATEGORIES, VEHICLE_MODELS } from "@/lib/constants"
import type { UnifiedVehicleFormValues } from "@/lib/schemas/unified-vehicle-schema"

export function VehicleBasicInfo() {
  const { control, watch, setValue } = useFormContext<UnifiedVehicleFormValues>()

  const mainCategory = watch("mainCategory")
  const selectedBrand = watch("brand")
  const selectedModel = watch("model")
  const selectedYear = watch("year")
  const selectedMileage = watch("mileage")

  const getAvailableBrands = () => {
    const categoryMap = {
      SAMOCHODY: VEHICLE_CATEGORIES.SAMOCHODY,
      MOTOCYKLE: VEHICLE_CATEGORIES.MOTOCYKLE,
      DOSTAWCZE: VEHICLE_CATEGORIES.SAMOCHODY, // Tymczasowo używamy tych samych marek co dla SAMOCHODY
    }
    const currentCategory = categoryMap[mainCategory as keyof typeof categoryMap] || {}
    return Object.values(currentCategory).flat()
  }

  const getModelsForBrand = (brand: string) => {
    return VEHICLE_MODELS[brand as keyof typeof VEHICLE_MODELS] || []
  }

  const generateAutoTitle = () => {
    if (selectedBrand && selectedModel && selectedYear) {
      const mileageText = selectedMileage ? `, ${selectedMileage.toLocaleString()} km` : ""
      const autoTitle = `${selectedBrand} ${selectedModel}, ${selectedYear}${mileageText}`
      setValue("title", autoTitle)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Podstawowe informacje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <FormField
          control={control}
          name="mainCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria pojazdu *</FormLabel>
              <FormControl>
                <Tabs
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    setValue("brand", "")
                    setValue("model", "")
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-12">
                    <TabsTrigger value="SAMOCHODY" className="flex items-center gap-2">
                      <Car className="h-4 w-4" /> Samochody
                    </TabsTrigger>
                    <TabsTrigger value="MOTOCYKLE" className="flex items-center gap-2">
                      <Bike className="h-4 w-4" /> Motocykle
                    </TabsTrigger>
                    <TabsTrigger value="DOSTAWCZE" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Dostawcze
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand and Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setValue("model", "")
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz markę" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAvailableBrands().map((brand: string) => (
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

          <FormField
            control={control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBrand}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getModelsForBrand(selectedBrand).map((model: string) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Year and Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rok produkcji *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="np. 2020"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Przebieg (km) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="np. 50000"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Title */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł ogłoszenia *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="np. BMW Seria 3 320d, 2020, Idealny stan" {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateAutoTitle}
                  disabled={!selectedBrand || !selectedModel || !selectedYear}
                  className="px-3 bg-transparent"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szczegółowy opis *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Opisz szczegółowo stan techniczny, historię serwisową i wyposażenie pojazdu..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       <Alert>
         <Lightbulb className="h-4 w-4" />
         <AlertTitle>Stwórz wyczerpujący opis</AlertTitle>
         <AlertDescription>
           Im więcej szczegółów, tym lepiej! Podaj informacje o historii serwisowej, ewentualnych usterkach, unikalnych cechach czy przeprowadzonych modyfikacjach. To buduje zaufanie.
         </AlertDescription>
       </Alert>
      </CardContent>
    </Card>
  )
}
