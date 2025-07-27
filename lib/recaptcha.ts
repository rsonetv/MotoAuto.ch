import { RecaptchaVerificationInput } from "@/lib/schemas/contact-api-schema"

// reCAPTCHA configuration
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

// Default configuration
const DEFAULT_MIN_SCORE = 0.5
const DEFAULT_ACTIONS = {
  CONTACT_FORM: 'contact_form',
  LISTING_CONTACT: 'listing_contact',
  GENERAL_INQUIRY: 'general_inquiry'
}

export interface RecaptchaVerificationResult {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  error_codes?: string[]
  message?: string
}

/**
 * Verify reCAPTCHA token with Google's API
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  minScore: number = DEFAULT_MIN_SCORE,
  remoteip?: string
): Promise<RecaptchaVerificationResult> {
  try {
    // Check if secret key is configured
    if (!RECAPTCHA_SECRET_KEY) {
      console.error('reCAPTCHA secret key not configured')
      return {
        success: false,
        message: 'reCAPTCHA verification not configured'
      }
    }

    // Prepare request body
    const requestBody = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    })

    // Add remote IP if provided
    if (remoteip) {
      requestBody.append('remoteip', remoteip)
    }

    // Make request to Google's verification API
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody.toString(),
    })

    if (!response.ok) {
      throw new Error(`reCAPTCHA API request failed: ${response.status}`)
    }

    const data = await response.json()

    // Check if verification was successful
    if (!data.success) {
      console.warn('reCAPTCHA verification failed:', data['error-codes'])
      return {
        success: false,
        error_codes: data['error-codes'],
        message: 'reCAPTCHA verification failed'
      }
    }

    // For reCAPTCHA v3, check score
    if (data.score !== undefined) {
      if (data.score < minScore) {
        console.warn(`reCAPTCHA score too low: ${data.score} < ${minScore}`)
        return {
          success: false,
          score: data.score,
          action: data.action,
          message: `reCAPTCHA score too low: ${data.score}`
        }
      }
    }

    // Check action if expected action is provided
    if (expectedAction && data.action !== expectedAction) {
      console.warn(`reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`)
      return {
        success: false,
        score: data.score,
        action: data.action,
        message: `reCAPTCHA action mismatch: expected ${expectedAction}`
      }
    }

    // Verification successful
    return {
      success: true,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname
    }

  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'reCAPTCHA verification failed'
    }
  }
}

/**
 * Verify reCAPTCHA for contact form submissions
 */
export async function verifyContactFormRecaptcha(
  token: string,
  action: string = DEFAULT_ACTIONS.CONTACT_FORM,
  remoteip?: string
): Promise<RecaptchaVerificationResult> {
  return verifyRecaptcha(token, action, DEFAULT_MIN_SCORE, remoteip)
}

/**
 * Verify reCAPTCHA for listing contact submissions
 */
export async function verifyListingContactRecaptcha(
  token: string,
  remoteip?: string
): Promise<RecaptchaVerificationResult> {
  return verifyRecaptcha(token, DEFAULT_ACTIONS.LISTING_CONTACT, DEFAULT_MIN_SCORE, remoteip)
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | undefined {
  // Check various headers for client IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim()
      if (ip && isValidIP(ip)) {
        return ip
      }
    }
  }

  return undefined
}

/**
 * Basic IP address validation
 */
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * Create reCAPTCHA configuration for frontend
 */
export function getRecaptchaConfig() {
  return {
    siteKey: RECAPTCHA_SITE_KEY,
    actions: DEFAULT_ACTIONS,
    minScore: DEFAULT_MIN_SCORE
  }
}

/**
 * Middleware helper for reCAPTCHA verification
 */
export async function withRecaptchaVerification(
  request: Request,
  token: string,
  expectedAction?: string,
  minScore?: number
): Promise<{ success: boolean; error?: string; score?: number }> {
  const clientIP = getClientIP(request)
  const result = await verifyRecaptcha(token, expectedAction, minScore, clientIP)
  
  if (!result.success) {
    return {
      success: false,
      error: result.message || 'reCAPTCHA verification failed',
      score: result.score
    }
  }
  
  return {
    success: true,
    score: result.score
  }
}

/**
 * Rate limiting based on reCAPTCHA scores
 */
export function shouldApplyStrictRateLimit(score?: number): boolean {
  if (score === undefined) return true
  
  // Apply stricter rate limits for lower scores
  return score < 0.7
}

/**
 * Get rate limit multiplier based on reCAPTCHA score
 */
export function getRateLimitMultiplier(score?: number): number {
  if (score === undefined) return 1
  
  if (score >= 0.9) return 2 // Allow more requests for high scores
  if (score >= 0.7) return 1.5
  if (score >= 0.5) return 1
  return 0.5 // Stricter limits for low scores
}

/**
 * Log reCAPTCHA verification for monitoring
 */
export function logRecaptchaVerification(
  result: RecaptchaVerificationResult,
  context: {
    action?: string
    ip?: string
    userAgent?: string
    userId?: string
  }
) {
  const logData = {
    timestamp: new Date().toISOString(),
    success: result.success,
    score: result.score,
    action: result.action,
    hostname: result.hostname,
    error_codes: result.error_codes,
    context
  }
  
  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'development') {
    console.log('reCAPTCHA verification:', logData)
  }
  
  // You can extend this to send to monitoring services like:
  // - Sentry for error tracking
  // - DataDog for metrics
  // - Custom analytics endpoint
}

// Export constants for use in other modules
export const RECAPTCHA_ACTIONS = DEFAULT_ACTIONS
export const RECAPTCHA_MIN_SCORE = DEFAULT_MIN_SCORE