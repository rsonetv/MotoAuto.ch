"use client"

import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Settings, DollarSign } from "lucide-react"

interface VehicleFieldsPartialProps {
  form: UseFormReturn<any>
}

export function VehicleFieldsPartial({ form }: VehicleFieldsPartialProps) {
  const { register, setValue, watch, formState: { errors } } = form

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Podstawowe informacje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tytuł ogłoszenia *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="np. BMW X5 3.0d xDrive"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="vehicle_type">Typ pojazdu *</Label>
              <Select onValueChange={(value) => setValue("vehicle_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">🚗 Samochód</SelectItem>
                  <SelectItem value="motorcycle">🏍️ Motocykl</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Opis pojazdu *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Opisz szczegółowo stan pojazdu, wyposażenie, historię serwisową..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Specs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Specyfikacja techniczna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Marka *</Label>
              <Select onValueChange={(value) => setValue("brand", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz markę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audi">Audi</SelectItem>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                  <SelectItem value="volkswagen">Volkswagen</SelectItem>
                  <SelectItem value="porsche">Porsche</SelectItem>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="other">Inna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                {...register("model")}
                placeholder="np. X5, A4, C-Class"
              />
            </div>

            <div>
              <Label htmlFor="year">Rok produkcji *</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div>
              <Label htmlFor="mileage">Przebieg (km) *</Label>
              <Input
                id="mileage"
                type="number"
                {...register("mileage", { valueAsNumber: true })}
                placeholder="50000"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="fuel_type">Rodzaj paliwa *</Label>
              <Select onValueChange={(value) => setValue("fuel_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz paliwo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benzyna">Benzyna</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Elektryczny</SelectItem>
                  <SelectItem value="lpg">LPG</SelectItem>
                  <SelectItem value="cng">CNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transmission">Skrzynia biegów *</Label>
              <Select onValueChange={(value) => setValue("transmission", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz skrzynię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manualna</SelectItem>
                  <SelectItem value="automatic">Automatyczna</SelectItem>
                  <SelectItem value="semi-automatic">Półautomatyczna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Stan pojazdu *</Label>
              <Select onValueChange={(value) => setValue("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz stan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nowy</SelectItem>
                  <SelectItem value="very-good">Bardzo dobry</SelectItem>
                  <SelectItem value="good">Dobry</SelectItem>
                  <SelectItem value="fair">Zadowalający</SelectItem>
                  <SelectItem value="poor">Wymaga naprawy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cena
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Cena *</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="25000"
                min="1"
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currency">Waluta</Label>
              <Select defaultValue="CHF" onValueChange={(value) => setValue("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">CHF (Franki szwajcarskie)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="USD">USD (Dolary amerykańskie)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}