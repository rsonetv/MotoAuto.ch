"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Info } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CURRENCIES } from "@/lib/constants"
import type { AddVehicleFormValues } from "@/lib/schemas/add-vehicle-schema"

export function Step1BasicInfo() {
  const { control, watch } = useFormContext<AddVehicleFormValues>()
  const saleType = watch("saleType")
  const mainCategory = watch("mainCategory")
  const currency = watch("currency")

  return (
    <div className="space-y-8">
      {/* Kategoria główna */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="mainCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Kategoria główna</FormLabel>
              <FormControl>
                <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="SAMOCHODY" className="text-base">
                      🚗 Samochody
                    </TabsTrigger>
                    <TabsTrigger value="MOTOCYKLE" className="text-base">
                      🏍️ Motocykle
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Podstawowe informacje */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Podstawowe informacje</h3>

        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł ogłoszenia *</FormLabel>
              <FormControl>
                <Input
                  placeholder={`np. ${mainCategory === "SAMOCHODY" ? "BMW Seria 3 320d, 2020, Idealny stan" : "Honda CBR 600RR, 2021, Sport"}`}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="text-base"
                />
              </FormControl>
              <p className="text-sm text-gray-500">Atrakcyjny tytuł zwiększa zainteresowanie o 40%</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szczegółowy opis *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Opisz szczegółowo swój ${mainCategory === "SAMOCHODY" ? "samochód" : "motocykl"}...

Przykład:
- Stan techniczny i wizualny
- Historia serwisowa
- Wyposażenie dodatkowe
- Powód sprzedaży
- Możliwość oględzin`}
                  rows={8}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="text-base"
                />
              </FormControl>
              <p className="text-sm text-gray-500">Szczegółowy opis zwiększa zaufanie kupujących</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Typ sprzedaży */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Typ sprzedaży</h3>

        <FormField
          control={control}
          name="saleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wybierz sposób sprzedaży *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Wybierz typ sprzedaży" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Aukcja" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">🔨 Aukcja</span>
                      <span className="text-sm text-gray-500">Licytacja z ceną wywoławczą</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Kup Teraz" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">💰 Kup Teraz</span>
                      <span className="text-sm text-gray-500">Sprzedaż za stałą cenę</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Aukcja + Kup Teraz" className="py-3">
                    <div className="flex flex-col">
                      
                      
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectTrigger className="w-32">
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

      {/* Ustawienia cenowe */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Ustawienia cenowe</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {saleType?.includes("Aukcja") && (
            <FormField
              control={control}
              name="startingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Cena wywoławcza ({currency}) *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cena od której rozpoczyna się licytacja</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 15000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {saleType?.includes("Kup Teraz") && (
            <FormField
              control={control}
              name="buyNowPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Cena "Kup Teraz" ({currency}) *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cena za natychmiastowy zakup</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 20000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {saleType?.includes("Aukcja") && (
            <FormField
              control={control}
              name="reservePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Cena minimalna ({currency})
                    <Badge variant="secondary" className="text-xs">
                      Opcjonalne
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Minimalna cena sprzedaży (niewidoczna dla kupujących)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 18000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      className="text-base"
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">Cena minimalna jest ukryta przed kupującymi</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {saleType?.includes("Aukcja") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="minBidIncrement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimalna kwota postąpienia ({currency}) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="np. 100"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      className="text-base"
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
                          className={cn(
                            "w-full pl-3 text-left font-normal h-12 text-base",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: pl })
                          ) : (
                            <span>Wybierz datę zakończenia</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-500">Maksymalnie 30 dni od dzisiaj</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {saleType?.includes("Aukcja") && (
          <FormField
            control={control}
            name="autoExtend"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">Auto-przedłużenie aukcji</FormLabel>
                  <p className="text-sm text-gray-500">
                    Aukcja zostanie przedłużona o 5 minut, jeśli w ostatnich 5 minutach pojawi się nowa oferta
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  )
}
