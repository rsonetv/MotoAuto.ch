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
      </CardContent>
    </Card>
  )
}
