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
  mainCategory: z.enum(["SAMOCHODY", "MOTOCYKLE"]),
  saleType: z.enum(["Aukcja", "Kup Teraz", "Aukcja + Kup Teraz"]),

  // Ceny i aukcja
  startingPrice: z.coerce.number().positive("Cena musi być liczbą dodatnią."),
  buyNowPrice: z.coerce.number().positive("Cena musi być liczbą dodatnią.").optional(),
  reservePrice: z.coerce.number().positive("Cena minimalna musi być dodatnia.").optional(),
  auctionEndDate: z.date().optional(),
  minBidIncrement: z.coerce.number().positive("Kwota musi być dodatnia.").optional(),
  autoExtend: z.boolean().default(false),
  currency: z.enum(["CHF", "EUR", "USD"]).default("CHF"),

  // Dane pojazdu
  brand: z.string().min(1, "Marka jest wymagana."),
  model: z.string().min(1, "Model jest wymagany."),
  year: z.coerce
    .number()
    .min(1900, "Rok musi być po 1900.")
    .max(new Date().getFullYear() + 1, `Rok nie może być w przyszłości.`),

  // Specyfikacja techniczna
  vin: z.string().length(17, "VIN musi mieć 17 znaków.").optional().or(z.literal("")),
  power: z.coerce.number().positive("Moc musi być liczbą dodatnią."),
  fuelType: z.string().min(1, "Rodzaj paliwa jest wymagany."),
  transmission: z.string().min(1, "Skrzynia biegów jest wymagana."),
  condition: z.string().min(1, "Stan pojazdu jest wymagany."),

  // Historia pojazdu
  ownersCount: z.coerce.number().int().min(0, "Liczba właścicieli nie może być ujemna.").optional(),
  hasServiceBook: z.boolean().default(false),
  accidentFree: z.boolean().default(true),
  origin: z.string().optional(),

  // Multimedia i dokumenty
  images: z
    .array(fileSchema)
    .min(1, "Wymagane jest co najmniej jedno zdjęcie.")
    .max(12, "Można dodać maksymalnie 12 zdjęć."),
  documents: z.array(fileSchema).max(5, "Można dodać maksymalnie 5 dokumentów.").optional(),

  // Lokalizacja
  location: z.object({
    country: z.string().min(1, "Kraj jest wymagany."),
    city: z.string().min(1, "Miasto jest wymagane."),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),

  // Opcje dodatkowe
  financingOptions: z.array(z.string()).optional(),
  transportOptions: z.array(z.string()).optional(),
  warranty: z.boolean().default(false),
  warrantyMonths: z.coerce.number().optional(),
})

const carSchema = baseSchema.extend({
  mainCategory: z.literal("SAMOCHODY"),
  mileage: z.coerce.number().int().min(0, "Przebieg nie może być ujemny."),
  engineCapacity: z.coerce.number().int().positive("Pojemność musi być liczbą dodatnią."),
  bodyType: z.string().min(1, "Rodzaj nadwozia jest wymagany."),
  segment: z.string().min(1, "Segment jest wymagany."),
  driveType: z.string().min(1, "Rodzaj napędu jest wymagany."),
  doors: z.coerce.number().int().min(2).max(5).optional(),
  seats: z.coerce.number().int().min(1).max(9).optional(),
})

const motorcycleSchema = baseSchema.extend({
  mainCategory: z.literal("MOTOCYKLE"),
  mileage: z.coerce.number().int().min(0, "Przebieg nie może być ujemny."),
  engineCapacity: z.string().min(1, "Pojemność jest wymagana."),
  motorcycleType: z.string().min(1, "Rodzaj motocykla jest wymagany."),
  licenseCategory: z.string().min(1, "Kategoria prawa jazdy jest wymagana."),
})

export const addVehicleSchema = z
  .discriminatedUnion("mainCategory", [carSchema, motorcycleSchema])
  .refine(
    (data) => {
      if (data.saleType.includes("Aukcja")) {
        return !!data.auctionEndDate && !!data.minBidIncrement
      }
      return true
    },
    {
      message: "Data zakończenia aukcji i minimalna kwota postąpienia są wymagane dla aukcji.",
      path: ["auctionEndDate"],
    },
  )
  .refine(
    (data) => {
      if (data.saleType === "Kup Teraz") {
        return !!data.buyNowPrice
      }
      if (data.saleType.includes("Aukcja")) {
        return data.buyNowPrice ? data.buyNowPrice > data.startingPrice : true
      }
      return true
    },
    {
      message: "Cena 'Kup Teraz' musi być wyższa od ceny wywoławczej.",
      path: ["buyNowPrice"],
    },
  )
  .refine(
    (data) => {
      if (data.reservePrice) {
        return data.reservePrice >= data.startingPrice
      }
      return true
    },
    {
      message: "Cena minimalna nie może być niższa od ceny wywoławczej.",
      path: ["reservePrice"],
    },
  )

export type AddVehicleFormValues = z.infer<typeof addVehicleSchema>
