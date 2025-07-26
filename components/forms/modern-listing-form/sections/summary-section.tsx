"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, MapPin, Calendar, Fuel, Settings, Euro } from "lucide-react"
import Image from "next/image"

interface SummarySectionProps {
  data: any
  images: string[]
}

export function SummarySection({ data, images }: SummarySectionProps) {
  // Funkcja do formatowania ceny
  const formatPrice = (price: number, currency: string) => {
    if (!price || !currency) return "Nie podano"
    
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Sprawdzenie kompletności danych
  const requiredFields = [
    { key: 'title', label: 'Tytuł', value: data.title },
    { key: 'description', label: 'Opis', value: data.description },
    { key: 'mainCategory', label: 'Kategoria', value: data.mainCategory },
    { key: 'brand', label: 'Marka', value: data.brand },
    { key: 'model', label: 'Model', value: data.model },
    { key: 'year', label: 'Rok', value: data.year },
    { key: 'price', label: 'Cena', value: data.price },
    { key: 'location.city', label: 'Miasto', value: data.location?.city },
    { key: 'location.address', label: 'Adres', value: data.location?.address },
  ]

  const missingFields = requiredFields.filter(field => !field.value)
  const isComplete = missingFields.length === 0 && images.length > 0

  return (
    <div className="space-y-6">
      {/* Status kompletności */}
      <Card className={isComplete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-medium ${isComplete ? "text-green-900" : "text-yellow-900"}`}>
                {isComplete ? "Ogłoszenie gotowe do publikacji!" : "Uzupełnij brakujące dane"}
              </h3>
              <p className={`text-sm ${isComplete ? "text-green-700" : "text-yellow-700"}`}>
                {isComplete 
                  ? "Wszystkie wymagane pola zostały wypełnione"
                  : `Brakuje ${missingFields.length} wymaganych pól${images.length === 0 ? " i zdjęć" : ""}`
                }
              </p>
            </div>
          </div>

          {!isComplete && (
            <div className="mt-3 space-y-1">
              {missingFields.map(field => (
                <div key={field.key} className="text-sm text-yellow-700">
                  • {field.label}
                </div>
              ))}
              {images.length === 0 && (
                <div className="text-sm text-yellow-700">
                  • Zdjęcia pojazdu
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Podgląd ogłoszenia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Podgląd ogłoszenia</CardTitle>
          <p className="text-muted-foreground">
            Tak będzie wyglądać Twoje ogłoszenie dla kupujących
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zdjęcia */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Zdjęcia ({images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.slice(0, 8).map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Zdjęcie ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 text-xs">
                        Główne
                      </Badge>
                    )}
                  </div>
                ))}
                {images.length > 8 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      +{images.length - 8} więcej
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tytuł i podstawowe info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {data.title || "Tytuł ogłoszenia"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {data.mainCategory || "Kategoria"}
                  </Badge>
                  <Badge variant="outline">
                    {data.saleType || "Kup Teraz"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(data.price, data.currency)}
                </div>
                {data.saleType === "Aukcja" && (
                  <p className="text-sm text-muted-foreground">
                    Cena wywoławcza
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dane techniczne */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rok</p>
                <p className="font-medium">{data.year || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Przebieg</p>
                <p className="font-medium">
                  {data.mileage ? `${data.mileage.toLocaleString()} km` : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Paliwo</p>
                <p className="font-medium">{data.fuelType || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Skrzynia</p>
                <p className="font-medium">{data.transmission || "—"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lokalizacja */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {data.location?.city || "Miasto"}, {data.location?.country || "Kraj"}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.location?.postalCode && `${data.location.postalCode} • `}
                Dokładna lokalizacja zostanie udostępniona po kontakcie
              </p>
            </div>
          </div>

          <Separator />

          {/* Opis */}
          <div>
            <h4 className="font-medium mb-2">Opis</h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {data.description || "Opis pojazdu zostanie wyświetlony tutaj..."}
            </p>
          </div>

          {/* Dodatkowe opcje */}
          {(data.financingOptions?.length > 0 || data.transportOptions?.length > 0) && (
            <>
              <Separator />
              <div className="space-y-3">
                {data.financingOptions?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Opcje finansowania</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.financingOptions.map((option: string) => (
                        <Badge key={option} variant="outline">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {data.transportOptions?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Opcje dostawy</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.transportOptions.map((option: string) => (
                        <Badge key={option} variant="outline">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informacje o publikacji */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Co dzieje się po publikacji?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ogłoszenie zostanie automatycznie dodane do odpowiedniej kategorii</li>
            <li>• Otrzymasz potwierdzenie na email</li>
            <li>• Ogłoszenie będzie widoczne w wynikach wyszukiwania w ciągu 5 minut</li>
            <li>• Możesz edytować ogłoszenie w każdej chwili z poziomu panelu użytkownika</li>
            <li>• Otrzymasz powiadomienia o zainteresowaniu kupujących</li>
          </ul>
        </CardContent>
      </Card>

      {/* Przekierowania */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">🎯 Gdzie zostanie opublikowane ogłoszenie?</h4>
          <div className="text-sm text-muted-foreground">
            {data.mainCategory === "MOTOCYKLE" && (
              <p>→ <strong>/ogloszenia?category=moto</strong> (kategoria motocykle)</p>
            )}
            {data.mainCategory === "SAMOCHODY" && (
              <p>→ <strong>/ogloszenia?category=auto</strong> (kategoria samochody)</p>
            )}
            {data.saleType === "Aukcja" && (
              <p>→ <strong>/aukcje</strong> (sekcja aukcji)</p>
            )}
            {data.mainCategory === "DOSTAWCZE" && (
              <p>→ <strong>/ogloszenia?category=dostawcze</strong> (pojazdy dostawcze)</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}