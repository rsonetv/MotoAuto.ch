import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/contact/messages/[id]
 * Get a specific contact message
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      const messageId = params.id

      // Validate message ID format
      if (!messageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        return createErrorResponse("Invalid message ID format", 400)
      }

      // Create Supabase client
      const supabase = await createServerComponentClient(req)

      // Get message with related data
      const { data: message, error: fetchError } = await supabase
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
        .eq('id', messageId)
        .single()

      if (fetchError || !message) {
        return createErrorResponse(
          "Contact message not found",
          404,
          { message_id: messageId }
        )
      }

      // Check if user has permission to view this message
      if (message.user_id !== user.id) {
        return createErrorResponse(
          "You don't have permission to view this message",
          403,
          { message_id: messageId }
        )
      }

      // Format response data
      const formattedMessage = {
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
        metadata: message.metadata,
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
      }

      return createSuccessResponse(formattedMessage)

    } catch (error) {
      console.error('Get contact message error:', error)
      return createErrorResponse(
        'Failed to load contact message',
        500,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    }
  })
}

/**
 * DELETE /api/contact/messages/[id]
 * Delete a contact message (soft delete by marking as closed)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      const messageId = params.id

      // Validate message ID format
      if (!messageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        return createErrorResponse("Invalid message ID format", 400)
      }

      // Create Supabase client
      const supabase = await createServerComponentClient(req)

      // Check if message exists and user has permission to delete it
      const { data: message, error: fetchError } = await supabase
        .from('contact_messages')
        .select('id, user_id, status, closed_at')
        .eq('id', messageId)
        .single()

      if (fetchError || !message) {
        return createErrorResponse(
          "Contact message not found",
          404,
          { message_id: messageId }
        )
      }

      // Check if user owns the message
      if (message.user_id !== user.id) {
        return createErrorResponse(
          "You don't have permission to delete this message",
          403,
          { message_id: messageId }
        )
      }

      // Check if message is already closed/deleted
      if (message.status === 'closed' && message.closed_at) {
        return createSuccessResponse({
          id: messageId,
          status: 'closed',
          closed_at: message.closed_at,
          message: "Message was already deleted"
        })
      }

      // Soft delete by marking as closed
      const { data: updatedMessage, error: updateError } = await supabase
        .from('contact_messages')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select('id, status, closed_at, updated_at')
        .single()

      if (updateError) {
        console.error('Failed to delete contact message:', updateError)
        return createErrorResponse(
          'Failed to delete contact message',
          500,
          { database_error: updateError.message }
        )
      }

      return createSuccessResponse({
        id: updatedMessage.id,
        status: updatedMessage.status,
        closed_at: updatedMessage.closed_at,
        updated_at: updatedMessage.updated_at,
        message: "Contact message deleted successfully"
      })

    } catch (error) {
      console.error('Delete contact message error:', error)
      return createErrorResponse(
        'Failed to delete contact message',
        500,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    }
  })
}

/**
 * PUT /api/contact/messages/[id]
 * Update a contact message (limited fields for user)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      const messageId = params.id

      // Validate message ID format
      if (!messageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        return createErrorResponse("Invalid message ID format", 400)
      }

      // Parse request body
      const body = await request.json()

      // Only allow updating status for now (users can only mark as read/unread)
      const allowedUpdates = ['status']
      const updates: any = {}

      for (const field of allowedUpdates) {
        if (body[field] !== undefined) {
          updates[field] = body[field]
        }
      }

      if (Object.keys(updates).length === 0) {
        return createErrorResponse(
          "No valid fields to update",
          400,
          { allowed_fields: allowedUpdates }
        )
      }

      // Create Supabase client
      const supabase = await createServerComponentClient(req)

      // Check if message exists and user has permission to update it
      const { data: message, error: fetchError } = await supabase
        .from('contact_messages')
        .select('id, user_id, status')
        .eq('id', messageId)
        .single()

      if (fetchError || !message) {
        return createErrorResponse(
          "Contact message not found",
          404,
          { message_id: messageId }
        )
      }

      // Check if user owns the message
      if (message.user_id !== user.id) {
        return createErrorResponse(
          "You don't have permission to update this message",
          403,
          { message_id: messageId }
        )
      }

      // Validate status update (users can only change between 'new' and 'read')
      if (updates.status && !['new', 'read'].includes(updates.status)) {
        return createErrorResponse(
          "Invalid status. Users can only set status to 'new' or 'read'",
          400,
          { valid_statuses: ['new', 'read'] }
        )
      }

      // Add timestamp for status changes
      if (updates.status === 'read' && message.status !== 'read') {
        updates.read_at = new Date().toISOString()
      } else if (updates.status === 'new' && message.status === 'read') {
        updates.read_at = null
      }

      // Update message
      const { data: updatedMessage, error: updateError } = await supabase
        .from('contact_messages')
        .update(updates)
        .eq('id', messageId)
        .select('id, status, read_at, updated_at')
        .single()

      if (updateError) {
        console.error('Failed to update contact message:', updateError)
        return createErrorResponse(
          'Failed to update contact message',
          500,
          { database_error: updateError.message }
        )
      }

      return createSuccessResponse({
        id: updatedMessage.id,
        status: updatedMessage.status,
        read_at: updatedMessage.read_at,
        updated_at: updatedMessage.updated_at,
        message: "Contact message updated successfully"
      })

    } catch (error) {
      console.error('Update contact message error:', error)
      return createErrorResponse(
        'Failed to update contact message',
        500,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    }
  })
}