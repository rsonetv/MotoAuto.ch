// Email system database types for MotoAuto.ch
import { Database } from '@/lib/database.types'

// Email preferences table type
export interface EmailPreferences {
  id: string
  user_id: string
  
  // Notification categories
  auction_notifications: boolean
  outbid_notifications: boolean
  auction_ending_notifications: boolean
  auction_won_notifications: boolean
  auction_extended_notifications: boolean
  
  watchlist_notifications: boolean
  watchlist_updates: boolean
  watchlist_ending_soon: boolean
  
  account_notifications: boolean
  registration_confirmations: boolean
  password_reset_notifications: boolean
  profile_update_notifications: boolean
  security_notifications: boolean
  
  payment_notifications: boolean
  payment_confirmations: boolean
  invoice_notifications: boolean
  refund_notifications: boolean
  commission_notifications: boolean
  
  contact_notifications: boolean
  contact_confirmations: boolean
  contact_responses: boolean
  listing_inquiries: boolean
  
  marketing_notifications: boolean
  newsletter_subscription: boolean
  promotional_emails: boolean
  feature_announcements: boolean
  
  // Frequency settings
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'disabled'
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'disabled'
  
  // Language and format preferences
  preferred_language: 'de' | 'fr' | 'pl' | 'en'
  email_format: 'html' | 'text' | 'both'
  
  // Unsubscribe management
  unsubscribe_token: string
  is_unsubscribed: boolean
  unsubscribed_at?: string
  unsubscribe_reason?: string
  
  // Swiss compliance
  consent_given: boolean
  consent_date?: string
  consent_ip_address?: string
  data_retention_consent: boolean
  marketing_consent: boolean
  
  // Metadata
  created_at: string
  updated_at: string
}

// Email queue table type
export interface EmailQueue {
  id: string
  
  // Recipient information
  to_email: string
  to_name?: string
  from_email: string
  from_name?: string
  reply_to?: string
  
  // Email content
  subject: string
  html_content?: string
  text_content?: string
  template_name?: string
  template_data?: Record<string, any>
  
  // Email metadata
  email_type: string
  category: string
  language: 'de' | 'fr' | 'pl' | 'en'
  priority: number
  
  // Related entities
  user_id?: string
  listing_id?: string
  auction_id?: string
  payment_id?: string
  contact_message_id?: string
  
  // Queue management
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
  scheduled_at: string
  attempts: number
  max_attempts: number
  last_attempt_at?: string
  next_retry_at?: string
  
  // Delivery tracking
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  bounced_at?: string
  complained_at?: string
  
  // Error handling
  error_message?: string
  error_code?: string
  
  // Provider information
  provider?: string
  provider_message_id?: string
  provider_response?: Record<string, any>
  
  // Metadata
  created_at: string
  updated_at: string
}

// Email delivery logs table type
export interface EmailDeliveryLog {
  id: string
  email_queue_id: string
  
  // Event tracking
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
  event_timestamp: string
  
  // Event details
  ip_address?: string
  user_agent?: string
  location_country?: string
  location_city?: string
  
  // Link tracking (for clicks)
  clicked_url?: string
  link_id?: string
  
  // Bounce/complaint details
  bounce_type?: string
  bounce_reason?: string
  complaint_type?: string
  
  // Provider data
  provider_event_id?: string
  provider_data?: Record<string, any>
  
  // Metadata
  created_at: string
}

// Email templates table type
export interface EmailTemplate {
  id: string
  
  // Template identification
  name: string
  category: string
  type: string
  language: 'de' | 'fr' | 'pl' | 'en'
  version: number
  
  // Template content
  subject_template: string
  html_template?: string
  text_template?: string
  
  // Template metadata
  description?: string
  variables?: Record<string, any>
  
  // Status and versioning
  is_active: boolean
  is_default: boolean
  
  // A/B testing
  test_group?: string
  test_percentage: number
  
  // Metadata
  created_by?: string
  created_at: string
  updated_at: string
}

// Email campaigns table type
export interface EmailCampaign {
  id: string
  
  // Campaign details
  name: string
  description?: string
  campaign_type: 'newsletter' | 'promotional' | 'announcement' | 'transactional'
  
  // Targeting
  target_audience?: Record<string, any>
  languages: string[]
  
  // Content
  template_id?: string
  subject: string
  content_data?: Record<string, any>
  
  // Scheduling
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  scheduled_at?: string
  started_at?: string
  completed_at?: string
  
