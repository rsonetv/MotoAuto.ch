import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  paymentHistoryQuerySchema,
  type PaymentHistoryQuery 
} from "@/lib/schemas/payments-api-schema"
import { 
  withAuth, 
  validateQueryParams,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type PaymentWithRelations = Database['public']['Tables']['payments']['Row'] & {
  listings?: {
    id: string
    title: string
    brand: string
    model: string
    year: number | null
    price: number
    currency: string
    images: string[]
  }
  packages?: {
    id: string
    name_en: string
    name_de: string
    name_fr: string
    name_pl: string
    price_chf: number
    duration_days: number
  }
}

/**
 * GET /api/payments/history
 * Get user's payment history with filtering and pagination
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Validate query parameters
      const validation = validateQueryParams(searchParams, paymentHistoryQuerySchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid query parameters: ${validation.error}`, 400)
      }

      const query: PaymentHistoryQuery = validation.data
      const supabase = await createServerComponentClient(req)

      // Build the base query with joins
      let dbQuery = supabase
        .from('payments')
        .select(`
          id,
          listing_id,
          package_id,
          amount,
          currency,
          commission_rate,
          commission_amount,
          max_commission,
          payment_method,
          payment_provider,
          payment_provider_id,
          payment_type,
          status,
          description,
          metadata,
          failure_reason,
          processed_at,
          completed_at,
          failed_at,
          refunded_at,
          created_at,
          updated_at,
          listings:listing_id (
            id,
            title,
            brand,
            model,
            year,
            price,
            currency,
            images
          ),
          packages:package_id (
            id,
            name_en,
            name_de,
            name_fr,
            name_pl,
            price_chf,
            duration_days
          )
        `)
        .eq('user_id', user.id)

      // Apply status filter
      if (query.status) {
        dbQuery = dbQuery.eq('status', query.status)
      }

      // Apply payment type filter
      if (query.payment_type) {
        dbQuery = dbQuery.eq('payment_type', query.payment_type)
      }

      // Apply currency filter
      if (query.currency) {
        dbQuery = dbQuery.eq('currency', query.currency)
      }

      // Apply date range filters
      if (query.date_from) {
        dbQuery = dbQuery.gte('created_at', query.date_from)
      }
      if (query.date_to) {
        dbQuery = dbQuery.lte('created_at', query.date_to)
      }

      // Apply amount range filters
      if (query.amount_min !== undefined) {
        dbQuery = dbQuery.gte('amount', query.amount_min)
      }
      if (query.amount_max !== undefined) {
        dbQuery = dbQuery.lte('amount', query.amount_max)
      }

      // Apply sorting
      const sortColumn = query.sort_by
      const sortOrder = query.sort_order === 'asc' ? { ascending: true } : { ascending: false }
      
      if (sortColumn === 'completed_at') {
        // Special handling for completed_at - nulls last
        dbQuery = dbQuery.order('completed_at', { ...sortOrder, nullsFirst: false })
      } else {
        dbQuery = dbQuery.order(sortColumn, sortOrder)
      }

      // Get total count for pagination (before applying limit/offset)
      const { count: totalCount, error: countError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .match(
          Object.fromEntries(
            Object.entries({
              ...(query.status && { status: query.status }),
              ...(query.payment_type && { payment_type: query.payment_type }),
              ...(query.currency && { currency: query.currency }),
            }).filter(([_, value]) => value !== undefined)
          )
        )

      if (countError) {
        console.error('Error getting payments count:', countError)
        return createErrorResponse('Failed to get payments count', 500)
      }

      // Apply pagination
      const offset = (query.page - 1) * query.limit
      dbQuery = dbQuery.range(offset, offset + query.limit - 1)

      // Execute the query
      const { data: payments, error } = await dbQuery

      if (error) {
        console.error('Error fetching payment history:', error)
        return createErrorResponse('Failed to fetch payment history', 500)
      }

      // Calculate pagination metadata
      const total = totalCount || 0
      const totalPages = Math.ceil(total / query.limit)
      const hasNext = query.page < totalPages
      const hasPrev = query.page > 1

      const paginationMeta = {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }

      // Calculate summary statistics
      const summaryStats = await calculatePaymentSummary(supabase, user.id, query)

      // Return paginated response
      return createSuccessResponse(
        {
          data: payments as PaymentWithRelations[],
          pagination: paginationMeta,
          summary: summaryStats,
          filters: {
            status: query.status,
            payment_type: query.payment_type,
            currency: query.currency,
            date_range: query.date_from || query.date_to ? {
              from: query.date_from,
              to: query.date_to
            } : undefined,
            amount_range: query.amount_min || query.amount_max ? {
              min: query.amount_min,
              max: query.amount_max
            } : undefined,
            sort_by: query.sort_by,
            sort_order: query.sort_order
          }
        },
        200
      )

    } catch (error) {
      console.error('Unexpected error in GET /api/payments/history:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * Calculate payment summary statistics
 */
async function calculatePaymentSummary(
  supabase: any,
  userId: string,
  query: PaymentHistoryQuery
) {
  try {
    // Build summary query with same filters
    let summaryQuery = supabase
      .from('payments')
      .select('amount, currency, status, payment_type, created_at')
      .eq('user_id', userId)

    // Apply same filters as main query
    if (query.status) {
      summaryQuery = summaryQuery.eq('status', query.status)
    }
    if (query.payment_type) {
      summaryQuery = summaryQuery.eq('payment_type', query.payment_type)
    }
    if (query.currency) {
      summaryQuery = summaryQuery.eq('currency', query.currency)
    }
    if (query.date_from) {
      summaryQuery = summaryQuery.gte('created_at', query.date_from)
    }
    if (query.date_to) {
      summaryQuery = summaryQuery.lte('created_at', query.date_to)
    }
    if (query.amount_min !== undefined) {
      summaryQuery = summaryQuery.gte('amount', query.amount_min)
    }
    if (query.amount_max !== undefined) {
      summaryQuery = summaryQuery.lte('amount', query.amount_max)
    }

    const { data: summaryData, error: summaryError } = await summaryQuery

    if (summaryError || !summaryData) {
      console.error('Error calculating payment summary:', summaryError)
      return null
    }

    // Calculate statistics
    const totalAmount = summaryData.reduce((sum, payment) => sum + payment.amount, 0)
    const completedPayments = summaryData.filter(p => p.status === 'completed')
    const completedAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Group by currency
    const byCurrency = summaryData.reduce((acc, payment) => {
      if (!acc[payment.currency]) {
        acc[payment.currency] = { total: 0, completed: 0, count: 0 }
      }
      acc[payment.currency].total += payment.amount
      acc[payment.currency].count += 1
      if (payment.status === 'completed') {
        acc[payment.currency].completed += payment.amount
      }
      return acc
    }, {} as Record<string, { total: number; completed: number; count: number }>)

    // Group by payment type
    const byType = summaryData.reduce((acc, payment) => {
      if (!acc[payment.payment_type]) {
        acc[payment.payment_type] = { total: 0, count: 0 }
      }
      acc[payment.payment_type].total += payment.amount
      acc[payment.payment_type].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    // Group by status
    const byStatus = summaryData.reduce((acc, payment) => {
      if (!acc[payment.status]) {
        acc[payment.status] = { count: 0, amount: 0 }
      }
      acc[payment.status].count += 1
      acc[payment.status].amount += payment.amount
      return acc
    }, {} as Record<string, { count: number; amount: number }>)

    return {
      total_payments: summaryData.length,
      total_amount: totalAmount,
      completed_payments: completedPayments.length,
      completed_amount: completedAmount,
      success_rate: summaryData.length > 0 ? (completedPayments.length / summaryData.length) * 100 : 0,
      by_currency: byCurrency,
      by_type: byType,
      by_status: byStatus,
      period: {
        from: query.date_from,
        to: query.date_to
      }
    }
  } catch (error) {
    console.error('Error calculating payment summary:', error)
    return null
  }
}