import { createServerComponentClient } from '@/lib/supabase-api'

// Payment event types for logging
export enum PaymentEventType {
  PAYMENT_INTENT_CREATED = 'payment_intent_created',
  PAYMENT_INTENT_CONFIRMED = 'payment_intent_confirmed',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELLED = 'payment_cancelled',
  REFUND_CREATED = 'refund_created',
  REFUND_SUCCEEDED = 'refund_succeeded',
  REFUND_FAILED = 'refund_failed',
  INVOICE_GENERATED = 'invoice_generated',
  COMMISSION_CALCULATED = 'commission_calculated',
  WEBHOOK_RECEIVED = 'webhook_received',
  WEBHOOK_PROCESSED = 'webhook_processed',
  WEBHOOK_FAILED = 'webhook_failed',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  STRIPE_ERROR = 'stripe_error',
  DATABASE_ERROR = 'database_error',
  SYSTEM_ERROR = 'system_error'
}

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Payment log entry interface
export interface PaymentLogEntry {
  id?: string
  event_type: PaymentEventType
  level: LogLevel
  message: string
  payment_id?: string
  user_id?: string
  stripe_payment_intent_id?: string
  amount?: number
  currency?: string
  metadata?: Record<string, any>
  error_details?: {
    error_code?: string
    error_message?: string
    stack_trace?: string
    request_id?: string
  }
  request_info?: {
    ip_address?: string
    user_agent?: string
    endpoint?: string
    method?: string
    headers?: Record<string, string>
  }
  performance_metrics?: {
    duration_ms?: number
    memory_usage?: number
    cpu_usage?: number
  }
  created_at?: string
}

// Payment logger class
export class PaymentLogger {
  private static instance: PaymentLogger

  private constructor() {}

  public static getInstance(): PaymentLogger {
    if (!PaymentLogger.instance) {
      PaymentLogger.instance = new PaymentLogger()
    }
    return PaymentLogger.instance
  }

  // Create Supabase client when needed
  private async getSupabaseClient() {
    return await createServerComponentClient()
  }

