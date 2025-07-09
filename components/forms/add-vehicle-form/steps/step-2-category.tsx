"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Star, Car, Bike } from "lucide-react"
import {
  VEHICLE_CATEGORIES,
  VEHICLE_MODELS,
  CAR_BODY_TYPES,
  CAR_SEGMENTS,
  MOTORCYCLE_TYPES,
  MOTORCYCLE_CAPACITIES,
  MOTORCYCLE_LICENSE_CATEGORIES,
} from "@/lib/constants"
import type { AddVehicleFormValues } from "@/lib/schemas/add-vehicle-schema"

export function Step2Category() {
  const { control, watch, setValue } = useFormContext<AddVehicleFormValues>()
  const [brandSearch, setBrandSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")

  const mainCategory = watch("mainCategory")
  const selectedBrand = watch("brand")
  const selectedModel = watch("model")

  // Get available brands based on category
  const getAvailableBrands = () => {
    if (mainCategory === "SAMOCHODY") {
      return Object.entries(VEHICLE_CATEGORIES.SAMOCHODY).flatMap(([category, brands]) =>
        brands.map((brand) => ({ brand, category })),
      )
    } else {
      return Object.entries(VEHICLE_CATEGORIES.MOTOCYKLE).flatMap(([category, brands]) =>
        brands.map((brand) => ({ brand, category })),
      )
    }
  }

  const filteredBrands = getAvailableBrands().filter(({ brand }) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase()),
  )

  // Get models for selected brand
  const getModelsForBrand = (brand: string) => {
    return VEHICLE_MODELS[brand as keyof typeof VEHICLE_MODELS] || []
  }

  const filteredModels = getModelsForBrand(selectedBrand).filter((model) =>
    model.toLowerCase().includes(modelSearch.toLowerCase()),
  )

  const getBrandCategory = (brand: string) => {
    const allBrands = getAvailableBrands()
    return allBrands.find((b) => b.brand === brand)?.category || ""
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes("Premium")) return <Star className="h-3 w-3 text-yellow-500" />
    return null
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Premium":
        return "bg-yellow-100 text-yellow-800"
      case "Główne":
        return "bg-blue-100 text-blue-800"
      case "Specjalistyczne":
        return "bg-purple-100 text-purple-800"
      case "Japońskie":
        return "bg-red-100 text-red-800"
      case "Europejskie":
        return "bg-green-100 text-green-800"
      case "Amerykańskie":
        return "bg-orange-100 text-orange-800"
      case "Inne":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Vehicle Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            {mainCategory === "SAMOCHODY" ? (
              <Car className="h-5 w-5 text-blue-600" />
            ) : (
              <Bike className="h-5 w-5 text-green-600" />
            )}
            <h3 className="text-lg font-semibold">
              {mainCategory === "SAMOCHODY" ? "Dane samochodu" : "Dane motocykla"}
            </h3>
          </div>

          {/* Brand Selection */}
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka *</FormLabel>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Szukaj marki..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {filteredBrands.map(({ brand, category }) => (
                      <Button
                        key={brand}
                        type="button"
                        variant={field.value === brand ? "default" : "outline"}
                        className="justify-between h-auto p-3"
                        onClick={() => {
                          field.onChange(brand)
                          setValue("model", "") // Reset model when brand changes
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span>{brand}</span>
                        </div>
                        <Badge className={getCategoryColor(category)} variant="secondary">
                          {category}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model Selection */}
          {selectedBrand && (
            <FormField
              control={control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model *</FormLabel>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Szukaj modelu..."
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {filteredModels.map((model) => (
                        <Button
                          key={model}
                          type="button"
                          variant={field.value === model ? "default" : "outline"}
                          className="justify-start h-auto p-3"
                          onClick={() => field.onChange(model)}
                        >
                          {model}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Basic Vehicle Data */}
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
                      min="1900"
                      max={new Date().getFullYear() + 1}
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
                      min="0"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category-specific fields */}
          {mainCategory === "SAMOCHODY" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pojemność silnika (cm³) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="np. 2000"
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
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rodzaj nadwozia *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz rodzaj nadwozia" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Segment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CAR_SEGMENTS.map((segment) => (
                            <SelectItem key={segment} value={segment}>
                              {segment}
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
                  name="doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liczba drzwi</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Drzwi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[2, 3, 4, 5].map((doors) => (
                            <SelectItem key={doors} value={doors.toString()}>
                              {doors}
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
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liczba miejsc</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Miejsca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[2, 4, 5, 7, 8, 9].map((seats) => (
                            <SelectItem key={seats} value={seats.toString()}>
                              {seats}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pojemność silnika *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz pojemność" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOTORCYCLE_CAPACITIES.map((capacity) => (
                            <SelectItem key={capacity} value={capacity}>
                              {capacity}
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
                  name="motorcycleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rodzaj motocykla *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz rodzaj" />
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
              </div>

              <FormField
                control={control}
                name="licenseCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria prawa jazdy *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        {/* Vehicle Summary Card */}
        <div className="space-y-6">
          {selectedBrand && selectedModel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {mainCategory === "SAMOCHODY" ? (
                    <Car className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Bike className="h-5 w-5 text-green-600" />
                  )}
                  Wybrany pojazd
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Marka</div>
                      <div className="font-semibold flex items-center gap-1">
                        {getCategoryIcon(getBrandCategory(selectedBrand))}
                        {selectedBrand}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Model</div>
                      <div className="font-semibold">{selectedModel}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Kategoria</div>
                    <Badge className={getCategoryColor(getBrandCategory(selectedBrand))} variant="secondary">
                      {getBrandCategory(selectedBrand)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Dostępne modele dla {selectedBrand}:</div>
                    <div className="text-xs text-gray-500">
                      {getModelsForBrand(selectedBrand).length} modeli w bazie danych
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Info Card */}
          {selectedBrand && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Informacje o marce</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kategoria:</span>
                    <Badge className={getCategoryColor(getBrandCategory(selectedBrand))} variant="secondary">
                      {getBrandCategory(selectedBrand)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dostępne modele:</span>
                    <span className="font-medium">{getModelsForBrand(selectedBrand).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Typ pojazdu:</span>
                    <span className="font-medium">{mainCategory}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
