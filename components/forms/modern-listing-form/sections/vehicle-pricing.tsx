"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, DollarSign, Clock, Gavel, Info } from "lucide-react"
import { ModernListingFormValues } from "@/lib/schemas/modern-listing-schema"
import { cn } from "@/lib/utils"

export function VehiclePricing() {
  const { control, watch } = useFormContext<ModernListingFormValues>()
  
  const watchedSaleType = watch("saleType")
  const watchedPrice = watch("price")
  const watchedCurrency = watch("currency")
  const watchedWarranty = watch("warranty")

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

  // Formatowanie ceny
  const formatPrice = (price: number | undefined, currency: string) => {
    if (!price) return ""
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Typ sprzedaży i cena główna */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cena */}
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                {watchedSaleType === "Aukcja" ? "Cena wywoławcza" : "Cena sprzedaży"}
                <FieldStatusIcon status={getFieldStatus(field.value)} />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="25000"
                    className={cn(
                      "pl-10",
                      getFieldStatus(field.value) === "success" && "border-green-500",
                      getFieldStatus(field.value) === "error" && "border-red-500"
                    )}
                    {...field}
                  />
                </div>
              </FormControl>
              {watchedPrice && watchedCurrency && (
                <div className="text-sm text-gray-600">
                  {formatPrice(watchedPrice, watchedCurrency)}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Waluta */}
        <FormField
          control={control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waluta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz walutę" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CHF">🇨🇭 CHF (Frank szwajcarski)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR (Euro)</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD (Dolar amerykański)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Placeholder dla wyrównania */}
        <div className="hidden md:block"></div>
      </div>

      {/* Sekcja aukcji - pokazuje się tylko dla aukcji */}
      {watchedSaleType === "Aukcja" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Ustawienia aukcji
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data zakończenia aukcji */}
              <FormField
                control={control}
                name="auctionEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data zakończenia aukcji
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? field.value.toISOString().slice(0, 16) : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormDescription>
                      Aukcja musi trwać co najmniej 24 godziny
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minimalna kwota licytacji */}
              <FormField
                control={control}
                name="minBidIncrement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Minimalna kwota licytacji
                      <FieldStatusIcon status={getFieldStatus(field.value)} />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="100"
                          className={cn(
                            "pl-10",
                            getFieldStatus(field.value) === "success" && "border-green-500"
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Minimalna kwota o jaką może zostać podniesiona oferta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gwarancja */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Gwarancja i dodatkowe usługi
          </h4>
          
          <div className="space-y-4">
            {/* Przełącznik gwarancji */}
            <FormField
              control={control}
              name="warranty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      Gwarancja
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Pojazd jest objęty gwarancją
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

            {/* Okres gwarancji - pokazuje się tylko gdy gwarancja jest włączona */}
            {watchedWarranty && (
              <FormField
                control={control}
                name="warrantyMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Okres gwarancji (miesiące)
                      <FieldStatusIcon status={getFieldStatus(field.value, 1)} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12"
                        min="1"
                        max="120"
                        {...field}
                        className={cn(
                          getFieldStatus(field.value, 1) === "success" && "border-green-500"
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      Okres gwarancji w miesiącach (1-120)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wskazówki cenowe */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            💡 Wskazówki dotyczące ceny
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Sprawdź ceny podobnych pojazdów na rynku</li>
            <li>• Uwzględnij stan techniczny i przebieg</li>
            <li>• Pamiętaj o kosztach transferu i rejestracji</li>
            {watchedSaleType === "Aukcja" && (
              <li>• Ustaw atrakcyjną cenę wywoławczą, aby przyciągnąć licytujących</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}