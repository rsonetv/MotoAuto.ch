"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export function VehicleOptions() {
  const { control, watch } = useFormContext()
  const warranty = watch("warranty")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Opcje dodatkowe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="warranty"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Oferuj gwarancję</FormLabel>
                <p className="text-sm text-muted-foreground">Możesz zaoferować gwarancję na pojazd</p>
              </div>
            </FormItem>
          )}
        />

        {warranty && (
          <FormField
            control={control}
            name="warrantyMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Długość gwarancji (miesiące)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="np. 12"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
