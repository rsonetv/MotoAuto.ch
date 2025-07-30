import { z } from "zod"

// Form schema for vehicle listing
export const vehicleFormSchema = z.object({
  // Basic info
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków").max(100),
  description: z.string().min(20, "Opis musi mieć co najmniej 20 znaków"),
  vehicleType: z.enum(["car", "motorcycle"], {
    message: "Wybierz typ pojazdu",
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

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>
