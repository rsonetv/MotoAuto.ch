import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSuccessResponse } from "@/lib/auth-middleware"
import { packagesSchema, type Package } from "@/lib/schemas/packages"
import { apiHandler, ApiError } from "@/lib/api-utils"
import type { Database } from "@/lib/database.types"

async function getPackages(request: NextRequest) {
  const supabase = supabaseAdmin
  const { searchParams } = new URL(request.url)
  
  const isActive = searchParams.get('active') !== 'false'
  const userType = searchParams.get('user_type')
  
  let query = supabase
    .from('packages')
    .select('*')
    .order('id', { ascending: true })
  
  if (isActive) {
    query = query.eq('is_active', true)
  }
  
  const { data: packages, error } = await query
  
  if (error) {
    throw new ApiError('Failed to fetch packages', 500)
  }
  
  let filteredPackages: Package[] = packages || []
  
  if (userType === 'dealer') {
    filteredPackages = filteredPackages.filter((pkg) =>
      (pkg.price ?? 0) > 0 || (pkg.name_en ?? '').toLowerCase().includes('dealer')
    )
  }

  const parsed = packagesSchema.safeParse(filteredPackages)

  if (!parsed.success) {
    throw new ApiError('Failed to validate package data', 500)
  }
  
  return createSuccessResponse({
    data: parsed.data,
    count: parsed.data.length
  }, 200)
}

async function createPackage(request: NextRequest) {
  const body = await request.json()
  const supabase = supabaseAdmin
  
  const requiredFields = ['name_en', 'name_de', 'name_fr', 'name_pl', 'price_chf', 'duration_days']
  for (const field of requiredFields) {
    if (!body[field] && body[field] !== 0) {
      throw new ApiError(`Missing required field: ${field}`, 400)
    }
  }
  
  const packageData = {
    ...body,
    max_images: body.max_images || 5,
    is_featured: body.is_featured || false,
    is_premium: body.is_premium || false,
    is_active: body.is_active !== false,
    sort_order: body.sort_order || 0,
    features: body.features || []
  }
  
  const { data: newPackage, error } = await supabase
    .from('packages')
    .insert(packageData)
    .select()
    .single()
  
  if (error) {
    throw new ApiError('Failed to create package', 500)
  }
  
  return createSuccessResponse({
    data: newPackage,
    message: 'Package created successfully'
  }, 201)
}

export const GET = apiHandler(getPackages)
export const POST = apiHandler(createPackage)