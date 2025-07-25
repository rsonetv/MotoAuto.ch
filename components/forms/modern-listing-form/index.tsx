"use client"

import { useState, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ImageUploadSection } from "./sections/image-upload-section"
import { VehicleDetailsSection } from "./sections/vehicle-details-section"
import { LocationSection } from "./sections/location-section"
import { PricingSection } from "./sections/pricing-section"
import { SummarySection } from "./sections/summary-section"
import { VEHICLE_CATEGORIES } from "@/lib/constants"

// Schema walidacji
const modernListingSchema = z.object({
  // Podstawowe dane
  title: z.string().min(10, "Tytuł musi mieć co najmniej 10 znaków").max(100, "Tytuł może mieć maksymalnie 100 znaków"),
  description: z.string().min(50, "Opis musi mieć co najmniej 50 znaków").max(2000, "Opis może mieć maksymalnie 2000 znaków"),
  
  // Kategoria i typ pojazdu
  mainCategory: z.enum(["SAMOCHODY", "MOTOCYKLE", "DOSTAWCZE"]),
  vehicleType: z.string().min(1, "Wybierz typ pojazdu"),
  
  // Dane pojazdu
  brand: z.string().min(1, "Wybierz markę"),
  model: z.string().min(1, "Wybierz model"),
  year: z.number().min(1900, "Rok produkcji musi być większy niż 1900").max(new Date().getFullYear() + 1, "Rok produkcji nie może być z przyszłości"),
  mileage: z.number().min(0, "Przebieg nie może być ujemny").optional(),
  
  // Dane techniczne
  fuelType: z.string().min(1, "Wybierz rodzaj paliwa"),
  transmission: z.string().min(1, "Wybierz skrzynię biegów"),
  engineCapacity: z.number().min(0, "Pojemność silnika nie może być ujemna").optional(),
  power: z.number().min(0, "Moc nie może być ujemna").optional(),
  condition: z.string().min(1, "Wybierz stan pojazdu"),
  
  // Cena
  saleType: z.enum(["Kup Teraz", "Aukcja"]),
  currency: z.enum(["CHF", "EUR", "USD"]),
  price: z.number().min(1, "Cena musi być większa od 0"),
  
  // Lokalizacja
  location: z.object({
    country: z.string().min(1, "Wybierz kraj"),
    city: z.string().min(1, "Podaj miasto"),
    postalCode: z.string().optional(),
    address: z.string().min(1, "Podaj adres"),
    lat: z.number().optional(),
    lng: z.number().optional(),
    placeId: z.string().optional(),
  }),
  
  // Zdjęcia
  images: z.array(z.string()).min(1, "Dodaj co najmniej jedno zdjęcie").max(20, "Możesz dodać maksymalnie 20 zdjęć"),
  
  // Opcjonalne
  features: z.array(z.string()).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Podaj prawidłowy adres email").optional(),
})

type ModernListingFormValues = z.infer<typeof modernListingSchema>

interface ModernListingFormProps {
  onSubmit?: (data: ModernListingFormValues) => Promise<void>
}

