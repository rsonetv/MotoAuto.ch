"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { ModernListingFormValues } from "@/lib/schemas/modern-listing-schema"
import { cn } from "@/lib/utils"

export function VehicleSpecs() {
  const { control, watch } = useFormContext<ModernListingFormValues>()
  
  const watchedCategory = watch("mainCategory")
  const watchedFuelType = watch("fuelType")

  // Rodzaje paliwa w zależności od kategorii
  const getFuelTypes = () => {
    if (watchedCategory === "MOTOCYKLE") {
      return [
        { value: "Benzyna", label: "⛽ Benzyna" },
        { value: "Elektryczny", label: "🔋 Elektryczny" },
        { value: "Hybryda", label: "🔋⛽ Hybryda" },
      ]
    }
    
    return [
      { value: "Benzyna", label: "⛽ Benzyna" },
      { value: "Diesel", label: "🛢️ Diesel" },
      { value: "Elektryczny", label: "🔋 Elektryczny" },
      { value: "Hybryda", label: "🔋⛽ Hybryda" },
      { value: "Plug-in Hybrid", label: "🔌 Plug-in Hybrid" },
      { value: "LPG", label: "🔥 LPG" },
      { value: "CNG", label: "💨 CNG" },
    ]
  }

  // Rodzaje skrzyni biegów
  const getTransmissionTypes = () => {
    if (watchedCategory === "MOTOCYKLE") {
      return [
        { value: "Manualna", label: "🔧 Manualna" },
        { value: "Automatyczna", label: "⚙️ Automatyczna" },
        { value: "Półautomatyczna", label: "🔄 Półautomatyczna" },
      ]
    }
    
    return [
      { value: "Manualna", label: "🔧 Manualna" },
      { value: "Automatyczna", label: "⚙️ Automatyczna" },
      { value: "CVT", label: "🔄 CVT" },
      { value: "DSG", label: "⚡ DSG" },
      { value: "Tiptronic", label: "🎯 Tiptronic" },
    ]
  }

  // Stany pojazdu
  const conditionTypes = [
    { value: "Nowy", label: "✨ Nowy" },
    { value: "Używany - bardzo dobry", label: "🌟 Używany - bardzo dobry" },
    { value: "Używany - dobry", label: "👍 Używany - dobry" },
    { value: "Używany - zadowalający", label: "👌 Używany - zadowalający" },
    { value: "Uszkodzony", label: "⚠️ Uszkodzony" },
    { value: "Do remontu", label: "🔧 Do remontu" },
  ]

  // Walidacja inline
  const getFieldStatus = (value: number | undefined, min: number = 0) => {
    if (value === undefined) return null
    if (value <= min) return "error"
    return "success"
  }

  const FieldStatusIcon = ({ status }: { status: "success" | "error" | null }) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Pojemność silnika */}
      <FormField
        control={control}
        name="engineCapacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Pojemność silnika
              <div className="flex items-center gap-1">
                <FieldStatusIcon status={getFieldStatus(field.value)} />
                <Badge variant="outline" className="text-xs">
                  {watchedCategory === "MOTOCYKLE" ? "cm³" : "L"}
                </Badge>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={watchedCategory === "MOTOCYKLE" ? "600" : "2.0"}
                {...field}
                className={cn(
                  getFieldStatus(field.value) === "success" && "border-green-500",
                  getFieldStatus(field.value) === "error" && "border-red-500"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Moc */}
      <FormField
        control={control}
        name="power"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Moc silnika
              <div className="flex items-center gap-1">
                <FieldStatusIcon status={getFieldStatus(field.value)} />
                <Badge variant="outline" className="text-xs">KM</Badge>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="150"
                {...field}
                className={cn(
                  getFieldStatus(field.value) === "success" && "border-green-500",
                  getFieldStatus(field.value) === "error" && "border-red-500"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rodzaj paliwa */}
      <FormField
        control={control}
        name="fuelType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Rodzaj paliwa
              <FieldStatusIcon status={field.value ? "success" : null} />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz paliwo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getFuelTypes().map((fuel) => (
                  <SelectItem key={fuel.value} value={fuel.value}>
                    {fuel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Skrzynia biegów */}
      <FormField
        control={control}
        name="transmission"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Skrzynia biegów
              <FieldStatusIcon status={field.value ? "success" : null} />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz skrzynię" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getTransmissionTypes().map((transmission) => (
                  <SelectItem key={transmission.value} value={transmission.value}>
                    {transmission.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Stan pojazdu */}
      <FormField
        control={control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Stan pojazdu
              <FieldStatusIcon status={field.value ? "success" : null} />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz stan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {conditionTypes.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Placeholder dla wyrównania siatki */}
      <div className="hidden lg:block"></div>

      {/* Historia pojazdu */}
      <div className="md:col-span-2 lg:col-span-3">
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Historia pojazdu
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bezwypadkowy */}
            <FormField
              control={control}
              name="accidentFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      Bezwypadkowy
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Pojazd nie miał żadnych kolizji ani wypadków
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Książka serwisowa */}
            <FormField
              control={control}
              name="hasServiceBook"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      Książka serwisowa
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Pojazd posiada kompletną dokumentację serwisową
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Informacje dodatkowe dla pojazdów elektrycznych */}
      {(watchedFuelType === "Elektryczny" || watchedFuelType === "Hybryda" || watchedFuelType === "Plug-in Hybrid") && (
        <div className="md:col-span-2 lg:col-span-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              🔋 Informacje o napędzie elektrycznym
            </h4>
            <p className="text-sm text-blue-700">
              Dla pojazdów z napędem elektrycznym lub hybrydowym, dodatkowe informacje o baterii, 
              zasięgu i ładowaniu można podać w opisie pojazdu.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}