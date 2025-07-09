"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CURRENCIES } from "@/lib/constants"
import type { UnifiedVehicleFormValues } from "@/lib/schemas/unified-vehicle-schema"

export function VehiclePricing() {
  const { control, watch } = useFormContext<UnifiedVehicleFormValues>()
  const saleType = watch("saleType")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cena i sprzedaż
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sale Type */}
        <FormField
          control={control}
          name="saleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typ sprzedaży *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ sprzedaży" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Kup Teraz">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">💰 Kup Teraz</span>
                      <span className="text-sm text-gray-500">Sprzedaż za stałą cenę</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Aukcja">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">🔨 Aukcja</span>
                      <span className="text-sm text-gray-500">Licytacja z ceną wywoławczą</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price and Currency */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{saleType === "Aukcja" ? "Cena wywoławcza *" : "Cena *"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 25000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waluta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Auction-specific fields */}
        {saleType === "Aukcja" && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900">Ustawienia aukcji</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="minBidIncrement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimalna kwota postąpienia *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="np. 100"
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
                name="auctionEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data zakończenia aukcji *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
