import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import Bull from 'bull'
import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { 
  EmailQueue, 
  EmailPreferences, 
  EmailTemplate, 
  EmailTemplateVariables,
  EmailServiceConfig,
  EmailDeliveryStatus,
  EmailNotificationType,
  EmailValidationResult
} from '@/lib/database/email.types'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { renderEmailTemplate } from './template-engine'
import { validateSwissCompliance } from '@/lib/swiss-compliance'

// Email service configuration
const EMAIL_CONFIG: EmailServiceConfig = {
  provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  apiKey: process.env.EMAIL_API_KEY,
  domain: process.env.EMAIL_DOMAIN,
  region: process.env.EMAIL_REGION || 'eu-west-1',
  fromEmail: process.env.SMTP_FROM || 'noreply@motoauto.ch',
  fromName: process.env.SMTP_FROM_NAME || 'MotoAuto.ch',
  replyTo: process.env.SMTP_REPLY_TO || 'support@motoauto.ch',
  maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '60000'), // 1 minute
  rateLimit: {
    max: parseInt(process.env.EMAIL_RATE_LIMIT_MAX || '100'),
    windowMs: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW || '3600000') // 1 hour
  }
}

// Redis connection for queue
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Email queue
const emailQueue = new Bull('email queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: EMAIL_CONFIG.maxRetries,
    backoff: {
      type: 'exponential',
      delay: EMAIL_CONFIG.retryDelay
    }
  }
})

// Nodemailer transporter
let transporter: nodemailer.Transporter | null = null

/**
 * Initialize email service
 */
export async function initializeEmailService(): Promise<void> {
  try {
    // Create nodemailer transporter
    if (EMAIL_CONFIG.provider === 'smtp') {
      transporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: EMAIL_CONFIG.auth,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: EMAIL_CONFIG.rateLimit.max
      })

      // Verify connection
      await transporter.verify()
      console.log('✅ Email service initialized successfully')
    }

    // Process email queue
    emailQueue.process('send-email', 5, processEmailJob)
    
    // Queue event handlers
    emailQueue.on('completed', (job, result) => {
      console.log(`✅ Email job ${job.id} completed:`, result)
    })

    emailQueue.on('failed', (job, err) => {
      console.error(`❌ Email job ${job.id} failed:`, err.message)
    })

    emailQueue.on('stalled', (job) => {
      console.warn(`⚠️ Email job ${job.id} stalled`)
    })

  } catch (error) {
    console.error('❌ Failed to initialize email service:', error)
    throw error
  }
}

/**
 * Process email queue job
 */
async function processEmailJob(job: Bull.Job): Promise<EmailDeliveryStatus> {
  const { emailId } = job.data
  
  try {
    // Get email from database
    const { data: email, error } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .eq('id', emailId)
      .single()

    if (error || !email) {
      throw new Error(`Email not found: ${emailId}`)
    }

    // Update status to processing
    await supabaseAdmin
      .from('email_queue')
      .update({ 
        status: 'processing',
        last_attempt_at: new Date().toISOString(),
        attempts: email.attempts + 1
      })
      .eq('id', emailId)

    // Send email
    const result = await sendEmailDirect(email)

    // Update email status based on result
    const updateData: any = {
      status: result.status === 'sent' ? 'sent' : 'failed',
      provider_message_id: result.messageId,
      provider_response: result.providerResponse,
      updated_at: new Date().toISOString()
    }

    if (result.status === 'sent') {
      updateData.sent_at = new Date().toISOString()
    } else {
      updateData.error_message = result.error
      updateData.error_code = 'SEND_FAILED'
    }

    await supabaseAdmin
      .from('email_queue')
      .update(updateData)
      .eq('id', emailId)

    // Log delivery event
    await logEmailEvent(emailId, 'sent', {
      messageId: result.messageId,
      status: result.status,
      error: result.error
    })

    return result

  } catch (error) {
    console.error(`Failed to process email job ${emailId}:`, error)
    
    // Update email status to failed
    await supabaseAdmin
      .from('email_queue')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_code: 'PROCESSING_FAILED',
        updated_at: new Date().toISOString()
      })
      .eq('id', emailId)

    throw error
  }
}

/**
 * Send email directly using configured provider
 */
