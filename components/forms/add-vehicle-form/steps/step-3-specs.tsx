"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FUEL_TYPES, TRANSMISSION_TYPES, DRIVE_TYPES, VEHICLE_CONDITIONS, COUNTRIES } from "@/lib/constants"
import type { AddVehicleFormValues } from "@/lib/schemas/add-vehicle-schema"

export function Step3Specs() {
  const { control, watch } = useFormContext<AddVehicleFormValues>()
  const mainCategory = watch("mainCategory")
  const [vinChecking, setVinChecking] = useState(false)
  const [vinResult, setVinResult] = useState<{ valid: boolean; message: string } | null>(null)

  const handleVinCheck = async (vin: string) => {
    if (!vin || vin.length !== 17) return

    setVinChecking(true)
    // Simulate VIN API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock VIN validation
    const isValid = vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin)
    setVinResult({
      valid: isValid,
      message: isValid ? "VIN jest prawidłowy i zweryfikowany" : "VIN zawiera nieprawidłowe znaki lub format",
    })
    setVinChecking(false)
  }

  return (
    <div className="space-y-8">
      {/* Specyfikacja techniczna */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Specyfikacja techniczna</h3>

        {/* VIN */}
        <FormField
          control={control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                VIN (Vehicle Identification Number)
                <Badge variant="secondary" className="text-xs">
                  Opcjonalne
                </Badge>
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="17-znakowy numer VIN"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase())
                      setVinResult(null)
                    }}
                    className="h-12 text-base font-mono"
                    maxLength={17}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleVinCheck(field.value || "")}
                  disabled={!field.value || field.value.length !== 17 || vinChecking}
                  className="h-12 px-6"
                >
                  {vinChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sprawdź VIN"}
                </Button>
              </div>

              {vinResult && (
                <Alert className={vinResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center gap-2">
                    {vinResult.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={vinResult.valid ? "text-green-800" : "text-red-800"}>
                      {vinResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <p className="text-sm text-gray-500">VIN pomaga w weryfikacji pojazdu i zwiększa zaufanie kupujących</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Moc i paliwo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="power"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moc (KM) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="np. 150"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rodzaj paliwa *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Wybierz rodzaj paliwa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_TYPES.map((type) => (
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

        {/* Skrzynia i napęd */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skrzynia biegów *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Wybierz skrzynię biegów" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TRANSMISSION_TYPES.map((type) => (
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

          {mainCategory === "SAMOCHODY" && (
            <FormField
              control={control}
              name="driveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Napęd *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Wybierz rodzaj napędu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DRIVE_TYPES.map((type) => (
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
        </div>

        {/* Stan pojazdu */}
        <FormField
          control={control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stan pojazdu *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Wybierz stan pojazdu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VEHICLE_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      <div className="flex items-center gap-2">
                        {condition === "Nowy" && <Badge className="bg-green-100 text-green-800">Nowy</Badge>}
                        {condition === "Używany" && <Badge variant="secondary">Używany</Badge>}
                        {condition === "Uszkodzony" && (
                          <Badge className="bg-orange-100 text-orange-800">Uszkodzony</Badge>
                        )}
                        {condition === "Po kolizji" && <Badge className="bg-red-100 text-red-800">Po kolizji</Badge>}
                        {condition === "Do remontu" && (
                          <Badge className="bg-yellow-100 text-yellow-800">Do remontu</Badge>
                        )}
                        <span>{condition}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Historia pojazdu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Historia pojazdu
          </CardTitle>
          <CardDescription>Szczegółowe informacje o historii pojazdu zwiększają zaufanie kupujących</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="ownersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liczba właścicieli</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 1"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      className="h-12 text-base"
                      min="0"
                      max="10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pochodzenie pojazdu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Wybierz kraj pochodzenia" />
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
          </div>

          <div className="space-y-4">
            <FormField
              control={control}
              name="hasServiceBook"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Książka serwisowa</FormLabel>
                    <p className="text-sm text-gray-500">Pojazd posiada kompletną książkę serwisową</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="accidentFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Bezwypadkowy</FormLabel>
                    <p className="text-sm text-gray-500">Pojazd nie brał udziału w żadnych kolizjach ani wypadkach</p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
