import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  createErrorResponse,
  createSuccessResponse
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type Package = Database['public']['Tables']['packages']['Row']

/**
 * GET /api/packages
 * Get all active packages
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient(req)
    const { searchParams } = new URL(request.url)
    
    // Optional filters
    const isActive = searchParams.get('active') !== 'false'
    const userType = searchParams.get('user_type') // 'private' or 'dealer'
    
    let query = supabase
      .from('packages')
      .select('*')
      .order('sort_order', { ascending: true })
    
    // Filter by active status
    if (isActive) {
      query = query.eq('is_active', true)
    }
    
    const { data: packages, error } = await query
    
    if (error) {
      console.error('Error fetching packages:', error)
      return createErrorResponse('Failed to fetch packages', 500)
    }
    
    // Filter packages based on user type if specified
    let filteredPackages = packages || []
    
    if (userType === 'private') {
      // Private users can see all packages including free ones
      filteredPackages = packages || []
    } else if (userType === 'dealer') {
      // Dealers typically don't need free packages, focus on premium/dealer packages
      filteredPackages = (packages || []).filter(pkg => 
        pkg.price_chf > 0 || pkg.name_en.toLowerCase().includes('dealer')
      )
    }
    
    return createSuccessResponse({
      data: filteredPackages,
      count: filteredPackages.length
    }, 200)
    
  } catch (error) {
    console.error('Unexpected error in GET /api/packages:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

/**
 * POST /api/packages
 * Create a new package (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createServerComponentClient(req)
    
    // Validate required fields
    const requiredFields = ['name_en', 'name_de', 'name_fr', 'name_pl', 'price_chf', 'duration_days']
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return createErrorResponse(`Missing required field: ${field}`, 400)
      }
    }
    
    // Set defaults
    const packageData = {
      ...body,
      max_images: body.max_images || 5,
      is_featured: body.is_featured || false,
      is_premium: body.is_premium || false,
      is_active: body.is_active !== false, // Default to true
      sort_order: body.sort_order || 0,
      features: body.features || []
    }
    
    const { data: newPackage, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating package:', error)
      return createErrorResponse('Failed to create package', 500)
    }
    
    return createSuccessResponse({
      data: newPackage,
      message: 'Package created successfully'
    }, 201)
    
  } catch (error) {
    console.error('Unexpected error in POST /api/packages:', error)
    return createErrorResponse('Internal server error', 500)
  }
}