async function sendEmailDirect(email: EmailQueue): Promise<EmailDeliveryStatus> {
  if (!transporter) {
    throw new Error('Email transporter not initialized')
  }

  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `${email.from_name || EMAIL_CONFIG.fromName} <${email.from_email}>`,
      to: email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email,
      replyTo: email.reply_to || EMAIL_CONFIG.replyTo,
      subject: email.subject,
      html: email.html_content,
      text: email.text_content,
      headers: {
        'X-Email-Type': email.email_type,
        'X-Email-Category': email.category,
        'X-Email-Language': email.language,
        'X-Email-ID': email.id
      }
    }

    const result = await transporter.sendMail(mailOptions)

    return {
      messageId: result.messageId,
      status: 'sent',
      timestamp: new Date().toISOString(),
      providerResponse: {
        accepted: result.accepted,
        rejected: result.rejected,
        pending: result.pending,
        response: result.response
      }
    }

  } catch (error) {
    console.error('Failed to send email:', error)
    
    return {
      messageId: '',
      status: 'failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      providerResponse: { error: error }
    }
  }
}

/**
 * Queue email for sending
 */
export async function queueEmail(
  emailData: Partial<EmailQueue>,
  priority: number = 5,
  delay: number = 0
): Promise<string> {
  try {
    // Generate email ID
    const emailId = uuidv4()

    // Prepare email record
    const emailRecord: Partial<EmailQueue> = {
      id: emailId,
      status: 'pending',
      scheduled_at: new Date(Date.now() + delay).toISOString(),
      priority,
      attempts: 0,
      max_attempts: EMAIL_CONFIG.maxRetries,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...emailData
    }

    // Insert email into database
    const { error } = await supabaseAdmin
      .from('email_queue')
      .insert(emailRecord)

    if (error) {
      throw new Error(`Failed to queue email: ${error.message}`)
    }

    // Add job to queue
    await emailQueue.add(
      'send-email',
      { emailId },
      {
        priority: 10 - priority, // Bull uses higher numbers for higher priority
        delay,
        jobId: emailId
      }
    )

    console.log(`📧 Email queued: ${emailId}`)
    return emailId

  } catch (error) {
    console.error('Failed to queue email:', error)
    throw error
  }
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
  userId: string,
  emailType: EmailNotificationType,
  templateVariables: EmailTemplateVariables,
  options: {
    priority?: number
    delay?: number
    language?: string
  } = {}
): Promise<string> {
  try {
    // Validate if user can receive this email type
    const validation = await validateEmailPermissions(userId, emailType)
    if (!validation.canSend) {
      throw new Error(`Cannot send email: ${validation.reason}`)
    }

    // Get user preferences
    const preferences = validation.preferences!
    const language = options.language || preferences.preferred_language

    // Get email template
    const template = await getEmailTemplate(emailType, language)
    if (!template) {
      throw new Error(`Email template not found: ${emailType} (${language})`)
    }

    // Render email content
    const { subject, html, text } = await renderEmailTemplate(
      template,
      templateVariables,
      language as 'de' | 'fr' | 'pl' | 'en'
    )

    // Get user profile for email address
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error(`User profile not found: ${userId}`)
    }

    // Queue email
    return await queueEmail({
      to_email: profile.email,
      to_name: profile.full_name,
      from_email: EMAIL_CONFIG.fromEmail,
      from_name: EMAIL_CONFIG.fromName,
      reply_to: EMAIL_CONFIG.replyTo,
      subject,
      html_content: html,
      text_content: text,
      template_name: template.name,
      template_data: templateVariables,
      email_type: emailType,
      category: template.category,
      language,
      user_id: userId
    }, options.priority, options.delay)

  } catch (error) {
    console.error(`Failed to send notification email (${emailType}):`, error)
    throw error
  }
}

/**
 * Validate email permissions
 */
export async function validateEmailPermissions(
  userId: string,
  emailType: EmailNotificationType
): Promise<EmailValidationResult> {
  try {
    // Get user email preferences
    const { data: preferences, error } = await supabaseAdmin
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error
    }

    // If no preferences found, create default ones
    if (!preferences) {
      const { data: newPreferences, error: insertError } = await supabaseAdmin
        .from('email_preferences')
        .insert({ user_id: userId })
        .select()
        .single()

      if (insertError) {
        return {
          isValid: false,
          canSend: false,
          reason: 'Failed to create email preferences'
        }
      }

      return {
        isValid: true,
        canSend: true,
        preferences: newPreferences
      }
    }

    // Check if user is unsubscribed
    if (preferences.is_unsubscribed) {
      return {
        isValid: true,
        canSend: false,
        reason: 'User has unsubscribed from all emails',
        preferences
      }
    }

    // Check specific email type permissions using database function
    const { data: canSend } = await supabaseAdmin
      .rpc('can_send_email', {
        p_user_id: userId,
        p_email_type: emailType
      })

    return {
      isValid: true,
      canSend: canSend || false,
      reason: canSend ? undefined : 'Email type disabled in user preferences',
      preferences
    }

  } catch (error) {
    console.error('Failed to validate email permissions:', error)
    return {
      isValid: false,
      canSend: false,
      reason: 'Failed to validate permissions'
    }
  }
}

