import { z } from "zod"

// Schemat dla lokalizacji z Google Maps
const locationSchema = z.object({
  country: z.string().min(1, "Kraj jest wymagany"),
  city: z.string().min(1, "Miasto jest wymagane"),
  postalCode: z.string().min(1, "Kod pocztowy jest wymagany"),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  placeId: z.string().optional(),
})

// Schemat dla informacji kontaktowych
const contactInfoSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  phone: z.string().min(9, "Numer telefonu musi mieć co najmniej 9 cyfr"),
  email: z.string().email("Nieprawidłowy adres email"),
  preferredContact: z.enum(["phone", "email"]).default("phone"),
})

// Główny schemat formularza
export const modernListingSchema = z.object({
  // Podstawowe informacje
  title: z
    .string()
    .min(10, "Tytuł musi mieć co najmniej 10 znaków")
    .max(100, "Tytuł nie może przekraczać 100 znaków"),
  description: z
    .string()
    .min(50, "Opis musi mieć co najmniej 50 znaków")
    .max(5000, "Opis nie może przekraczać 5000 znaków"),
  mainCategory: z.enum(["SAMOCHODY", "MOTOCYKLE", "DOSTAWCZE"]),
  saleType: z.enum(["Aukcja", "Kup Teraz"]),

  // Ceny
  price: z.coerce.number().positive("Cena musi być liczbą dodatnią"),
  currency: z.enum(["CHF", "EUR", "USD"]).default("CHF"),

  // Aukcja (opcjonalne)
  auctionEndDate: z.date().optional(),
  minBidIncrement: z.coerce.number().positive("Kwota musi być dodatnia").optional(),

  // Dane pojazdu
  brand: z.string().min(1, "Marka jest wymagana"),
  model: z.string().min(1, "Model jest wymagany"),
  year: z.coerce
    .number()
    .min(1900, "Rok musi być po 1900")
    .max(new Date().getFullYear() + 1, "Rok nie może być w przyszłości"),
  mileage: z.coerce.number().int().min(0, "Przebieg nie może być ujemny"),
  engineCapacity: z.coerce.number().positive("Pojemność musi być liczbą dodatnią"),

  // Specyfikacja techniczna
  power: z.coerce.number().positive("Moc musi być liczbą dodatnią"),
  fuelType: z.string().min(1, "Rodzaj paliwa jest wymagany"),
  transmission: z.string().min(1, "Skrzynia biegów jest wymagana"),
  condition: z.string().min(1, "Stan pojazdu jest wymagany"),

  // Historia pojazdu
  accidentFree: z.boolean().default(true),
  hasServiceBook: z.boolean().default(false),

  // Zdjęcia (będą przesyłane asynchronicznie)
  images: z.array(z.string()).min(1, "Wymagane jest co najmniej jedno zdjęcie"),

  // Lokalizacja
  location: locationSchema,

  // Gwarancja
  warranty: z.boolean().default(false),
  warrantyMonths: z.coerce.number().int().min(1).max(120).optional(),

  // Dodatkowe wyposażenie
  features: z.array(z.string()).default([]),

  // Informacje kontaktowe
  contactInfo: contactInfoSchema,
})

// Walidacja warunkowa dla aukcji
export const modernListingSchemaRefined = modernListingSchema.refine(
  (data) => {
    if (data.saleType === "Aukcja") {
      return data.auctionEndDate && data.minBidIncrement
    }
    return true
  },
  {
    message: "Data zakończenia aukcji i minimalna kwota licytacji są wymagane dla aukcji",
    path: ["auctionEndDate"],
  }
).refine(
  (data) => {
    if (data.warranty && !data.warrantyMonths) {
      return false
    }
    return true
  },
  {
    message: "Okres gwarancji jest wymagany gdy gwarancja jest zaznaczona",
    path: ["warrantyMonths"],
  }
)

export type ModernListingFormValues = z.infer<typeof modernListingSchema>

// Dane BMW z podziałem na samochody i motocykle
export const bmwModels = {
  samochody: {
    "1 Series": ["116i", "118i", "120i", "125i", "M135i"],
    "2 Series": ["218i", "220i", "225i", "M240i", "M2"],
    "3 Series": ["318i", "320i", "325i", "330i", "335i", "M3"],
    "4 Series": ["420i", "425i", "430i", "435i", "M4"],
    "5 Series": ["520i", "525i", "530i", "535i", "540i", "M5"],
    "6 Series": ["630i", "640i", "650i", "M6"],
    "7 Series": ["730i", "740i", "750i", "760i"],
    "8 Series": ["840i", "850i", "M8"],
    "X1": ["sDrive18i", "sDrive20i", "xDrive20i", "xDrive25i"],
    "X2": ["sDrive18i", "sDrive20i", "xDrive20i", "xDrive25i"],
    "X3": ["sDrive20i", "xDrive20i", "xDrive30i", "M40i"],
    "X4": ["xDrive20i", "xDrive30i", "M40i"],
    "X5": ["xDrive30i", "xDrive40i", "xDrive50i", "M50i"],
    "X6": ["xDrive40i", "xDrive50i", "M50i"],
    "X7": ["xDrive40i", "xDrive50i", "M50i"],
    "Z4": ["sDrive20i", "sDrive30i", "M40i"],
    "i3": ["i3", "i3s"],
    "i4": ["eDrive40", "M50"],
    "iX": ["xDrive40", "xDrive50", "M60"],
  },
  motocykle: {
    "S Series": ["S 1000 RR", "S 1000 R", "S 1000 XR"],
    "R Series": ["R 1250 GS", "R 1250 RT", "R 1250 R", "R 1200 GS"],
    "F Series": ["F 850 GS", "F 750 GS", "F 900 R", "F 900 XR"],
    "G Series": ["G 310 GS", "G 310 R"],
    "K Series": ["K 1600 GT", "K 1600 GTL"],
    "C Series": ["C 400 GT", "C 650 GT"],
    "CE Series": ["CE 04"],
  },
}

// Funkcja pomocnicza do pobierania modeli na podstawie marki i kategorii
export const getModelsForBrand = (brand: string, category: "SAMOCHODY" | "MOTOCYKLE") => {
  if (brand === "BMW") {
    return category === "SAMOCHODY" ? bmwModels.samochody : bmwModels.motocykle
  }
  
  // Tutaj można dodać inne marki
  return {}
}