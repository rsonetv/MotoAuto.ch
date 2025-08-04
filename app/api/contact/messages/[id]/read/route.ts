import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * PUT /api/contact/messages/[id]/read
 * Mark a contact message as read
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      const messageId = params.id

      // Validate message ID format
      if (!messageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        return createErrorResponse("Invalid message ID format", 400)
      }

      // Create Supabase client
      const supabase = await createServerComponentClient(request)

      // Check if message exists and user has permission to read it
      const { data: message, error: fetchError } = await supabase
        .from('contact_messages')
        .select('id, user_id, status, read_at')
        .eq('id', messageId)
        .single()

      if (fetchError || !message) {
        return createErrorResponse(
          "Contact message not found",
          404,
          { message_id: messageId }
        )
      }

      // Check if user owns the message (only message owner can mark as read)
      if (message.user_id !== user.id) {
        return createErrorResponse(
          "You don't have permission to modify this message",
          403,
          { message_id: messageId }
        )
      }

      // Check if message is already read
      if (message.read_at) {
        return createSuccessResponse({
          id: messageId,
          status: message.status,
          read_at: message.read_at,
          message: "Message was already marked as read"
        })
      }

      // Update message status to read
      const { data: updatedMessage, error: updateError } = await supabase
        .from('contact_messages')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select('id, status, read_at, updated_at')
        .single()

      if (updateError) {
        console.error('Failed to mark message as read:', updateError)
        return createErrorResponse(
          'Failed to mark message as read',
          500,
          { database_error: updateError.message }
        )
      }

      return createSuccessResponse({
        id: updatedMessage.id,
        status: updatedMessage.status,
        read_at: updatedMessage.read_at,
        updated_at: updatedMessage.updated_at,
        message: "Message marked as read successfully"
      })

    } catch (error) {
      console.error('Mark message as read error:', error)
      return createErrorResponse(
        'Failed to mark message as read',
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
 * DELETE /api/contact/messages/[id]/read
 * Mark a contact message as unread (remove read status)
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
      const supabase = await createServerComponentClient(request)

      // Check if message exists and user has permission to modify it
      const { data: message, error: fetchError } = await supabase
        .from('contact_messages')
        .select('id, user_id, status, read_at')
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
          "You don't have permission to modify this message",
          403,
          { message_id: messageId }
        )
      }

      // Check if message is already unread
      if (!message.read_at) {
        return createSuccessResponse({
          id: messageId,
          status: message.status,
          read_at: null,
          message: "Message was already unread"
        })
      }

      // Update message to remove read status
      const newStatus = message.status === 'read' ? 'new' : message.status
      
      const { data: updatedMessage, error: updateError } = await supabase
        .from('contact_messages')
        .update({
          status: newStatus,
          read_at: null
        })
        .eq('id', messageId)
        .select('id, status, read_at, updated_at')
        .single()

      if (updateError) {
        console.error('Failed to mark message as unread:', updateError)
        return createErrorResponse(
          'Failed to mark message as unread',
          500,
          { database_error: updateError.message }
        )
      }

      return createSuccessResponse({
        id: updatedMessage.id,
        status: updatedMessage.status,
        read_at: updatedMessage.read_at,
        updated_at: updatedMessage.updated_at,
        message: "Message marked as unread successfully"
      })

    } catch (error) {
      console.error('Mark message as unread error:', error)
      return createErrorResponse(
        'Failed to mark message as unread',
        500,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    }
  })
}