/**
 * Get email template
 */
async function getEmailTemplate(
  emailType: EmailNotificationType,
  language: string
): Promise<EmailTemplate | null> {
  try {
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('name', emailType)
      .eq('language', language)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return template || null

  } catch (error) {
    console.error(`Failed to get email template (${emailType}, ${language}):`, error)
    return null
  }
}

/**
 * Log email delivery event
 */
async function logEmailEvent(
  emailQueueId: string,
  eventType: string,
  eventData: any = {}
): Promise<void> {
  try {
    await supabaseAdmin
      .from('email_delivery_logs')
      .insert({
        email_queue_id: emailQueueId,
        event_type: eventType,
        event_timestamp: new Date().toISOString(),
        provider_data: eventData
      })

  } catch (error) {
    console.error('Failed to log email event:', error)
  }
}

/**
 * Handle email webhook events (for providers like SendGrid, Mailgun)
 */
export async function handleEmailWebhook(
  provider: string,
  eventData: any
): Promise<void> {
  try {
    // Parse webhook data based on provider
    let emailId: string
    let eventType: string
    let timestamp: string
    let additionalData: any = {}

    switch (provider) {
      case 'sendgrid':
        emailId = eventData.sg_message_id
        eventType = eventData.event
        timestamp = new Date(eventData.timestamp * 1000).toISOString()
        additionalData = {
          ip: eventData.ip,
          userAgent: eventData.useragent,
          url: eventData.url
        }
        break

      case 'mailgun':
        emailId = eventData['message-id']
        eventType = eventData.event
        timestamp = new Date(eventData.timestamp * 1000).toISOString()
        additionalData = {
          ip: eventData['client-info']?.['client-ip'],
          userAgent: eventData['client-info']?.['user-agent'],
          url: eventData.url
        }
        break

      default:
        console.warn(`Unknown email provider webhook: ${provider}`)
        return
    }

    // Find email in queue by provider message ID
    const { data: email } = await supabaseAdmin
      .from('email_queue')
      .select('id')
      .eq('provider_message_id', emailId)
      .single()

    if (!email) {
      console.warn(`Email not found for webhook event: ${emailId}`)
      return
    }

    // Update email status based on event
    const updateData: any = { updated_at: new Date().toISOString() }

    switch (eventType) {
      case 'delivered':
        updateData.delivered_at = timestamp
        break
      case 'opened':
        updateData.opened_at = timestamp
        break
      case 'clicked':
        updateData.clicked_at = timestamp
        break
      case 'bounced':
        updateData.bounced_at = timestamp
        updateData.status = 'failed'
        break
      case 'complained':
        updateData.complained_at = timestamp
        break
    }

    // Update email record
    await supabaseAdmin
      .from('email_queue')
      .update(updateData)
      .eq('id', email.id)

    // Log delivery event
    await logEmailEvent(email.id, eventType, {
      ...additionalData,
      provider,
      originalEvent: eventData
    })

    console.log(`📧 Webhook processed: ${eventType} for email ${email.id}`)

  } catch (error) {
    console.error('Failed to handle email webhook:', error)
  }
}

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats(): Promise<{
  pending: number
  processing: number
  sent: number
  failed: number
  total: number
}> {
  try {
    const { data: stats } = await supabaseAdmin
      .from('email_queue')
      .select('status')

    const counts = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: stats?.length || 0
    }

    stats?.forEach(email => {
      counts[email.status as keyof typeof counts]++
    })

    return counts

  } catch (error) {
    console.error('Failed to get email queue stats:', error)
    return { pending: 0, processing: 0, sent: 0, failed: 0, total: 0 }
  }
}

/**
 * Cleanup old email records
 */
export async function cleanupOldEmails(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { data, error } = await supabaseAdmin
      .from('email_queue')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id')

    if (error) {
      throw error
    }

    const deletedCount = data?.length || 0
    console.log(`🧹 Cleaned up ${deletedCount} old email records`)
    
    return deletedCount

  } catch (error) {
    console.error('Failed to cleanup old emails:', error)
    return 0
  }
}

// Export email queue for external access
export { emailQueue }