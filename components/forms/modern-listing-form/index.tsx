"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, 
  X, 
  MapPin, 
  Car, 
  Sparkles, 
  Loader2,
  Image as ImageIcon,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { GoogleMapsLocationPicker } from "./google-maps-location-picker"
import { VehicleFieldsPartial } from "./vehicle-fields-partial"
import Image from "next/image"

const listingSchema = z.object({
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków"),
  description: z.string().min(20, "Opis musi mieć co najmniej 20 znaków"),
  price: z.number().min(1, "Cena musi być większa od 0"),
  currency: z.string().default("CHF"),
  vehicle_type: z.enum(["car", "motorcycle"]),
  brand: z.string().min(1, "Wybierz markę"),
  model: z.string().min(1, "Wybierz model"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0),
  fuel_type: z.string().min(1, "Wybierz rodzaj paliwa"),
  transmission: z.string().min(1, "Wybierz skrzynię biegów"),
  condition: z.string().min(1, "Wybierz stan pojazdu"),
  address: z.string().min(5, "Podaj adres"),
  lat: z.number(),
  lng: z.number(),
  place_id: z.string(),
  images: z.array(z.string()).min(1, "Dodaj co najmniej jedno zdjęcie")
})

type ListingFormData = z.infer<typeof listingSchema>

interface UploadedImage {
  id: string
  url: string
  file: File
  uploading: boolean
  uploaded: boolean
}

export function ModernListingForm() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      currency: "CHF",
      vehicle_type: "car",
      images: []
    }
  })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} nie jest plikiem obrazu`)
        continue
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} jest za duży (max 10MB)`)
        continue
      }

      const imageId = Math.random().toString(36).substr(2, 9)
      const imageUrl = URL.createObjectURL(file)
      
      const newImage: UploadedImage = {
        id: imageId,
        url: imageUrl,
        file,
        uploading: true,
        uploaded: false
      }

      setImages(prev => [...prev, newImage])

      // Simulate async upload
      try {
        await uploadImageAsync(file, imageId)
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, uploading: false, uploaded: true }
            : img
        ))
        toast.success(`${file.name} został przesłany`)
      } catch (error) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        toast.error(`Błąd przesyłania ${file.name}`)
      }
    }

    // Update form
    form.setValue('images', images.filter(img => img.uploaded).map(img => img.url))
  }

  const uploadImageAsync = async (file: File, imageId: string): Promise<string> => {
    // Simulate upload with progress
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('image', file)
      
      // Simulate upload delay
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(`/uploads/${imageId}_${file.name}`)
        } else {
          reject(new Error('Upload failed'))
        }
      }, 1000 + Math.random() * 2000)
    })
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    form.setValue('images', images.filter(img => img.id !== imageId && img.uploaded).map(img => img.url))
  }

  const calculateProgress = () => {
    const totalFields = 12 // Total required fields
    const values = form.getValues()
    let filledFields = 0

    if (values.title) filledFields++
    if (values.description) filledFields++
    if (values.price) filledFields++
    if (values.brand) filledFields++
    if (values.model) filledFields++
    if (values.year) filledFields++
    if (values.mileage !== undefined) filledFields++
    if (values.fuel_type) filledFields++
    if (values.transmission) filledFields++
    if (values.condition) filledFields++
    if (values.address) filledFields++
    if (images.filter(img => img.uploaded).length > 0) filledFields++

    return Math.round((filledFields / totalFields) * 100)
  }

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true)
    
    try {
      // Determine category based on vehicle type
      const category = data.vehicle_type === 'motorcycle' ? 'moto' 
                     : data.vehicle_type === 'car' ? 'auto' 
                     : 'aukcje'

      console.log('Submitting listing:', { ...data, category })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('🎉 Ogłoszenie zostało opublikowane!')
      
      // Redirect to appropriate category
      window.location.href = `/ogloszenia?category=${category}`
      
    } catch (error) {
      console.error('Error submitting listing:', error)
      toast.error('Błąd podczas publikowania ogłoszenia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = calculateProgress()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Postęp wypełniania</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* 1. UPLOAD ZDJĘĆ (na samej górze) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Zdjęcia pojazdu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dodaj zdjęcia pojazdu</h3>
            <p className="text-muted-foreground mb-4">
              Przeciągnij pliki tutaj lub kliknij, aby wybrać (max 10MB każde)
            </p>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Wybierz pliki
            </Button>
          </div>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={image.url}
                      alt="Podgląd"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Upload Status */}
                  <div className="absolute top-2 right-2">
                    {image.uploading && (
                      <Badge variant="secondary" className="text-xs">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Wysyłanie...
                      </Badge>
                    )}
                    {image.uploaded && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Gotowe
                      </Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* 2. DANE POJAZDU */}
      <VehicleFieldsPartial form={form} />

      <Separator />

      {/* 3. LOKALIZACJA Z GOOGLE MAPS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Moja lokalizacja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleMapsLocationPicker
            onLocationSelect={(location) => {
              form.setValue('address', location.address)
              form.setValue('lat', location.lat)
              form.setValue('lng', location.lng)
              form.setValue('place_id', location.place_id)
            }}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* 4. PODSUMOWANIE + PUBLIKUJ */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Gotowe do publikacji?</h3>
            <p className="text-muted-foreground">
              Sprawdź wszystkie dane i opublikuj swoje ogłoszenie
            </p>
            
            <Button
              type="submit"
              disabled={isSubmitting || progress < 100}
              className="px-12 py-3 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Publikowanie...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Opublikuj ogłoszenie
                </>
              )}
            </Button>

            {progress < 100 && (
              <p className="text-sm text-muted-foreground">
                Wypełnij wszystkie wymagane pola, aby móc opublikować ogłoszenie
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}