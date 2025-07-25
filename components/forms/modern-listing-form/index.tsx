"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { modernListingSchema, type ModernListingFormValues } from "@/lib/schemas/modern-listing-schema"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { FormProgressBar } from "./form-progress-bar"
import { AsyncImageUpload } from "./async-image-upload"
import { VehicleBasicInfo } from "./sections/vehicle-basic-info"
import { VehicleSpecs } from "./sections/vehicle-specs"
import { VehiclePricing } from "./sections/vehicle-pricing"
import { VehicleLocation } from "./sections/vehicle-location"
import { VehicleOptions } from "./sections/vehicle-options"

export function ModernListingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [formProgress, setFormProgress] = useState(0)

  const form = useForm<ModernListingFormValues>({
    resolver: zodResolver(modernListingSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      mainCategory: "SAMOCHODY",
      saleType: "Kup Teraz",
      currency: "CHF",
      price: undefined,
      auctionEndDate: undefined,
      minBidIncrement: undefined,
      brand: "",
      model: "",
      year: undefined,
      mileage: undefined,
      engineCapacity: undefined,
      power: undefined,
      fuelType: "",
      transmission: "",
      condition: "",
      accidentFree: true,
      hasServiceBook: false,
      images: [],
      location: {
        country: "Szwajcaria",
        city: "",
        postalCode: "",
        coordinates: { lat: 0, lng: 0 },
        placeId: "",
      },
      warranty: false,
      warrantyMonths: undefined,
      features: [],
      contactInfo: {
        name: "",
        phone: "",
        email: "",
        preferredContact: "phone",
      },
    },
  })

  // Obliczanie postępu formularza
  useEffect(() => {
    const subscription = form.watch((values) => {
      const totalFields = Object.keys(form.getValues()).length
      const filledFields = Object.values(values).filter(
        (value) => value !== undefined && value !== "" && value !== null
      ).length
      
      const progress = Math.round((filledFields / totalFields) * 100)
      setFormProgress(progress)
    })

    return () => subscription.unsubscribe()
  }, [form])

  // Automatyczne przypisywanie kategorii na podstawie marki
  const handleBrandChange = (brand: string) => {
    const motorcycleBrands = [
      "BMW Motorrad", "Honda", "Yamaha", "Kawasaki", "Suzuki", 
      "Ducati", "Harley-Davidson", "KTM", "Aprilia", "Triumph"
    ]
    
    if (motorcycleBrands.includes(brand)) {
      form.setValue("mainCategory", "MOTOCYKLE")
    } else {
      form.setValue("mainCategory", "SAMOCHODY")
    }
  }

  const onSubmit = async (data: ModernListingFormValues) => {
    setIsLoading(true)
    
    try {
      // Dodaj przesłane zdjęcia do danych formularza
      const formDataWithImages = {
        ...data,
        imageUrls: uploadedImages,
      }

      const response = await fetch("/api/listings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataWithImages),
      })

      if (!response.ok) {
        throw new Error("Błąd podczas tworzenia ogłoszenia")
      }

      const result = await response.json()
      
      toast.success("Ogłoszenie zostało pomyślnie utworzone!", {
        description: "Zostaniesz przekierowany do podglądu ogłoszenia.",
        icon: <CheckCircle className="h-4 w-4" />,
      })

      // Przekierowanie na podstawie kategorii
      const redirectUrl = data.saleType === "Aukcja" 
        ? "/aukcje" 
        : `/ogloszenia?category=${data.mainCategory.toLowerCase()}`
      
      window.location.href = `${redirectUrl}/${result.id}`
      
    } catch (error) {
      console.error("Błąd:", error)
      toast.error("Wystąpił błąd podczas tworzenia ogłoszenia", {
        description: "Spróbuj ponownie lub skontaktuj się z pomocą techniczną.",
        icon: <AlertCircle className="h-4 w-4" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Pasek postępu */}
      <FormProgressBar progress={formProgress} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Podstawowe informacje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Podstawowe informacje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleBasicInfo onBrandChange={handleBrandChange} />
            </CardContent>
          </Card>

          {/* Specyfikacja techniczna */}
          <Card>
            <CardHeader>
              <CardTitle>Specyfikacja techniczna</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleSpecs />
            </CardContent>
          </Card>

          {/* Cena i typ sprzedaży */}
          <Card>
            <CardHeader>
              <CardTitle>Cena i sprzedaż</CardTitle>
            </CardHeader>
            <CardContent>
              <VehiclePricing />
            </CardContent>
          </Card>

          {/* Zdjęcia - Asynchroniczny upload */}
          <Card>
            <CardHeader>
              <CardTitle>Zdjęcia pojazdu</CardTitle>
            </CardHeader>
            <CardContent>
              <AsyncImageUpload 
                onImagesUploaded={setUploadedImages}
                maxImages={20}
              />
            </CardContent>
          </Card>

          {/* Lokalizacja z Google Maps */}
          <Card>
            <CardHeader>
              <CardTitle>Lokalizacja</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleLocation />
            </CardContent>
          </Card>

          {/* Dodatkowe opcje */}
          <Card>
            <CardHeader>
              <CardTitle>Dodatkowe opcje</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleOptions />
            </CardContent>
          </Card>

          {/* Przycisk publikacji */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || formProgress < 70}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publikowanie...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Opublikuj ogłoszenie
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}