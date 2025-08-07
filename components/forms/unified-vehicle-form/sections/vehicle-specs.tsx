"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import {
  CAR_BODY_TYPES,
  MOTORCYCLE_TYPES,
  MOTORCYCLE_LICENSE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVE_TYPES,
  VEHICLE_CONDITIONS,
} from "@/lib/constants"
import type { UnifiedVehicleFormValues } from "@/lib/schemas/unified-vehicle-schema"

export function VehicleSpecs() {
  const { control, watch } = useFormContext<UnifiedVehicleFormValues>()
  const mainCategory = watch("mainCategory")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Specyfikacja techniczna
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engine and Power */}
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
                    placeholder="np. 1998"
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
            name="power"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moc (KM) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="np. 190"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fuel and Transmission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rodzaj paliwa *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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

          <FormField
            control={control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skrzynia biegów *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
        </div>

        {/* Category-specific fields */}
        {mainCategory === "SAMOCHODY" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="bodyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nadwozie *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          </div>
        )}

        {mainCategory === "MOTOCYKLE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="motorcycleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ motocykla *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {mainCategory === "DOSTAWCZE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="maxWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maksymalna masa (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 3500"
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
              name="loadCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ładowność (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 1000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Condition */}
        <FormField
          control={control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stan pojazdu *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Określ stan pojazdu" />
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

        {/* Vehicle History */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Historia pojazdu</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="accidentFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Bezwypadkowy</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="hasServiceBook"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Książka serwisowa</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
