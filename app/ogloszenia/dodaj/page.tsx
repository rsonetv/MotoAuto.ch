"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  X,
  MapPin,
  Car,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  FileText,
  Gauge,
  Calendar,
  DollarSign
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

// Schema walidacji formularza
const listingSchema = z.object({
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków"),
  description: z.string().min(50, "Opis musi mieć co najmniej 50 znaków"),
  price: z.number().min(1, "Cena musi być większa od 0"),
  currency: z.string().default("CHF"),
  vehicleType: z.enum(["car", "motorcycle", "auction"]),
  brand: z.string().min(1, "Wybierz markę"),
  model: z.string().min(1, "Wybierz model"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0),
  fuelType: z.string().min(1, "Wybierz rodzaj paliwa"),
  transmission: z.string().min(1, "Wybierz skrzynię biegów"),
  condition: z.string().min(1, "Wybierz stan pojazdu"),
  address: z.string().min(5, "Podaj adres"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  placeId: z.string().optional()
})

type ListingFormData = z.infer<typeof listingSchema>

interface UploadedImage {
  id: string
  file: File
  preview: string
  uploaded: boolean
  progress: number
}

export default function DodajOgloszeniePage() {
  const router = useRouter()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formProgress, setFormProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      vehicleType: "car"
    }
  })

  const watchedFields = watch()

  // Oblicz postęp wypełnienia formularza
  useEffect(() => {
    const requiredFields = [
      'title', 'description', 'price', 'vehicleType', 'brand', 
      'model', 'year', 'mileage', 'fuelType', 'transmission', 
      'condition', 'address'
    ]
    
    const filledFields = requiredFields.filter(field => {
      const value = watchedFields[field as keyof ListingFormData]
      return value !== undefined && value !== '' && value !== 0
    })
    
    const progress = Math.round((filledFields.length / requiredFields.length) * 100)
    setFormProgress(progress)
  }, [watchedFields])

  // Initialize Google Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initializeMap()
    }
  }, [])

  const initializeMap = () => {
    const mapElement = document.getElementById('gmap')
    if (!mapElement) return

    const mapInstance = new google.maps.Map(mapElement, {
      zoom: 7,
      center: { lat: 46.8182, lng: 8.2275 } // Switzerland center
    })

    const markerInstance = new google.maps.Marker({
      map: mapInstance,
      draggable: true
    })

    setMap(mapInstance)
    setMarker(markerInstance)

    // Setup autocomplete
    const input = document.getElementById('address') as HTMLInputElement
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'ch' }
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry?.location) {
          const location = place.geometry.location
          mapInstance.panTo(location)
          mapInstance.setZoom(14)
          markerInstance.setPosition(location)
          
          setValue('lat', location.lat())
          setValue('lng', location.lng())
          setValue('placeId', place.place_id || '')
        }
      })
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)
        
        const newImage: UploadedImage = {
          id: imageId,
          file,
          preview,
          uploaded: false,
          progress: 0
        }
        
        setImages(prev => [...prev, newImage])
        uploadImageAsync(newImage)
      }
    })
  }

  const uploadImageAsync = async (image: UploadedImage) => {
    try {
      const formData = new FormData()
      formData.append('image', image.file)

      // Symulacja uploadu z progress
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, progress } : img
          ))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, uploaded: true, progress: 100 } : img
          ))
          toast.success("Zdjęcie zostało przesłane")
        }
      })

      xhr.addEventListener('error', () => {
        setImages(prev => prev.filter(img => img.id !== image.id))
        toast.error("Błąd podczas przesyłania zdjęcia")
      })

      xhr.open('POST', '/api/upload-image')
      xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '')
      xhr.send(formData)

    } catch (error) {
      console.error('Upload error:', error)
      setImages(prev => prev.filter(img => img.id !== image.id))
      toast.error("Błąd podczas przesyłania zdjęcia")
    }
  }

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === imageId)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== imageId)
    })
  }

  const onSubmit = async (data: ListingFormData) => {
    if (images.length === 0) {
      toast.error("Dodaj co najmniej jedno zdjęcie")
      return
    }

    if (images.some(img => !img.uploaded)) {
      toast.error("Poczekaj na zakończenie przesyłania wszystkich zdjęć")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          images: images.map(img => img.id)
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Ogłoszenie zostało opublikowane!")
        
        // Przekierowanie na odpowiednią kategorię
        const category = data.vehicleType === 'motorcycle' ? 'moto' 
                      : data.vehicleType === 'car' ? 'auto' 
                      : 'aukcje'
        
        router.push(`/ogloszenia?category=${category}`)
      } else {
        throw new Error('Błąd podczas publikowania ogłoszenia')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error("Błąd podczas publikowania ogłoszenia")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dodaj ogłoszenie</h1>
              <p className="text-muted-foreground">
                Sprzedaj swój pojazd szybko i bezpiecznie
              </p>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Postęp wypełnienia</span>
                  <span>{formProgress}%</span>
                </div>
                <Progress value={formProgress} className="h-2" />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Image Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Zdjęcia pojazdu
                  </CardTitle>
                  <CardDescription>
                    Dodaj zdjęcia swojego pojazdu. Pierwsze zdjęcie będzie głównym.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Kliknij, aby dodać zdjęcia
                        </p>
                        <p className="text-sm text-muted-foreground">
                          lub przeciągnij i upuść pliki tutaj
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Maksymalnie 10 zdjęć, każde do 5MB
                        </p>
                      </label>
                    </div>

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square relative rounded-lg overflow-hidden border">
                              <Image
                                src={image.preview}
                                alt={`Zdjęcie ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              {!image.uploaded && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-xs">{image.progress}%</p>
                                  </div>
                                </div>
                              )}
                              {image.uploaded && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2 text-xs">
                                Główne zdjęcie
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Dane pojazdu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-6">
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
                      <Label htmlFor="vehicleType">Typ pojazdu *</Label>
                      <Select onValueChange={(value) => setValue("vehicleType", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz typ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">🚗 Samochód</SelectItem>
                          <SelectItem value="motorcycle">🏍️ Motocykl</SelectItem>
                          <SelectItem value="auction">🔨 Aukcja</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vehicleType && (
                        <p className="text-sm text-red-500 mt-1">{errors.vehicleType.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Opis pojazdu *</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Opisz szczegółowo swój pojazd..."
                      rows={6}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Technical Details */}
                  <div className="grid md:grid-cols-3 gap-6">
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
                          <SelectItem value="toyota">Toyota</SelectItem>
                          <SelectItem value="other">Inna</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.brand && (
                        <p className="text-sm text-red-500 mt-1">{errors.brand.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        {...register("model")}
                        placeholder="np. X5"
                      />
                      {errors.model && (
                        <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
                      )}
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
                      {errors.year && (
                        <p className="text-sm text-red-500 mt-1">{errors.year.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="mileage">Przebieg (km) *</Label>
                      <Input
                        id="mileage"
                        type="number"
                        {...register("mileage", { valueAsNumber: true })}
                        placeholder="50000"
                        min="0"
                      />
                      {errors.mileage && (
                        <p className="text-sm text-red-500 mt-1">{errors.mileage.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="fuelType">Rodzaj paliwa *</Label>
                      <Select onValueChange={(value) => setValue("fuelType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz paliwo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Benzyna</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Elektryczny</SelectItem>
                          <SelectItem value="hybrid">Hybryda</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.fuelType && (
                        <p className="text-sm text-red-500 mt-1">{errors.fuelType.message}</p>
                      )}
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
                      {errors.transmission && (
                        <p className="text-sm text-red-500 mt-1">{errors.transmission.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="condition">Stan pojazdu *</Label>
                      <Select onValueChange={(value) => setValue("condition", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz stan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nowy</SelectItem>
                          <SelectItem value="used">Używany</SelectItem>
                          <SelectItem value="damaged">Uszkodzony</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.condition && (
                        <p className="text-sm text-red-500 mt-1">{errors.condition.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="price">Cena *</Label>
                      <div className="flex">
                        <Input
                          id="price"
                          type="number"
                          {...register("price", { valueAsNumber: true })}
                          placeholder="25000"
                          min="1"
                          className="rounded-r-none"
                        />
                        <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted">
                          CHF
                        </div>
                      </div>
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Lokalizacja
                  </CardTitle>
                  <CardDescription>
                    Podaj lokalizację swojego pojazdu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Adres *</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="Miasto, ulica, nr domu"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div id="gmap" className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Mapa zostanie załadowana po podaniu adresu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Po opublikowaniu ogłoszenia będzie ono widoczne dla wszystkich użytkowników. 
                        Upewnij się, że wszystkie dane są poprawne.
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || formProgress < 100 || images.some(img => !img.uploaded)}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Publikowanie...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Opublikuj ogłoszenie
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Publikując ogłoszenie akceptujesz nasze{" "}
                      <a href="/regulamin" className="underline hover:no-underline">
                        Warunki użytkowania
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      {/* Google Maps Script */}
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
        async
        defer
      ></script>
    </>
  )
}
