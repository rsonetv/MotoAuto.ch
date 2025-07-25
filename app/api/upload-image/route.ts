import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nie przesłano pliku' },
        { status: 400 }
      )
    }

    // Walidacja typu pliku
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Walidacja rozmiaru pliku (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Plik jest za duży. Maksymalny rozmiar: 10MB' },
        { status: 400 }
      )
    }

    // Konwersja pliku do buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generowanie unikalnej nazwy pliku
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${extension}`

    // Ścieżka do zapisu
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'listings')
    const filePath = join(uploadDir, fileName)

    // Utworzenie katalogu jeśli nie istnieje
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Zapis pliku
    await writeFile(filePath, buffer)

    // URL do pliku
    const fileUrl = `/uploads/listings/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas przesyłania pliku' },
      { status: 500 }
    )
  }
}

// Opcjonalnie: endpoint do usuwania plików
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'Nie podano nazwy pliku' },
        { status: 400 }
      )
    }

    const filePath = join(process.cwd(), 'public', 'uploads', 'listings', fileName)
    
    if (existsSync(filePath)) {
      const fs = await import('fs/promises')
      await fs.unlink(filePath)
      
      return NextResponse.json({
        success: true,
        message: 'Plik został usunięty'
      })
    } else {
      return NextResponse.json(
        { error: 'Plik nie istnieje' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas usuwania pliku' },
      { status: 500 }
    )
  }
}