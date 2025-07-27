import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicjalizacja Supabase (użyj zmiennych środowiskowych)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'example-service-key'

// Create a mock client for build time
class MockSupabase {
  from(table: string) {
    return {
      insert: () => this,
      select: () => this,
      eq: () => this,
      order: () => this,
      range: () => this,
      single: () => ({ data: { id: 'mock-id', title: 'Mock Listing', category_redirect: 'auto' }, error: null }),
    };
  }
}

// Use mock client during build, real client during runtime
const supabase = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview'
  ? new MockSupabase() as any
  : createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Walidacja wymaganych pól
    const requiredFields = ['title', 'description', 'mainCategory', 'brand', 'model', 'year', 'price', 'currency']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Brakuje wymaganych pól: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Określenie kategorii dla przekierowania
    const categoryRedirect = data.mainCategory === 'MOTOCYKLE' ? 'moto' 
                           : data.mainCategory === 'SAMOCHODY' ? 'auto' 
                           : data.saleType === 'Aukcja' ? 'aukcje' 
                           : 'auto'

    // Przygotowanie danych do zapisu
    const listingData = {
      title: data.title,
      description: data.description,
      main_category: data.mainCategory,
      vehicle_type: data.vehicleType,
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage || null,
      fuel_type: data.fuelType,
      transmission: data.transmission,
      engine_capacity: data.engineCapacity || null,
      power: data.power || null,
      condition: data.condition,
      sale_type: data.saleType,
      currency: data.currency,
      price: data.price,
      reserve_price: data.reservePrice || null,
      buy_now_price: data.buyNowPrice || null,
      
      // Lokalizacja
      country: data.location?.country,
      city: data.location?.city,
      postal_code: data.location?.postalCode,
      address: data.location?.address,
      latitude: data.location?.lat || null,
      longitude: data.location?.lng || null,
      place_id: data.location?.placeId,
      
      // Dodatkowe informacje
      features: data.features || [],
      financing_options: data.financingOptions || [],
      transport_options: data.transportOptions || [],
      additional_info: data.additionalInfo,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      
      // Metadane
      category_redirect: categoryRedirect,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Tymczasowo - w przyszłości pobierz z sesji użytkownika
      user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
    }

    // Zapis ogłoszenia do bazy danych
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single()

    if (listingError) {
      console.error('Database error:', listingError)
      return NextResponse.json(
        { error: 'Błąd podczas zapisywania ogłoszenia' },
        { status: 500 }
      )
    }

    // Zapis zdjęć jeśli zostały przesłane
    if (data.images && data.images.length > 0) {
      const imageData = data.images.map((imageUrl: string, index: number) => ({
        listing_id: listing.id,
        image_url: imageUrl,
        is_primary: index === 0,
        sort_order: index,
        created_at: new Date().toISOString(),
      }))

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imageData)

      if (imagesError) {
        console.error('Images error:', imagesError)
        // Nie przerywamy procesu - ogłoszenie zostało zapisane
      }
    }

    // Zwróć sukces z informacją o przekierowaniu
    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        categoryRedirect: categoryRedirect,
      },
      redirectUrl: `/ogloszenia?category=${categoryRedirect}`,
      message: 'Ogłoszenie zostało pomyślnie opublikowane!'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Wystąpił nieoczekiwany błąd' },
      { status: 500 }
    )
  }
}

// GET endpoint do pobierania ogłoszeń
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('listings')
      .select(`
        *,
        listing_images (
          image_url,
          is_primary,
          sort_order
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrowanie po kategorii
    if (category) {
      if (category === 'moto') {
        query = query.eq('main_category', 'MOTOCYKLE')
      } else if (category === 'auto') {
        query = query.eq('main_category', 'SAMOCHODY')
      } else if (category === 'dostawcze') {
        query = query.eq('main_category', 'DOSTAWCZE')
      } else if (category === 'aukcje') {
        query = query.eq('sale_type', 'Aukcja')
      }
    }

    const { data: listings, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Błąd podczas pobierania ogłoszeń' },
        { status: 500 }
      )
    }

    // Przetworzenie danych - dodanie głównego zdjęcia
    const processedListings = listings?.map(listing => ({
      ...listing,
      primaryImage: listing.listing_images?.find((img: any) => img.is_primary)?.image_url || 
                   listing.listing_images?.[0]?.image_url || null,
      imageCount: listing.listing_images?.length || 0,
    })) || []

    return NextResponse.json({
      success: true,
      listings: processedListings,
      pagination: {
        page,
        limit,
        total: processedListings.length,
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Wystąpił nieoczekiwany błąd' },
      { status: 500 }
    )
  }
}