"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"

import { AsyncImageUpload } from "./async-image-upload"
import { GoogleMapsLocationPicker } from "./google-maps-location-picker"
import { FormProgress } from "./form-progress"

// Define the form schema directly in this file
const vehicleFormSchema = z.object({
  // Basic info
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków").max(100),
  description: z.string().min(20, "Opis musi mieć co najmniej 20 znaków"),
  vehicleType: z.enum(["car", "motorcycle"], {
    required_error: "Wybierz typ pojazdu",
  }),
  brand: z.string().min(1, "Wybierz markę"),
  model: z.string().min(1, "Wybierz model"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  
  // Technical specs
  mileage: z.coerce.number().min(0, "Podaj prawidłowy przebieg"),
  fuelType: z.string().min(1, "Wybierz rodzaj paliwa"),
  transmission: z.string().min(1, "Wybierz rodzaj skrzyni biegów"),
  condition: z.string().min(1, "Wybierz stan pojazdu"),
  engineSize: z.coerce.number().optional(),
  power: z.coerce.number().optional(),
  
  // Additional features
  accidentFree: z.boolean().default(false),
  serviceHistory: z.boolean().default(false),
  firstOwner: z.boolean().default(false),
  warranty: z.boolean().default(false),
  
  // Pricing
  price: z.coerce.number().min(1, "Cena musi być większa od zera"),
  currency: z.string().default("CHF"),
  negotiable: z.boolean().default(true),
  
  // Location
  address: z.string().min(5, "Wprowadź dokładny adres"),
  city: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  placeId: z.string(),
  
  // Images
  images: z.array(z.string()).min(1, "Dodaj przynajmniej jedno zdjęcie")
})

// Type inference
type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export function AddVehicleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedFields, setCompletedFields] = useState<string[]>([])
  
  // Mock data for dropdowns
  const brands = ["BMW", "Audi", "Mercedes", "Volkswagen", "Toyota", "Honda"]
  const models = ["3 Series", "A4", "C-Class", "Golf", "Corolla", "Civic"]
  const fuelTypes = ["Benzyna", "Diesel", "Elektryczny", "Hybryda"]
  const transmissions = ["Manualna", "Automatyczna"]
  const conditions = ["Nowy", "Używany", "Uszkodzony"]
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      vehicleType: "car",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: 0,
      fuelType: "",
      transmission: "",
      condition: "",
      engineSize: undefined,
      power: undefined,
      accidentFree: false,
      serviceHistory: false,
      firstOwner: false,
      warranty: false,
      price: 0,
      currency: "CHF",
      negotiable: true,
      address: "",
      city: "",
      lat: 0,
      lng: 0,
      placeId: "",
      images: []
    },
    mode: "onChange"
  })
  
  // Track form status and track completed fields
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && value[name as keyof VehicleFormValues]) {
        if (!completedFields.includes(name)) {
          setCompletedFields(prev => [...prev, name])
        }
      } else if (name && !value[name as keyof VehicleFormValues]) {
        setCompletedFields(prev => prev.filter(field => field !== name))
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form, completedFields])
  
  // Track completed fields
  useEffect(() => {
    const completed: string[] = []
    const values = form.getValues()
    
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== 0) {
        if (Array.isArray(value) && value.length > 0) {
          completed.push(key)
        } else if (typeof value === 'number' && value > 0) {
          completed.push(key)
        } else if (typeof value === 'string' && value.trim() !== '') {
          completed.push(key)
        } else if (typeof value === 'boolean') {
          completed.push(key)
        }
      }
    })
    
    setCompletedFields(completed)
  }, [form.watch()])
  
  // Function to handle images uploaded by the AsyncImageUpload component
  const handleImagesUploaded = (imageUrls: string[]) => {
    form.setValue("images", imageUrls);
  }
  
  // Function to handle location selected by the GoogleMapsLocationPicker component
  const handleLocationSelected = (location: { address: string; city?: string; lat: number; lng: number; placeId: string }) => {
    form.setValue("address", location.address);
    if (location.city) form.setValue("city", location.city);
    form.setValue("lat", location.lat);
    form.setValue("lng", location.lng);
    form.setValue("placeId", location.placeId);
  }
  
  const onSubmit = async (values: VehicleFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Determine category redirect
      const category = values.vehicleType === 'motorcycle' ? 'moto' : 'auto'
      
      console.log("Form submitted:", values)
      
      toast({
        title: "Ogłoszenie opublikowane!",
        description: "Twoje ogłoszenie zostało dodane i jest teraz widoczne dla innych użytkowników.",
      })
      
      // Redirect to listings page
      window.location.href = `/ogloszenia?category=${category}`
    } catch (error) {
      console.error("Error submitting form:", error)
      
      toast({
        title: "Wystąpił błąd!",
        description: "Nie udało się dodać ogłoszenia. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const requiredFields = [
    'title', 'description', 'vehicleType', 'brand', 'model', 'year',
    'mileage', 'fuelType', 'transmission', 'condition', 'price',
    'address', 'lat', 'lng', 'placeId', 'images'
  ]
  
  return (
    <div className="space-y-8">
      <FormProgress 
        requiredFields={requiredFields}
        completedFields={completedFields}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Zdjęcia pojazdu</CardTitle>
              <CardDescription>
                Dodaj co najmniej jedno zdjęcie. Pierwsze będzie zdjęciem głównym.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AsyncImageUpload onImagesUploaded={handleImagesUploaded} />
              {form.formState.errors.images && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.images.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as any}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ pojazdu *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz typ pojazdu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="car">Samochód</SelectItem>
                        <SelectItem value="motorcycle">Motocykl</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marka *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz markę" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł ogłoszenia *</FormLabel>
                    <FormControl>
                      <Input placeholder="np. BMW 320d 2018, stan idealny" {...field} />
                    </FormControl>
                    <FormDescription>
                      Podaj zwięzły i trafny tytuł ogłoszenia (5-100 znaków)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Opisz dokładnie stan pojazdu, historię, wyposażenie, etc." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Dokładny opis zwiększa szanse na szybką sprzedaż (min. 20 znaków)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Technical Specification Section */}
          <Card>
            <CardHeader>
              <CardTitle>Specyfikacja techniczna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rok produkcji *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="np. 2018" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Przebieg (km) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="np. 120000" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rodzaj paliwa *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz rodzaj paliwa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuelTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skrzynia biegów *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz rodzaj skrzyni" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transmissions.map(trans => (
                            <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="engineSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pojemność silnika (cm³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moc (KM)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control as any}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stan pojazdu *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz stan pojazdu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map(cond => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="accidentFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bezwypadkowy</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="serviceHistory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Książka serwisowa</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="firstOwner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pierwszy właściciel</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Gwarancja</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Cena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control as any}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cena *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control as any}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waluta</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz walutę" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control as any}
                name="negotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Możliwość negocjacji</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Lokalizacja</CardTitle>
              <CardDescription>
                Wprowadź dokładny adres lub wybierz na mapie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMapsLocationPicker onLocationSelected={handleLocationSelected} />
              {form.formState.errors.address && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.address.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Submit */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting || !form.formState.isValid}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publikowanie...
                </>
              ) : (
                <>
                  Opublikuj ogłoszenie
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
