import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Type-safe profile interface
export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_dealer: boolean
  free_listings_used: number
  total_listings?: number
  created_at: string
  updated_at: string
}

export interface AuthenticatedUser extends User {
  profile?: Profile
}

export interface AuthContext {
  user: AuthenticatedUser
  profile: Profile
}

/**
 * Authentication middleware for API routes
 * Verifies JWT token and fetches user profile with proper error handling
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return createErrorResponse("Missing or invalid authorization header", 401)
    }

    // Extract and validate token
    const token = authHeader.substring(7).trim()
    if (!token || token.length < 10) {
      return createErrorResponse("Invalid access token format", 401)
    }

    // Validate JWT format (basic check)
    const jwtPattern = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
    if (!jwtPattern.test(token)) {
      return createErrorResponse("Invalid token format", 401)
    }

    // Create Supabase client
    const supabase = createServerComponentClient()

    // Set the session with the provided token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error("Authentication error:", authError.message)
      return createErrorResponse("Invalid or expired token", 401)
    }

    if (!user) {
      return createErrorResponse("User not found", 401)
    }

    // Validate user object has required fields
    if (!user.id || !user.email) {
      return createErrorResponse("Invalid user data", 401)
    }

    // Fetch user profile with proper error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, is_dealer, free_listings_used, total_listings, created_at, updated_at")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError.message)
      return createErrorResponse("User profile not found", 404)
    }

    if (!profile) {
      return createErrorResponse("User profile not found", 404)
    }

    // Type-safe profile validation
    const validatedProfile: Profile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      is_dealer: Boolean(profile.is_dealer),
      free_listings_used: Number(profile.free_listings_used) || 0,
      total_listings: Number(profile.total_listings) || 0,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }

    // Create authenticated user object
    const authenticatedUser: AuthenticatedUser = {
      ...user,
      profile: validatedProfile
    }

    // Create auth context
    const context: AuthContext = {
      user: authenticatedUser,
      profile: validatedProfile
    }

    // Call the handler with auth context
    return await handler(request, context)

  } catch (error) {
    console.error("Authentication middleware error:", error)
    return createErrorResponse("Authentication failed", 500)
  }
}

/**
 * Optional authentication middleware
 * Provides user context if authenticated, but doesn't require authentication
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: NextRequest, context: { user?: AuthenticatedUser; profile?: Profile }) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization")
    
    // If no auth header, proceed without authentication
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return await handler(request, {})
    }

    const token = authHeader.substring(7).trim()
    if (!token) {
      return await handler(request, {})
    }

    const supabase = createServerComponentClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user || !user.id) {
      return await handler(request, {})
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, is_dealer, free_listings_used, total_listings, created_at, updated_at")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return await handler(request, {})
    }

    const validatedProfile: Profile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      is_dealer: Boolean(profile.is_dealer),
      free_listings_used: Number(profile.free_listings_used) || 0,
      total_listings: Number(profile.total_listings) || 0,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }

    const authenticatedUser: AuthenticatedUser = {
      ...user,
      profile: validatedProfile
    }

    return await handler(request, { user: authenticatedUser, profile: validatedProfile })

  } catch (error) {
    console.error("Optional authentication middleware error:", error)
    // Continue without authentication on error
    return await handler(request, {})
  }
}

/**
 * Check if user owns a listing with proper validation
 */
export async function checkListingOwnership(
  listingId: string,
  userId: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!isValidUUID(listingId) || !isValidUUID(userId)) {
      return false
    }

    const supabase = createServerComponentClient()

    const { data: listing, error } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .single()

    if (error || !listing) {
      return false
    }

    return listing.user_id === userId
  } catch (error) {
    console.error("Error checking listing ownership:", error)
    return false
  }
}

/**
 * Check if user has available listings in their package
 */
export async function checkPackageAvailability(
  userId: string,
  packageId?: string
): Promise<{ available: boolean; reason?: string }> {
  try {
    if (!isValidUUID(userId)) {
      return { available: false, reason: "Invalid user ID" }
    }

    const supabase = createServerComponentClient()
    
    // Get user profile to check free listings used
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("free_listings_used, is_dealer")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return { available: false, reason: "User profile not found" }
    }

    // If no package specified, check if user can use free listing
    if (!packageId) {
      // Private users get 1 free listing, dealers get unlimited
      if (profile.is_dealer) {
        return { available: true }
      }
      
      if (profile.free_listings_used >= 1) {
        return { 
          available: false, 
          reason: "Free listing quota exceeded. Please select a paid package." 
        }
      }
      
      return { available: true }
    }

    // Validate package ID format
    if (!isValidUUID(packageId)) {
      return { available: false, reason: "Invalid package ID format" }
    }

    // If package specified, verify it exists and is active
    const { data: packageData, error: packageError } = await supabase
      .from("packages")
      .select("id, is_active, price_chf")
      .eq("id", packageId)
      .eq("is_active", true)
      .single()

    if (packageError || !packageData) {
      return { available: false, reason: "Invalid or inactive package" }
    }

    return { available: true }

  } catch (error) {
    console.error("Error checking package availability:", error)
    return { available: false, reason: "Package validation failed" }
  }
}

/**
 * Validate request body against schema with enhanced error handling
 */
export function validateRequestBody<T>(
  body: any,
  schema: { parse: (data: any) => T }
): { success: true; data: T } | { success: false; error: string } {
  try {
    if (!body || typeof body !== 'object') {
      return { success: false, error: "Invalid request body format" }
    }

    const data = schema.parse(body)
    return { success: true, data }
  } catch (error: any) {
    const errorMessage = error?.issues
      ? error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      : error?.message || "Validation failed"
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: { parse: (data: any) => T }
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      // Sanitize parameter values
      if (typeof value === 'string' && value.length <= 1000) {
        params[key] = value.trim()
      }
    })
    
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error: any) {
    const errorMessage = error?.issues
      ? error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      : error?.message || "Validation failed"
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Create standardized error response with security considerations
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  // Sanitize error message to prevent information leakage
  const sanitizedMessage = typeof message === 'string' 
    ? message.replace(/[<>\"'&]/g, '') 
    : 'An error occurred'

  return NextResponse.json(
    {
      error: sanitizedMessage,
      timestamp: new Date().toISOString(),
      ...(details && process.env.NODE_ENV === 'development' && { details })
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    }
  )
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  meta?: any
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      ...(meta && { meta })
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  )
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Rate limiting helper (basic implementation)
 */
export function createRateLimitKey(request: NextRequest, identifier: string): string {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
  return `${identifier}:${ip}`
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, '')
}