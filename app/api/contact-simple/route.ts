import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

/**
 * POST /api/contact
 * Submit a contact form message with basic validation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Extract and validate the basic required fields
    const { name, email, subject, message, category = 'general_inquiry', language = 'pl' } = body
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }
    
    // Basic email validation
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Podaj poprawny adres email' },
        { status: 400 }
      )
    }
    
    // Create Supabase client
    const supabase = createClient()
    
    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''
    
    // Store contact message in database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject,
        message,
        category,
        language,
        ip_address: clientIP,
        user_agent: userAgent,
        status: 'new'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error storing contact message:', error)
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas zapisywania wiadomości' },
        { status: 500 }
      )
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Wiadomość została wysłana pomyślnie',
        data: {
          id: data.id,
          created_at: data.created_at
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania formularza kontaktowego' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/contact
 * Get basic contact form configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'pl'
    
    // Create Supabase client
    const supabase = createClient()
    
    // Get contact categories
    const { data: categories, error } = await supabase
      .from('contact_categories')
      .select('*')
      .order('position', { ascending: true })
    
    if (error) {
      console.error('Error fetching contact categories:', error)
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas pobierania kategorii kontaktu' },
        { status: 500 }
      )
    }
    
    // Format categories for frontend
    const formattedCategories: Record<string, { label: string, icon?: string }> = {}
    categories?.forEach(category => {
      const nameField = `name_${language}` in category && category[`name_${language}`]
        ? `name_${language}`
        : 'name'
        
      formattedCategories[category.slug] = {
        label: category[nameField as keyof typeof category] as string,
        icon: category.icon
      }
    })
    
    return NextResponse.json({
      categories: formattedCategories,
      config: {
        max_message_length: 5000,
        min_message_length: 20,
        supported_languages: ['de', 'fr', 'pl', 'en'],
        default_language: 'de'
      }
    })
  } catch (error) {
    console.error('Contact configuration error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania konfiguracji kontaktu' },
      { status: 500 }
    )
  }
}