  // Log payment event
  async log(entry: PaymentLogEntry): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!entry.created_at) {
        entry.created_at = new Date().toISOString()
      }

      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        this.consoleLog(entry)
      }

      // Database logging (you could create a payment_logs table)
      await this.databaseLog(entry)

      // External logging service (e.g., Sentry, LogRocket)
      await this.externalLog(entry)

    } catch (error) {
      // Fallback to console if logging fails
      console.error('Payment logging failed:', error)
      console.error('Original log entry:', entry)
    }
  }

  // Console logging with formatting
  private consoleLog(entry: PaymentLogEntry): void {
    const timestamp = new Date(entry.created_at!).toISOString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.event_type}]`
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.metadata)
        break
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.metadata)
        break
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.metadata)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.error_details, entry.metadata)
        break
    }
  }

  // Database logging (implement based on your needs)
  private async databaseLog(entry: PaymentLogEntry): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient()
      
      // You could create a payment_logs table for this
      // For now, we'll store simplified logs in a separate table or skip complex metadata updates
      
      // Simple approach: Just log critical information without complex JSON operations
      if (entry.payment_id) {
        // We'll create a simple log record instead of complex metadata updates
        console.log('Payment log entry recorded:', {
          payment_id: entry.payment_id,
          event_type: entry.event_type,
          level: entry.level,
          message: entry.message,
          timestamp: entry.created_at
        })
        
        // If you want to implement proper logging, create a payment_logs table:
        // const { error } = await supabase
        //   .from('payment_logs')
        //   .insert([{
        //     payment_id: entry.payment_id,
        //     event_type: entry.event_type,
        //     level: entry.level,
        //     message: entry.message,
        //     metadata: entry.metadata,
        //     created_at: entry.created_at
        //   }])
      }
    } catch (error) {
      console.error('Database logging failed:', error)
    }
  }

  // External logging service integration
  private async externalLog(entry: PaymentLogEntry): Promise<void> {
    try {
      // Integration with external services like Sentry, LogRocket, etc.
      // This is a placeholder for external logging integration
      
      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL) {
        // Send to error tracking service
        // await Sentry.captureException(new Error(entry.message), {
        //   tags: {
        //     event_type: entry.event_type,
        //     payment_id: entry.payment_id
        //   },
        //   extra: entry.metadata
        // })
      }
    } catch (error) {
      console.error('External logging failed:', error)
    }
  }

  // Convenience methods for different log levels
  async debug(eventType: PaymentEventType, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: eventType,
      level: LogLevel.DEBUG,
      message,
      metadata
    })
  }

  async info(eventType: PaymentEventType, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: eventType,
      level: LogLevel.INFO,
      message,
      metadata
    })
  }

  async warn(eventType: PaymentEventType, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: eventType,
      level: LogLevel.WARN,
      message,
      metadata
    })
  }

  async error(eventType: PaymentEventType, message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: eventType,
      level: LogLevel.ERROR,
      message,
      metadata,
      error_details: error ? {
        error_message: error.message,
        stack_trace: error.stack,
        error_code: (error as any).code || 'UNKNOWN'
      } : undefined
    })
  }

  async critical(eventType: PaymentEventType, message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: eventType,
      level: LogLevel.CRITICAL,
      message,
      metadata,
      error_details: error ? {
        error_message: error.message,
        stack_trace: error.stack,
        error_code: (error as any).code || 'UNKNOWN'
      } : undefined
    })
  }

  // Log payment lifecycle events
  async logPaymentCreated(paymentId: string, userId: string, amount: number, currency: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.PAYMENT_INTENT_CREATED,
      level: LogLevel.INFO,
      message: `Payment intent created for ${amount} ${currency}`,
      payment_id: paymentId,
      user_id: userId,
      amount,
      currency,
      metadata
    })
  }

  async logPaymentSucceeded(paymentId: string, stripePaymentIntentId: string, amount: number, currency: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.PAYMENT_SUCCEEDED,
      level: LogLevel.INFO,
      message: `Payment succeeded for ${amount} ${currency}`,
      payment_id: paymentId,
      stripe_payment_intent_id: stripePaymentIntentId,
      amount,
      currency,
      metadata
    })
  }

  async logPaymentFailed(paymentId: string, stripePaymentIntentId: string, error: Error, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.PAYMENT_FAILED,
      level: LogLevel.ERROR,
      message: `Payment failed: ${error.message}`,
      payment_id: paymentId,
      stripe_payment_intent_id: stripePaymentIntentId,
      metadata,
      error_details: {
        error_message: error.message,
        error_code: (error as any).code || 'PAYMENT_FAILED',
        stack_trace: error.stack
      }
    })
  }

  async logRefundCreated(paymentId: string, refundAmount: number, currency: string, reason: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.REFUND_CREATED,
      level: LogLevel.INFO,
      message: `Refund created for ${refundAmount} ${currency} - Reason: ${reason}`,
      payment_id: paymentId,
      amount: refundAmount,
      currency,
      metadata: { ...metadata, refund_reason: reason }
    })
  }

  async logWebhookReceived(eventType: string, eventId: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.WEBHOOK_RECEIVED,
      level: LogLevel.INFO,
      message: `Webhook received: ${eventType}`,
      metadata: { ...metadata, stripe_event_id: eventId, stripe_event_type: eventType }
    })
  }

  async logValidationError(endpoint: string, error: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.VALIDATION_ERROR,
      level: LogLevel.WARN,
      message: `Validation error on ${endpoint}: ${error}`,
      metadata: { ...metadata, endpoint }
    })
  }

  async logStripeError(operation: string, error: Error, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      event_type: PaymentEventType.STRIPE_ERROR,
      level: LogLevel.ERROR,
      message: `Stripe error during ${operation}: ${error.message}`,
      metadata: { ...metadata, operation },
      error_details: {
        error_message: error.message,
        error_code: (error as any).code || 'STRIPE_ERROR',
        stack_trace: error.stack
      }
    })
  }
}

// Error handling utilities
export class PaymentErrorHandler {
  private logger = PaymentLogger.getInstance()

  // Handle Stripe errors
  async handleStripeError(error: any, operation: string, metadata?: Record<string, any>): Promise<{
    userMessage: string
    statusCode: number
    shouldRetry: boolean
  }> {
    await this.logger.logStripeError(operation, error, metadata)

    // Map Stripe error types to user-friendly messages
    switch (error.type) {
      case 'card_error':
        return {
          userMessage: 'Your card was declined. Please try a different payment method.',
          statusCode: 400,
          shouldRetry: true
        }
      
      case 'rate_limit_error':
        return {
          userMessage: 'Too many requests. Please try again in a moment.',
          statusCode: 429,
          shouldRetry: true
        }
      
      case 'invalid_request_error':
        return {
          userMessage: 'Invalid payment request. Please check your information.',
          statusCode: 400,
          shouldRetry: false
        }
      
      case 'api_error':
        return {
          userMessage: 'Payment service temporarily unavailable. Please try again later.',
          statusCode: 502,
          shouldRetry: true
        }
      
      case 'authentication_error':
        return {
          userMessage: 'Payment authentication failed. Please contact support.',
          statusCode: 500,
          shouldRetry: false
        }
      
      default:
        return {
          userMessage: 'Payment processing failed. Please try again or contact support.',
          statusCode: 500,
          shouldRetry: true
        }
    }
  }

  // Handle database errors
  async handleDatabaseError(error: any, operation: string, metadata?: Record<string, any>): Promise<{
    userMessage: string
    statusCode: number
    shouldRetry: boolean
  }> {
    await this.logger.error(PaymentEventType.DATABASE_ERROR, `Database error during ${operation}: ${error.message}`, error, metadata)

    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return {
        userMessage: 'Service temporarily unavailable. Please try again in a moment.',
        statusCode: 503,
        shouldRetry: true
      }
    }

    // Check if it's a constraint violation
    if (error.code === '23505') { // Unique constraint violation
      return {
        userMessage: 'This operation conflicts with existing data. Please try again.',
        statusCode: 409,
        shouldRetry: false
      }
    }

    return {
      userMessage: 'A system error occurred. Please try again or contact support.',
      statusCode: 500,
      shouldRetry: true
    }
  }

  // Handle validation errors
  async handleValidationError(errors: string[], endpoint: string): Promise<{
    userMessage: string
    statusCode: number
    details: string[]
  }> {
    const errorMessage = `Validation failed: ${errors.join(', ')}`
    await this.logger.logValidationError(endpoint, errorMessage, { errors })

    return {
      userMessage: 'Please check your input and try again.',
      statusCode: 400,
      details: errors
    }
  }
}

// Performance monitoring
export class PaymentPerformanceMonitor {
  private logger = PaymentLogger.getInstance()
  private startTimes = new Map<string, number>()

  startOperation(operationId: string): void {
    this.startTimes.set(operationId, Date.now())
  }

  async endOperation(operationId: string, eventType: PaymentEventType, metadata?: Record<string, any>): Promise<void> {
    const startTime = this.startTimes.get(operationId)
    if (!startTime) return

    const duration = Date.now() - startTime
    this.startTimes.delete(operationId)

    await this.logger.log({
      event_type: eventType,
      level: LogLevel.INFO,
      message: `Operation ${operationId} completed in ${duration}ms`,
      metadata,
      performance_metrics: {
        duration_ms: duration,
        memory_usage: process.memoryUsage().heapUsed,
        cpu_usage: process.cpuUsage().user
      }
    })

    // Alert on slow operations
    if (duration > 5000) { // 5 seconds
      await this.logger.warn(
        PaymentEventType.SYSTEM_ERROR,
        `Slow operation detected: ${operationId} took ${duration}ms`,
        { operation_id: operationId, duration_ms: duration }
      )
    }
  }
}

// Export singleton instances
export const paymentLogger = PaymentLogger.getInstance()
export const paymentErrorHandler = new PaymentErrorHandler()
export const paymentPerformanceMonitor = new PaymentPerformanceMonitor()