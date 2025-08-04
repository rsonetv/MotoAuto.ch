import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  createErrorResponse,
  createSuccessResponse
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type Package = Database['public']['Tables']['packages']['Row']

interface PackageParams {
  params: {
    id: string
  }
}

/**
 * GET /api/packages/[id]
 * Get a specific package by ID
 */
export async function GET(request: NextRequest, { params }: PackageParams) {
  try {
    const packageId = params.id
    const supabase = await createServerComponentClient(request)
    
    const { data: package_data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Package not found', 404)
      }
      console.error('Error fetching package:', error)
      return createErrorResponse('Failed to fetch package', 500)
    }
    
    return createSuccessResponse({
      data: package_data
    }, 200)
    
  } catch (error) {
    console.error('Unexpected error in GET /api/packages/[id]:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

/**
 * PUT /api/packages/[id]
 * Update a specific package (admin only)
 */
export async function PUT(request: NextRequest, { params }: PackageParams) {
  try {
    const packageId = params.id
    const body = await request.json()
    const supabase = await createServerComponentClient(request)
    
    // Remove fields that shouldn't be updated directly
    const { id, created_at, updated_at, ...updateData } = body
    
    const { data: updatedPackage, error } = await supabase
      .from('packages')
      .update(updateData)
      .eq('id', packageId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Package not found', 404)
      }
      console.error('Error updating package:', error)
      return createErrorResponse('Failed to update package', 500)
    }
    
    return createSuccessResponse({
      data: updatedPackage,
      message: 'Package updated successfully'
    }, 200)
    
  } catch (error) {
    console.error('Unexpected error in PUT /api/packages/[id]:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

/**
 * DELETE /api/packages/[id]
 * Delete a specific package (admin only)
 */
export async function DELETE(request: NextRequest, { params }: PackageParams) {
  try {
    const packageId = params.id
    const supabase = await createServerComponentClient(request)
    
    // Check if package is being used in any payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id')
      .eq('package_id', packageId)
      .limit(1)
    
    if (paymentsError) {
      console.error('Error checking package usage:', paymentsError)
      return createErrorResponse('Failed to check package usage', 500)
    }
    
    if (payments && payments.length > 0) {
      return createErrorResponse('Cannot delete package that has been used in payments. Consider deactivating instead.', 400)
    }
    
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId)
    
    if (error) {
      console.error('Error deleting package:', error)
      return createErrorResponse('Failed to delete package', 500)
    }
    
    return createSuccessResponse({
      message: 'Package deleted successfully'
    }, 200)
    
  } catch (error) {
    console.error('Unexpected error in DELETE /api/packages/[id]:', error)
    return createErrorResponse('Internal server error', 500)
  }
}