  // Statistics
  total_recipients: number
  emails_sent: number
  emails_delivered: number
  emails_opened: number
  emails_clicked: number
  emails_bounced: number
  emails_complained: number
  unsubscribes: number
  
  // Swiss compliance
  gdpr_compliant: boolean
  consent_required: boolean
  data_retention_days: number
  
  // Metadata
  created_by?: string
  created_at: string
  updated_at: string
}

// Email unsubscribes table type
export interface EmailUnsubscribe {
  id: string
  
  // User information
  email: string
  user_id?: string
  
  // Unsubscribe details
  unsubscribe_token: string
  unsubscribe_type: 'all' | 'category' | 'campaign'
  category?: string
  campaign_id?: string
  
  // Reason and feedback
  reason?: string
  feedback?: string
  
  // Tracking
  ip_address?: string
  user_agent?: string
  referrer?: string
  
  // Resubscribe tracking
  is_resubscribed: boolean
  resubscribed_at?: string
  
  // Metadata
  created_at: string
}

// Email notification types
export type EmailNotificationType =
  | 'auction_outbid'
  | 'auction_ending'
  | 'auction_ending_soon'
  | 'auction_won'
  | 'auction_lost'
  | 'auction_extended'
  | 'new_question_posted'
  | 'question_answered'
  | 'watchlist_update'
  | 'watchlist_ending'
  | 'account_welcome'
  | 'account_verification'
  | 'account_password_reset'
  | 'account_profile_update'
  | 'account_security'
  | 'payment_confirmation'
  | 'payment_invoice'
  | 'payment_refund'
  | 'payment_commission'
  | 'contact_confirmation'
  | 'contact_response'
  | 'listing_inquiry'
  | 'newsletter'
  | 'promotional'
  | 'announcement'

// Email template variables interface
export interface EmailTemplateVariables {
  user?: {
    id: string
    name: string
    email: string
    language: string
  }
  listing?: {
    id: string
    title: string
    brand: string
    model: string
    price?: number
    year?: number
    mileage?: number
    fuelType?: string
    currency: string
    url: string
    images?: string[]
  }
  auction?: {
    id: string
    currentBid: number
    bidCount: number
    endTime: string
    timeRemaining: string
    isExtended: boolean
    startingPrice?: number
    winningBid?: number
    totalBids?: number
    endedAt?: string
    newEndTime?: string
    extensionCount?: number
    maxExtensions?: number
    highestBidderId?: string
  }
  payment?: {
    id: string
    amount: number
    currency: string
    description: string
    method: string
    status: string
    commissionAmount?: number
    commissionRate?: number
  }
  contact?: {
    id: string
    name: string
    email: string
    subject: string
    message: string
    category: string
  }
  seller?: {
    name: string
    email: string
    phone?: string
    iban?: string
  }
  userBid?: {
    amount: number
  }
  question?: {
    id: number
    text: string
    answer?: string
    author?: string
    url: string
  }
  // Common variables
  websiteUrl?: string
  supportEmail?: string
  unsubscribeUrl?: string
  verificationUrl?: string
  loginUrl?: string
  paymentUrl?: string
  searchUrl?: string
  [key: string]: any
}

// Email service configuration
export interface EmailServiceConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses'
  host?: string
  port?: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }
  apiKey?: string
  domain?: string
  region?: string
  fromEmail: string
  fromName: string
  replyTo?: string
  maxRetries: number
  retryDelay: number
  rateLimit: {
    max: number
    windowMs: number
  }
}

// Email queue job data
export interface EmailQueueJobData {
  emailId: string
  priority: number
  delay?: number
  attempts?: number
}

// Email delivery status
export interface EmailDeliveryStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained'
  timestamp: string
  error?: string
  providerResponse?: Record<string, any>
}

// Email analytics data
export interface EmailAnalytics {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalComplaints: number
  totalUnsubscribes: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  complaintRate: number
  unsubscribeRate: number
}

// Email preference update data
export interface EmailPreferenceUpdate {
  [key: string]: boolean | string
}

// Unsubscribe request data
export interface UnsubscribeRequest {
  token: string
  type: 'all' | 'category' | 'campaign'
  category?: string
  campaignId?: string
  reason?: string
  feedback?: string
}

// Email validation result
export interface EmailValidationResult {
  isValid: boolean
  canSend: boolean
  reason?: string
  preferences?: EmailPreferences
}

// Export all types
export type { Database }