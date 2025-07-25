import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
      // Tryb demo - symuluj upload
      const formData = await request.formData()
      const file = formData.get("image") as File
      
      if (!file) {
        return NextResponse.json(
          { error: "Brak pliku do przesłania" },
          { status: 400 }
        )
      }

      // Symuluj delay uploadu
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Zwróć mock URL
      return NextResponse.json({
        success: true,
        url: `https://demo.motoauto.ch/images/demo_${Date.now()}.jpg`,
        fileName: file.name,
        filePath: `demo/${file.name}`,
        size: file.size,
        type: file.type,
      })
    }

    const supabase = getSupabaseClient()
    const formData = await request.formData()
    const file = formData.get("image") as File
    const folder = formData.get("folder") as string || "listings"

    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku do przesłania" },
        { status: 400 }
      )
    }

    // Walidacja typu pliku
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP" },
        { status: 400 }
      )
    }

    // Walidacja rozmiaru pliku (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Plik jest za duży. Maksymalny rozmiar: 10MB" },
        { status: 400 }
      )
    }

    // Generowanie unikalnej nazwy pliku
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Konwersja File do ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload do Supabase Storage
    const { data, error } = await supabase.storage
      .from("vehicle-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Błąd uploadu do Supabase:", error)
      return NextResponse.json(
        { error: "Błąd podczas przesyłania pliku" },
        { status: 500 }
      )
    }

    // Pobieranie publicznego URL
    const { data: urlData } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      filePath: filePath,
      size: file.size,
      type: file.type,
    })

  } catch (error) {
    console.error("Błąd API uploadu:", error)
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    )
  }
}

// Endpoint do usuwania zdjęć
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("filePath")

    if (!filePath) {
      return NextResponse.json(
        { error: "Brak ścieżki pliku" },
        { status: 400 }
      )
    }

    // Usunięcie pliku z Supabase Storage
    const { error } = await supabase.storage
      .from("vehicle-images")
      .remove([filePath])

    if (error) {
      console.error("Błąd usuwania z Supabase:", error)
      return NextResponse.json(
        { error: "Błąd podczas usuwania pliku" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Plik został usunięty",
    })

  } catch (error) {
    console.error("Błąd API usuwania:", error)
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    )
  }
}