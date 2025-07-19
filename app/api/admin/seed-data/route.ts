import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

/**
 * POST /api/admin/seed-data
 * Seeds the database with sample data using admin privileges
 * This bypasses RLS policies to insert test data
 */
export async function POST() {
  try {
    const testUserId = "00000000-0000-0000-0000-000000000001"

    // 1. Create demo profile first
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: testUserId,
        email: "demo@motoauto.ch",
        full_name: "MotoAuto Demo User",
        email_verified: true,
        is_dealer: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (profileError) {
      console.error("Error creating demo profile:", profileError)
      return NextResponse.json(
        { success: false, error: `Profile creation failed: ${profileError.message}` },
        { status: 500 },
      )
    }

    // 2. Insert sample listings
    const sampleListings = [
      {
        user_id: testUserId,
        title: "Audi A4 Avant 2.0 TFSI quattro",
        description:
          "Piękny Audi A4 Avant w doskonałym stanie technicznym. Pierwszy właściciel, serwisowany w ASO. Kompletna dokumentacja serwisowa, bezwypadkowy.",
        price: 45000,
        category: "auto" as const,
        brand: "Audi",
        model: "A4 Avant",
        year: 2020,
        mileage: 85000,
        engine_capacity: 2000,
        power: 190,
        fuel_type: "Benzyna",
        transmission: "Automatyczna",
        drive_type: "AWD",
        body_type: "Kombi",
        doors: 5,
        seats: 5,
        color: "Czarny",
        condition: "Bardzo dobry",
        accident_free: true,
        owners_count: 1,
        has_service_book: true,
        location: "Zürich",
        postal_code: "8001",
        images: ["/placeholder.svg?height=300&width=400&text=Audi+A4"],
        status: "active" as const,
        published_at: new Date().toISOString(),
        featured: true,
      },
      {
        user_id: testUserId,
        title: "BMW 320d xDrive Touring",
        description:
          "Niezawodne BMW 320d z napędem na cztery koła. Idealny do długich podróży. Ekonomiczny silnik diesel, automatyczna skrzynia biegów.",
        price: 38000,
        category: "auto" as const,
        brand: "BMW",
        model: "320d",
        year: 2019,
        mileage: 120000,
        engine_capacity: 2000,
        power: 190,
        fuel_type: "Diesel",
        transmission: "Automatyczna",
        drive_type: "AWD",
        body_type: "Kombi",
        doors: 5,
        seats: 5,
        color: "Biały",
        condition: "Dobry",
        accident_free: true,
        owners_count: 2,
        has_service_book: true,
        location: "Basel",
        postal_code: "4001",
        images: ["/placeholder.svg?height=300&width=400&text=BMW+320d"],
        status: "active" as const,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: testUserId,
        title: "Yamaha YZF-R1M",
        description:
          "Topowy motocykl sportowy Yamaha R1M. Limitowana edycja z pakietem elektroniki. Idealny stan, mało używany, garaż.",
        price: 25000,
        category: "moto" as const,
        brand: "Yamaha",
        model: "YZF-R1M",
        year: 2022,
        mileage: 8500,
        engine_capacity: 998,
        power: 200,
        fuel_type: "Benzyna",
        transmission: "Manualna",
        body_type: "Sportowy",
        seats: 2,
        color: "Niebieski",
        condition: "Bardzo dobry",
        accident_free: true,
        owners_count: 1,
        location: "Bern",
        postal_code: "3001",
        images: ["/placeholder.svg?height=300&width=400&text=Yamaha+R1M"],
        status: "active" as const,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        featured: true,
      },
      {
        user_id: testUserId,
        title: "Porsche 911 Carrera S - AUKCJA",
        description:
          "Klasyczne Porsche 911 na aukcji! Rzadki egzemplarz w doskonałym stanie. Kompletna historia serwisowa, oryginalne lakierowanie.",
        price: 85000,
        category: "auto" as const,
        brand: "Porsche",
        model: "911",
        year: 2018,
        mileage: 65000,
        engine_capacity: 3000,
        power: 420,
        fuel_type: "Benzyna",
        transmission: "Automatyczna",
        drive_type: "RWD",
        body_type: "Coupe",
        doors: 2,
        seats: 4,
        color: "Czerwony",
        condition: "Bardzo dobry",
        accident_free: true,
        owners_count: 2,
        has_service_book: true,
        location: "Zürich",
        postal_code: "8002",
        images: ["/placeholder.svg?height=300&width=400&text=Porsche+911"],
        is_auction: true,
        auction_start_time: new Date().toISOString(),
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        current_bid: 85000,
        min_bid_increment: 1000,
        reserve_price: 90000,
        status: "active" as const,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        featured: true,
      },
      {
        user_id: testUserId,
        title: "Mercedes-Benz C-Class AMG",
        description: "Sportowa wersja Mercedes C-Class z pakietem AMG. Doskonałe osiągi i luksusowe wykończenie.",
        price: 52000,
        category: "auto" as const,
        brand: "Mercedes-Benz",
        model: "C-Class",
        year: 2021,
        mileage: 45000,
        engine_capacity: 2000,
        power: 255,
        fuel_type: "Benzyna",
        transmission: "Automatyczna",
        drive_type: "RWD",
        body_type: "Sedan",
        doors: 4,
        seats: 5,
        color: "Srebrny",
        condition: "Bardzo dobry",
        accident_free: true,
        owners_count: 1,
        has_service_book: true,
        location: "Geneva",
        postal_code: "1201",
        images: ["/placeholder.svg?height=300&width=400&text=Mercedes+C-Class"],
        status: "active" as const,
        published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: testUserId,
        title: "Honda CBR1000RR Fireblade",
        description: "Legendarny Honda Fireblade w doskonałym stanie. Regularnie serwisowany, gotowy do jazdy.",
        price: 18000,
        category: "moto" as const,
        brand: "Honda",
        model: "CBR1000RR",
        year: 2020,
        mileage: 15000,
        engine_capacity: 1000,
        power: 189,
        fuel_type: "Benzyna",
        transmission: "Manualna",
        body_type: "Sportowy",
        seats: 2,
        color: "Czerwony",
        condition: "Dobry",
        accident_free: true,
        owners_count: 2,
        location: "Lausanne",
        postal_code: "1003",
        images: ["/placeholder.svg?height=300&width=400&text=Honda+CBR"],
        status: "active" as const,
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Insert listings using admin client
    const { data: insertedListings, error: listingsError } = await supabaseAdmin
      .from("listings")
      .insert(sampleListings)
      .select()

    if (listingsError) {
      console.error("Error inserting sample listings:", listingsError)
      return NextResponse.json(
        { success: false, error: `Listings insertion failed: ${listingsError.message}` },
        { status: 500 },
      )
    }

    // 3. Insert sample bids for the auction listing
    const auctionListing = insertedListings?.find((listing) => listing.is_auction)

    if (auctionListing) {
      const sampleBids = [
        {
          listing_id: auctionListing.id,
          user_id: testUserId,
          amount: 85000,
          placed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          listing_id: auctionListing.id,
          user_id: testUserId,
          amount: 87000,
          placed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const { error: bidsError } = await supabaseAdmin.from("bids").insert(sampleBids)

      if (bidsError) {
        console.error("Error inserting sample bids:", bidsError)
        // Don't fail the entire operation for bid errors
      }
    }

    // 4. Update view counts with random values
    if (insertedListings) {
      await Promise.all(
        insertedListings.map(async (listing) => {
          const randomViews = Math.floor(Math.random() * 1000) + 50
          await supabaseAdmin.from("listings").update({ views: randomViews }).eq("id", listing.id)
        }),
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded database with ${insertedListings?.length || 0} listings`,
      data: {
        listings: insertedListings?.length || 0,
        auction_listings: insertedListings?.filter((l) => l.is_auction).length || 0,
        featured_listings: insertedListings?.filter((l) => l.featured).length || 0,
      },
    })
  } catch (error) {
    console.error("Seed data error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
