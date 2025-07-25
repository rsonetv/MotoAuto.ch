"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, Plus, X, Settings, User, Phone, Mail } from "lucide-react"
import { ModernListingFormValues } from "@/lib/schemas/modern-listing-schema"
import { cn } from "@/lib/utils"

export function VehicleOptions() {
  const { control, watch, setValue } = useFormContext<ModernListingFormValues>()
  const [customFeature, setCustomFeature] = useState("")
  
  const watchedFeatures = watch("features") || []
  const watchedCategory = watch("mainCategory")

  // Dostępne wyposażenie w zależności od kategorii
  const getAvailableFeatures = () => {
    const commonFeatures = [
      "Klimatyzacja",
      "Elektryczne szyby",
      "Centralny zamek",
      "Immobilizer",
      "Radio/CD",
      "Bluetooth",
      "USB/AUX",
      "Tempomat",
      "Wspomaganie kierownicy",
      "ABS",
      "ESP",
      "Airbag kierowcy",
      "Airbag pasażera",
    ]

    const carFeatures = [
      ...commonFeatures,
      "Nawigacja GPS",
      "Kamera cofania",
      "Czujniki parkowania",
      "Skórzana tapicerka",
      "Fotele grzane",
      "Fotele elektryczne",
      "Panoramiczny dach",
      "Xenon/LED",
      "Felgi aluminiowe",
      "Hak holowniczy",
      "Automatyczna skrzynia biegów",
      "Start-Stop",
      "Keyless Go",
      "Podgrzewane lusterka",
    ]

    const motorcycleFeatures = [
      "ABS",
      "Kontrola trakcji",
      "Tryby jazdy",
      "Quickshifter",
      "Podgrzewane manetki",
      "LED oświetlenie",
      "Cyfrowe zegary",
      "Bluetooth",
      "Nawigacja",
      "Bagażnik",
      "Szyba regulowana",
      "Tempomat",
      "Ogrzewanie siedzeń",
      "System alarmowy",
    ]

    if (watchedCategory === "MOTOCYKLE") {
      return motorcycleFeatures
    }
    
    return carFeatures
  }

  // Dodaj wyposażenie
  const addFeature = (feature: string) => {
    if (!watchedFeatures.includes(feature)) {
      setValue("features", [...watchedFeatures, feature])
    }
  }

  // Usuń wyposażenie
  const removeFeature = (feature: string) => {
    setValue("features", watchedFeatures.filter(f => f !== feature))
  }

  // Dodaj niestandardowe wyposażenie
  const addCustomFeature = () => {
    if (customFeature.trim() && !watchedFeatures.includes(customFeature.trim())) {
      setValue("features", [...watchedFeatures, customFeature.trim()])
      setCustomFeature("")
    }
  }

  // Walidacja inline
  const getFieldStatus = (value: string) => {
    if (!value) return null
    if (value.length < 2) return "error"
    return "success"
  }

  const FieldStatusIcon = ({ status }: { status: "success" | "error" | null }) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  const availableFeatures = getAvailableFeatures()

  return (
    <div className="space-y-6">
      {/* Wyposażenie dodatkowe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Wyposażenie dodatkowe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista dostępnego wyposażenia */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={watchedFeatures.includes(feature)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addFeature(feature)
                    } else {
                      removeFeature(feature)
                    }
                  }}
                />
                <label
                  htmlFor={feature}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>

          {/* Dodawanie niestandardowego wyposażenia */}
          <div className="flex gap-2">
            <Input
              placeholder="Dodaj niestandardowe wyposażenie..."
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomFeature()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCustomFeature}
              disabled={!customFeature.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Wybrane wyposażenie */}
          {watchedFeatures.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Wybrane wyposażenie:</h5>
              <div className="flex flex-wrap gap-2">
                {watchedFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {feature}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeFeature(feature)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informacje kontaktowe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informacje kontaktowe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imię i nazwisko */}
            <FormField
              control={control}
              name="contactInfo.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Imię i nazwisko
                    <FieldStatusIcon status={getFieldStatus(field.value)} />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Jan Kowalski"
                        className={cn(
                          "pl-10",
                          getFieldStatus(field.value) === "success" && "border-green-500"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefon */}
            <FormField
              control={control}
              name="contactInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Numer telefonu
                    <FieldStatusIcon status={getFieldStatus(field.value)} />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="+41 79 123 45 67"
                        className={cn(
                          "pl-10",
                          getFieldStatus(field.value) === "success" && "border-green-500"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={control}
              name="contactInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Adres email
                    <FieldStatusIcon status={field.value?.includes("@") ? "success" : null} />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="jan.kowalski@example.com"
                        className={cn(
                          "pl-10",
                          field.value?.includes("@") && "border-green-500"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferowany kontakt */}
            <FormField
              control={control}
              name="contactInfo.preferredContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferowany sposób kontaktu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz sposób kontaktu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone">📞 Telefon</SelectItem>
                      <SelectItem value="email">📧 Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormDescription>
            Te informacje będą widoczne dla zainteresowanych kupców. 
            Upewnij się, że są aktualne i poprawne.
          </FormDescription>
        </CardContent>
      </Card>

      {/* Informacje o prywatności */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Ochrona danych osobowych</h4>
          <p className="text-sm text-blue-700">
            Twoje dane kontaktowe będą widoczne tylko dla zarejestrowanych użytkowników 
            zainteresowanych Twoim ogłoszeniem. Nie udostępniamy danych osobowych stronom trzecim.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}