export function ModernListingForm({ onSubmit }: ModernListingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<ModernListingFormValues>({
    resolver: zodResolver(modernListingSchema),
    defaultValues: {
      mainCategory: "SAMOCHODY",
      saleType: "Kup Teraz",
      currency: "CHF",
      images: [],
      features: [],
      location: {
        country: "Szwajcaria",
        city: "",
        address: "",
      },
    },
    mode: "onChange", // Walidacja inline
  })

  const watchedValues = form.watch()
  
  // Obliczanie postępu wypełnienia formularza
  const calculateProgress = useCallback(() => {
    const requiredFields = [
      'title', 'description', 'mainCategory', 'vehicleType', 'brand', 'model', 
      'year', 'fuelType', 'transmission', 'condition', 'price', 'location.city', 
      'location.address'
    ]
    
    let filledFields = 0
    requiredFields.forEach(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], watchedValues)
        : watchedValues[field as keyof ModernListingFormValues]
      
      if (value !== undefined && value !== null && value !== '') {
        filledFields++
      }
    })
    
    // Dodaj punkty za zdjęcia
    if (uploadedImages.length > 0) filledFields++
    
    return Math.round((filledFields / (requiredFields.length + 1)) * 100)
  }, [watchedValues, uploadedImages])

  const progress = calculateProgress()

  // Obsługa uploadu zdjęć
  const handleImageUpload = useCallback(async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('image', file)
      
      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) throw new Error('Upload failed')
        
        const data = await response.json()
        return data.url
      } catch (error) {
        console.error('Upload error:', error)
        toast({
          title: "Błąd uploadu",
          description: `Nie udało się przesłać pliku ${file.name}`,
          variant: "destructive",
        })
        return null
      }
    })
    
    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(Boolean) as string[]
    
    setUploadedImages(prev => [...prev, ...successfulUploads])
    form.setValue('images', [...uploadedImages, ...successfulUploads])
    
    if (successfulUploads.length > 0) {
      toast({
        title: "Zdjęcia przesłane",
        description: `Pomyślnie przesłano ${successfulUploads.length} zdjęć`,
      })
    }
  }, [uploadedImages, form, toast])

  // Obsługa usuwania zdjęć
  const handleImageRemove = useCallback((index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    form.setValue('images', newImages)
  }, [uploadedImages, form])

  // Obsługa wysyłania formularza
  const handleSubmit = async (data: ModernListingFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Określenie kategorii dla przekierowania
      const categoryRedirect = data.mainCategory === 'MOTOCYKLE' ? 'moto' 
                             : data.mainCategory === 'SAMOCHODY' ? 'auto' 
                             : data.saleType === 'Aukcja' ? 'aukcje' 
                             : 'auto'

      const submissionData = {
        ...data,
        categoryRedirect,
        images: uploadedImages,
      }

      if (onSubmit) {
        await onSubmit(submissionData)
      } else {
        // Domyślna obsługa - wysłanie do API
        const response = await fetch('/api/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        })

        if (!response.ok) throw new Error('Submission failed')

        toast({
          title: "Ogłoszenie opublikowane!",
          description: "Twoje ogłoszenie zostało pomyślnie dodane.",
        })

        // Przekierowanie do odpowiedniej kategorii
        window.location.href = `/ogloszenia?category=${categoryRedirect}`
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Błąd publikacji",
        description: "Nie udało się opublikować ogłoszenia. Spróbuj ponownie.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    {
      id: 'images',
      title: 'Zdjęcia pojazdu',
      description: 'Dodaj zdjęcia swojego pojazdu',
      component: (
        <ImageUploadSection
          images={uploadedImages}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          maxImages={20}
        />
      ),
    },
    {
      id: 'details',
      title: 'Dane pojazdu',
      description: 'Podstawowe informacje o pojeździe',
      component: (
        <VehicleDetailsSection
          form={form}
          categories={VEHICLE_CATEGORIES}
        />
      ),
    },
    {
      id: 'location',
      title: 'Lokalizacja',
      description: 'Gdzie znajduje się pojazd',
      component: (
        <LocationSection
          form={form}
        />
      ),
    },
    {
      id: 'pricing',
      title: 'Cena i sprzedaż',
      description: 'Ustal cenę i sposób sprzedaży',
      component: (
        <PricingSection
          form={form}
        />
      ),
    },
    {
      id: 'summary',
      title: 'Podsumowanie',
      description: 'Sprawdź dane przed publikacją',
      component: (
        <SummarySection
          data={watchedValues}
          images={uploadedImages}
        />
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Pasek postępu */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Postęp wypełnienia</CardTitle>
              <p className="text-sm text-muted-foreground">
                Wypełniono {progress}% formularza
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {progress}%
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Nawigacja kroków */}
      <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            variant={currentStep === index ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep(index)}
            className="min-w-fit whitespace-nowrap"
          >
            {index + 1}. {step.title}
          </Button>
        ))}
      </div>

      {/* Formularz */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </CardHeader>
            <CardContent>
              {steps[currentStep].component}
            </CardContent>
          </Card>

          {/* Nawigacja */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Poprzedni krok
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              >
                Następny krok
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || progress < 80}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Publikowanie..." : "Opublikuj ogłoszenie"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}