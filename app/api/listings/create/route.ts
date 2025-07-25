import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { modernListingSchemaRefined } from "@/lib/schemas/modern-listing-schema"

// Funkcja do tworzenia klienta Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    // Sprawdź czy Supabase jest skonfigurowany
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
      // Tryb demo - symuluj tworzenie ogłoszenia
      const body = await request.json()
      
      // Walidacja danych wejściowych
      const validationResult = modernListingSchemaRefined.safeParse(body)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: "Nieprawidłowe dane formularza",
            details: validationResult.error.errors
          },
          { status: 400 }
        )
      }

      // Symuluj delay tworzenia
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Zwróć mock response
      const mockId = `demo_${Date.now()}`
      return NextResponse.json({
        success: true,
        id: mockId,
        message: "Ogłoszenie zostało pomyślnie utworzone (tryb demo)",
        listing: {
          id: mockId,
          title: validationResult.data.title,
          category: validationResult.data.mainCategory,
          saleType: validationResult.data.saleType,
        }
      })
    }

    const supabase = getSupabaseClient()
    const body = await request.json()
    
    // Walidacja danych wejściowych
    const validationResult = modernListingSchemaRefined.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Nieprawidłowe dane formularza",
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Automatyczne przypisywanie kategorii na podstawie typu sprzedaży
    let finalCategory = data.mainCategory
    if (data.saleType === "Aukcja") {
      finalCategory = "AUKCJE"
    }

    // Rozpoczęcie transakcji - najpierw utwórz ogłoszenie
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        title: data.title,
        description: data.description,
        category: finalCategory,
        sale_type: data.saleType,
        price: data.price,
        currency: data.currency,
        auction_end_date: data.auctionEndDate?.toISOString(),
        min_bid_increment: data.minBidIncrement,
        
        // Dane pojazdu
        brand: data.brand,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        engine_capacity: data.engineCapacity,
        power: data.power,
        fuel_type: data.fuelType,
        transmission: data.transmission,
        condition: data.condition,
        
        // Historia pojazdu
        accident_free: data.accidentFree,
        has_service_book: data.hasServiceBook,
        
        // Gwarancja
        warranty: data.warranty,
        warranty_months: data.warrantyMonths,
        
        // Wyposażenie (jako JSON)
        features: data.features,
        
        // Status
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (listingError) {
      console.error("Błąd tworzenia ogłoszenia:", listingError)
      return NextResponse.json(
        { error: "Błąd podczas tworzenia ogłoszenia" },
        { status: 500 }
      )
    }

    // Dodaj lokalizację
    const { error: locationError } = await supabase
      .from("locations")
      .insert({
        listing_id: listing.id,
        country: data.location.country,
        city: data.location.city,
        postal_code: data.location.postalCode,
        latitude: data.location.coordinates.lat,
        longitude: data.location.coordinates.lng,
        place_id: data.location.placeId,
      })

    if (locationError) {
      console.error("Błąd dodawania lokalizacji:", locationError)
      // Usuń ogłoszenie jeśli lokalizacja się nie udała
      await supabase.from("listings").delete().eq("id", listing.id)
      return NextResponse.json(
        { error: "Błąd podczas dodawania lokalizacji" },
        { status: 500 }
      )
    }

    // Dodaj informacje kontaktowe
    const { error: contactError } = await supabase
      .from("contact_info")
      .insert({
        listing_id: listing.id,
        name: data.contactInfo.name,
        phone: data.contactInfo.phone,
        email: data.contactInfo.email,
        preferred_contact: data.contactInfo.preferredContact,
      })

    if (contactError) {
      console.error("Błąd dodawania kontaktu:", contactError)
      // Usuń ogłoszenie i lokalizację jeśli kontakt się nie udał
      await supabase.from("locations").delete().eq("listing_id", listing.id)
      await supabase.from("listings").delete().eq("id", listing.id)
      return NextResponse.json(
        { error: "Błąd podczas dodawania informacji kontaktowych" },
        { status: 500 }
      )
    }

    // Dodaj zdjęcia jeśli zostały przesłane
    if (body.imageUrls && body.imageUrls.length > 0) {
      const imageInserts = body.imageUrls.map((url: string, index: number) => ({
        listing_id: listing.id,
        image_url: url,
        display_order: index + 1,
        is_primary: index === 0,
      }))

      const { error: imagesError } = await supabase
        .from("listing_images")
        .insert(imageInserts)

      if (imagesError) {
        console.error("Błąd dodawania zdjęć:", imagesError)
        // Nie usuwamy ogłoszenia z powodu błędu zdjęć - można je dodać później
      }
    }

    // Zwróć sukces z ID ogłoszenia
    return NextResponse.json({
      success: true,
      id: listing.id,
      message: "Ogłoszenie zostało pomyślnie utworzone",
      listing: {
        id: listing.id,
        title: listing.title,
        category: finalCategory,
        saleType: data.saleType,
      }
    })

  } catch (error) {
    console.error("Błąd API tworzenia ogłoszenia:", error)
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    )
  }
}

// Endpoint do pobierania ogłoszenia (opcjonalnie)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Brak ID ogłoszenia" },
        { status: 400 }
      )
    }

    // Pobierz ogłoszenie z powiązanymi danymi
    const { data: listing, error } = await supabase
      .from("listings")
      .select(`
        *,
        locations (*),
        contact_info (*),
        listing_images (*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Błąd pobierania ogłoszenia:", error)
      return NextResponse.json(
        { error: "Ogłoszenie nie zostało znalezione" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      listing
    })

  } catch (error) {
    console.error("Błąd API pobierania ogłoszenia:", error)
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    )
  }
}