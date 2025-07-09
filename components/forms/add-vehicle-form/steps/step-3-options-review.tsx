"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Step3OptionsReview() {
  const { control } = useFormContext()
  const values = useWatch({ control })

  return (
    <div className="space-y-8">
      {/* Opcje dodatkowe */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="warranty"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Gwarancja dealera</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="warrantyMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Długość gwarancji (mies.)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="financingOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opcje finansowania</FormLabel>
              <FormControl>
                <Textarea placeholder="Opisz dostępne opcje leasingu / kredytu..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="transportOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opcje transportu</FormLabel>
              <FormControl>
                <Textarea placeholder="Możliwy transport na terenie EU..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Podgląd danych przed publikacją */}
      <Separator />
      <h3 className="text-lg font-semibold">Podsumowanie ogłoszenia</h3>
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(values, null, 2)}</pre>

      {/* Informacyjny przycisk – kliknięcie obsługiwane w pliku index.tsx */}
      <Button type="button" variant="secondary" className="mt-4">
        Zatwierdź i przejdź do publikacji
      </Button>
    </div>
  )
}
