"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, DollarSign, Car, FileText, MapPin, Shield } from "lucide-react"
import type { AddVehicleFormValues } from "@/lib/schemas/add-vehicle-schema"
import Image from "next/image"

export function Step5Summary() {
  const { getValues } = useFormContext<AddVehicleFormValues>()
  const values = getValues()

  const renderValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "Tak" : "Nie"
    }
    if (value instanceof Date) {
      return value.toLocaleDateString("pl-PL")
    }
    if (!value) return <span className="text-gray-500">Nie podano</span>
    return value
  }

  const formatPrice = (price: number | undefined, currency: string) => {
    if (!price) return "Nie podano"
    return `${price.toLocaleString()} ${currency}`
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sprawdź swoje ogłoszenie</h2>
        <p className="text-gray-600">
          Przejrzyj wszystkie dane przed publikacją. Po opublikowaniu niektóre informacje nie będą mogły być zmienione.
        </p>
      </div>

      {/* Podstawowe informacje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Podstawowe informacje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Ogłoszenie</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tytuł:</span>
                  <span className="font-medium text-right max-w-xs">{values.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategoria:</span>
                  <Badge variant="outline">{values.mainCategory}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Typ sprzedaży:</span>
                  <Badge>{values.saleType}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Pojazd</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Marka:</span>
                  <span className="font-medium">{values.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{values.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rok:</span>
                  <span className="font-medium">{values.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Przebieg:</span>
                  <span className="font-medium">{values.mileage?.toLocaleString()} km</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ceny i aukcja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ceny i ustawienia aukcji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {values.saleType.includes("Aukcja") && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <span className="text-blue-800 font-medium">Cena wywoławcza:</span>
                  <span className="text-blue-900 font-bold text-lg">
                    {formatPrice(values.startingPrice, values.currency)}
                  </span>
                </div>
              )}

              {values.buyNowPrice && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <span className="text-green-800 font-medium">Cena "Kup Teraz":</span>
                  <span className="text-green-900 font-bold text-lg">
                    {formatPrice(values.buyNowPrice, values.currency)}
                  </span>
                </div>
              )}

              {values.reservePrice && (
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-md">
                  <span className="text-orange-800 font-medium">Cena minimalna:</span>
                  <span className="text-orange-900 font-bold">{formatPrice(values.reservePrice, values.currency)}</span>
                  <Badge variant="secondary" className="text-xs">
                    Ukryta
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {values.auctionEndDate && (
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Koniec aukcji:</p>
                    <p className="font-medium">{renderValue(values.auctionEndDate)}</p>
                  </div>
                </div>
              )}

              {values.minBidIncrement && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-gray-600">Min. postąpienie:</span>
                  <span className="font-medium">{formatPrice(values.minBidIncrement, values.currency)}</span>
                </div>
              )}

              {values.autoExtend && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800 text-sm">Auto-przedłużenie włączone</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specyfikacja techniczna */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Specyfikacja techniczna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pojemność:</span>
                <span className="font-medium">
                  {typeof values.engineCapacity === "number" ? `${values.engineCapacity} cm³` : values.engineCapacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moc:</span>
                <span className="font-medium">{values.power} KM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paliwo:</span>
                <span className="font-medium">{values.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skrzynia:</span>
                <span className="font-medium">{values.transmission}</span>
              </div>
              {values.mainCategory === "SAMOCHODY" && values.driveType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Napęd:</span>
                  <span className="font-medium">{values.driveType}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Stan:</span>
                <Badge variant={values.condition === "Nowy" ? "default" : "secondary"}>{values.condition}</Badge>
              </div>
              {values.vin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">VIN:</span>
                  <span className="font-mono text-sm">{values.vin}</span>
                </div>
              )}
              {values.ownersCount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Właściciele:</span>
                  <span className="font-medium">{values.ownersCount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Książka serwisowa:</span>
                <Badge variant={values.hasServiceBook ? "default" : "secondary"}>
                  {renderValue(values.hasServiceBook)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bezwypadkowy:</span>
                <Badge variant={values.accidentFree ? "default" : "destructive"}>
                  {renderValue(values.accidentFree)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Opis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{values.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Zdjęcia */}
      {values.images && values.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Zdjęcia ({values.images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {values.images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image.preview || "/placeholder.svg"}
                    alt={`Zdjęcie ${index + 1}`}
                    width={150}
                    height={150}
                    className="object-cover rounded-md w-full aspect-square"
                  />
                  {index === 0 && <Badge className="absolute top-1 left-1 text-xs bg-blue-600">Główne</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lokalizacja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lokalizacja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="font-medium">{values.location?.city}</span>
            {values.location?.postalCode && <span className="text-gray-600">({values.location.postalCode})</span>}
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">{values.location?.country}</span>
          </div>
        </CardContent>
      </Card>

      {/* Opcje dodatkowe */}
      {(values.financingOptions?.length || values.transportOptions?.length || values.warranty) && (
        <Card>
          <CardHeader>
            <CardTitle>Opcje dodatkowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {values.financingOptions && values.financingOptions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Finansowanie:</h4>
                <div className="flex flex-wrap gap-2">
                  {values.financingOptions.map((option, index) => (
                    <Badge key={index} variant="outline">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {values.transportOptions && values.transportOptions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Transport:</h4>
                <div className="flex flex-wrap gap-2">
                  {values.transportOptions.map((option, index) => (
                    <Badge key={index} variant="outline">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {values.warranty && (
              <div>
                <h4 className="font-medium mb-2">Gwarancja:</h4>
                <Badge className="bg-green-100 text-green-800">{values.warrantyMonths} miesięcy</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Podsumowanie opłat */}
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Podsumowanie opłat:</p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Opłata za publikację:</span>
                <span className="font-medium">Bezpłatna</span>
              </div>
              <div className="flex justify-between">
                <span>Prowizja przy sprzedaży:</span>
                <span className="font-medium">2.5% (min. 50 {values.currency})</span>
              </div>
              {values.buyNowPrice && (
                <div className="flex justify-between text-gray-600">
                  <span>Szacowana prowizja:</span>
                  <span>
                    {Math.max(50, values.buyNowPrice * 0.025).toFixed(0)} {values.currency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-1">Gotowe do publikacji!</p>
          <p className="text-sm">
            Twoje ogłoszenie zostanie opublikowane natychmiast po kliknięciu przycisku "Dodaj ogłoszenie". Będzie
            widoczne dla wszystkich użytkowników platformy MotoAuto.ch.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
