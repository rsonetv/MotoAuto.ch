"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"

export function Step2AuctionSpecs() {
  const { control } = useFormContext()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Ceny */}
      <FormField
        control={control}
        name="startingPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cena wywoławcza (CHF)</FormLabel>
            <FormControl>
              <Input type="number" min={0} step="0.01" placeholder="5000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="buyNowPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cena kup teraz (CHF)</FormLabel>
            <FormControl>
              <Input type="number" min={0} step="0.01" placeholder="12000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Data zakończenia aukcji */}
      <FormField
        control={control}
        name="auctionEndDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data zakończenia aukcji</FormLabel>
            <FormControl>
              <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Lokalizacja */}
      <FormField
        control={control}
        name="location.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Miasto</FormLabel>
            <FormControl>
              <Input placeholder="Zürich" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="vin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VIN</FormLabel>
            <FormControl>
              <Input placeholder="WBA8D9G56JNU12345" {...field} />
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
            <FormLabel>Moc (KM)</FormLabel>
            <FormControl>
              <Input type="number" min={1} placeholder="184" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Paliwo */}
      <FormField
        control={control}
        name="fuelType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rodzaj paliwa</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Benzyna">Benzyna</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Hybryda">Hybryda</SelectItem>
                <SelectItem value="Elektryczny">Elektryczny</SelectItem>
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
            <FormLabel>Skrzynia biegów</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Manual / Automat" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Manualna">Manualna</SelectItem>
                <SelectItem value="Automatyczna">Automatyczna</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Checkboxy – stan i historia */}
      <div className="md:col-span-2 grid gap-4">
        <FormField
          control={control}
          name="accidentFree"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Bezwypadkowy</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="hasServiceBook"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Książka serwisowa</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
