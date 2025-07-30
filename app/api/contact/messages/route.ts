import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withAuth, createErrorResponse, createSuccessResponse, validateQueryParams } from "@/lib/auth-middleware"
import { contactMessagesQuerySchema, ContactMessagesQuery } from "@/lib/schemas/contact-api-schema"

/**
 * GET /api/contact/messages
 * Get contact messages for authenticated user (admin can see all)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      // Parse and validate query parameters
      const { searchParams } = new URL(request.url)
      const queryValidation = validateQueryParams(searchParams, contactMessagesQuerySchema)
      
      if (!queryValidation.success) {
        return createErrorResponse(
          "Invalid query parameters",
          400,
          { validation_errors: queryValidation.error }
        )
      }

      const query: ContactMessagesQuery = queryValidation.data

      // Create Supabase client
      const supabase = await createServerComponentClient(req)

      // Check if user is admin (can see all messages)
      // For now, we'll use a simple check - in production you might want a dedicated admin role
      const isAdmin = false // TODO: Implement proper admin check

      // Build base query
      let baseQuery = supabase
        .from('contact_messages')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            is_dealer,
            dealer_name
          ),
          listings:listing_id (
            id,
            title,
            brand,
            model,
            price,
            currency,
            images
          ),
          contact_responses (
            id,
            response_text,
            response_type,
            email_sent,
            email_delivery_status,
            created_at,
            profiles:responder_id (
              full_name,
              avatar_url
            )
          )
        `)

      // Apply user filter (non-admin users can only see their own messages)
      if (!isAdmin) {
        baseQuery = baseQuery.eq('user_id', user.id)
      }

      // Apply filters
      if (query.status) {
        baseQuery = baseQuery.eq('status', query.status)
      }

      if (query.category) {
        baseQuery = baseQuery.eq('category', query.category)
      }

      if (query.priority) {
        baseQuery = baseQuery.eq('priority', query.priority)
      }

      if (query.language) {
        baseQuery = baseQuery.eq('language', query.language)
      }

      if (query.assigned_to) {
        baseQuery = baseQuery.eq('assigned_to', query.assigned_to)
      }

      if (query.listing_id) {
        baseQuery = baseQuery.eq('listing_id', query.listing_id)
      }

      // Apply search
      if (query.search) {
        baseQuery = baseQuery.or(`
          subject.ilike.%${query.search}%,
          message.ilike.%${query.search}%,
          name.ilike.%${query.search}%,
          email.ilike.%${query.search}%
        `)
      }

      // Apply date range
      if (query.date_from) {
        baseQuery = baseQuery.gte('created_at', query.date_from)
      }

      if (query.date_to) {
        baseQuery = baseQuery.lte('created_at', query.date_to)
      }

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq(isAdmin ? 'id' : 'user_id', isAdmin ? undefined : user.id)

      if (countError) {
        console.error('Failed to count contact messages:', countError)
        return createErrorResponse(
          'Failed to load contact messages',
          500,
          { database_error: countError.message }
        )
      }

      // Apply sorting
      baseQuery = baseQuery.order(query.sort_by, { ascending: query.sort_order === 'asc' })

      // Apply pagination
      const offset = (query.page - 1) * query.limit
      baseQuery = baseQuery.range(offset, offset + query.limit - 1)

      // Execute query
      const { data: messages, error: messagesError } = await baseQuery

      if (messagesError) {
        console.error('Failed to fetch contact messages:', messagesError)
        return createErrorResponse(
          'Failed to load contact messages',
          500,
          { database_error: messagesError.message }
        )
      }

      // Calculate pagination info
      const totalPages = Math.ceil((totalCount || 0) / query.limit)
      const hasNext = query.page < totalPages
      const hasPrev = query.page > 1

      // Format response data
      const formattedMessages = messages?.map(message => ({
        id: message.id,
        user_id: message.user_id,
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        category: message.category,
        listing_id: message.listing_id,
        language: message.language,
        status: message.status,
        priority: message.priority,
        assigned_to: message.assigned_to,
        response_count: message.response_count,
        last_response_at: message.last_response_at,
        recaptcha_score: message.recaptcha_score,
        created_at: message.created_at,
        updated_at: message.updated_at,
        read_at: message.read_at,
        responded_at: message.responded_at,
        closed_at: message.closed_at,
        
        // Related data
        profiles: message.profiles ? {
          full_name: message.profiles.full_name,
          avatar_url: message.profiles.avatar_url,
          is_dealer: message.profiles.is_dealer,
          dealer_name: message.profiles.dealer_name
        } : null,
        
        listings: message.listings ? {
          id: message.listings.id,
          title: message.listings.title,
          brand: message.listings.brand,
          model: message.listings.model,
          price: message.listings.price,
          currency: message.listings.currency,
          image: Array.isArray(message.listings.images) && message.listings.images.length > 0 
            ? message.listings.images[0] 
            : null
        } : null,
        
        contact_responses: message.contact_responses?.map((response: any) => ({
          id: response.id,
          response_text: response.response_text,
          response_type: response.response_type,
          email_sent: response.email_sent,
          email_delivery_status: response.email_delivery_status,
          created_at: response.created_at,
          profiles: response.profiles ? {
            full_name: response.profiles.full_name,
            avatar_url: response.profiles.avatar_url
          } : null
        })) || []
      })) || []

      return createSuccessResponse({
        data: formattedMessages,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount || 0,
          totalPages,
          hasNext,
          hasPrev
        },
        filters: {
          status: query.status,
          category: query.category,
          priority: query.priority,
          language: query.language,
          assigned_to: query.assigned_to,
          listing_id: query.listing_id,
          search: query.search,
          date_from: query.date_from,
          date_to: query.date_to,
          sort_by: query.sort_by,
          sort_order: query.sort_order
        }
      })

    } catch (error) {
      console.error('Contact messages fetch error:', error)
      return createErrorResponse(
        'Failed to load contact messages',
        500,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    }
  })
}