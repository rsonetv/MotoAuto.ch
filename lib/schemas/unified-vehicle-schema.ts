import { z } from "zod"

const fileSchema = z.object({
  file: z.instanceof(File),
  preview: z.string(),
  name: z.string(),
  size: z.number(),
})

const baseSchema = z.object({
  // Podstawowe informacje
  title: z
    .string()
    .min(10, "Tytuł musi mieć co najmniej 10 znaków.")
    .max(100, "Tytuł nie może przekraczać 100 znaków."),
  description: z
    .string()
    .min(50, "Opis musi mieć co najmniej 50 znaków.")
    .max(5000, "Opis nie może przekraczać 5000 znaków."),
  mainCategory: z.enum(["SAMOCHODY", "MOTOCYKLE", "DOSTAWCZE"]),
  saleType: z.enum(["Aukcja", "Kup Teraz"]),

  // Ceny
  price: z.coerce.number().positive("Cena musi być liczbą dodatnią."),
  currency: z.enum(["CHF", "EUR", "USD"]).default("CHF"),

  // Aukcja (opcjonalne)
  auctionEndDate: z.date().optional(),
  minBidIncrement: z.coerce.number().positive("Kwota musi być dodatnia.").optional(),
  reservePrice: z.coerce.number().positive("Cena minimalna musi być dodatnia.").optional(),

  // Dane pojazdu
  brand: z.string().min(1, "Marka jest wymagana."),
  model: z.string().min(1, "Model jest wymagany."),
  year: z.coerce
    .number()
    .min(1900, "Rok musi być po 1900.")
    .max(new Date().getFullYear() + 1, `Rok nie może być w przyszłości.`),
  mileage: z.coerce.number().int().min(0, "Przebieg nie może być ujemny."),
  engineCapacity: z.coerce.number().positive("Pojemność musi być liczbą dodatnią."),

  // Specyfikacja techniczna
  power: z.coerce.number().positive("Moc musi być liczbą dodatnią."),
  fuelType: z.string().min(1, "Rodzaj paliwa jest wymagany."),
  transmission: z.string().min(1, "Skrzynia biegów jest wymagana."),
  condition: z.string().min(1, "Stan pojazdu jest wymagany."),

  // Historia pojazdu
  accidentFree: z.boolean().default(true),
  hasServiceBook: z.boolean().default(false),

  // Multimedia
  images: z
    .array(fileSchema)
    .min(1, "Wymagane jest co najmniej jedno zdjęcie.")
    .max(12, "Można dodać maksymalnie 12 zdjęć."),
  images360: z.array(fileSchema).optional(),

  // Lokalizacja
  location: z.object({
    country: z.string().min(1, "Kraj jest wymagany."),
    city: z.string().min(1, "Miasto jest wymagane."),
    postalCode: z.string().optional(),
  }),

  // Opcje dodatkowe
})

const carSchema = baseSchema.extend({
  mainCategory: z.literal("SAMOCHODY"),
  bodyType: z.string().min(1, "Rodzaj nadwozia jest wymagany."),
})

const motorcycleSchema = baseSchema.extend({
  mainCategory: z.literal("MOTOCYKLE"),
  motorcycleType: z.string().min(1, "Rodzaj motocykla jest wymagany."),
  licenseCategory: z.string().min(1, "Kategoria prawa jazdy jest wymagana."),
})

const commercialSchema = baseSchema.extend({
  mainCategory: z.literal("DOSTAWCZE"),
  maxWeight: z.coerce.number().positive("Maksymalna masa musi być dodatnia.").optional(),
  loadCapacity: z.coerce.number().positive("Ładowność musi być dodatnia.").optional(),
})

export const unifiedVehicleSchema = z
  .discriminatedUnion("mainCategory", [carSchema, motorcycleSchema, commercialSchema])
  .refine(
    (data) => {
      if (data.saleType === "Aukcja") {
        return !!data.auctionEndDate && !!data.minBidIncrement
      }
      return true
    },
    {
      message: "Data zakończenia aukcji i minimalna kwota postąpienia są wymagane dla aukcji.",
      path: ["auctionEndDate"],
    },
  )

export type UnifiedVehicleFormValues = z.infer<typeof unifiedVehicleSchema>
