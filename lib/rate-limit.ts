import { createServerComponentClient } from "@/lib/supabase-api"
import { getRateLimitMultiplier } from "@/lib/recaptcha"

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  contact_form: {
    windowMinutes: 60,
    maxAttempts: 5,
    blockDurationMinutes: 60
  },
  listing_contact: {
    windowMinutes: 60,
    maxAttempts: 10,
    blockDurationMinutes: 30
  },
  ip_based: {
    windowMinutes: 5,
    maxAttempts: 3,
    blockDurationMinutes: 15
  },
  email_based: {
    windowMinutes: 60,
    maxAttempts: 5,
    blockDurationMinutes: 60
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  retryAfter?: number
  reason?: string
}

export interface RateLimitKey {
  type: keyof typeof RATE_LIMIT_CONFIG
  identifier: string // IP address, email, or user ID
  action?: string
}

/**
 * Check if request is within rate limits
 */
export async function checkRateLimit(
  key: RateLimitKey,
  recaptchaScore?: number
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMIT_CONFIG[key.type]
    const multiplier = getRateLimitMultiplier(recaptchaScore)
    const adjustedMaxAttempts = Math.floor(config.maxAttempts * multiplier)
    
    const supabase = await createServerComponentClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - (config.windowMinutes * 60 * 1000))
    
    // Count recent attempts from database
    const { data: recentAttempts, error } = await supabase
      .from('contact_messages')
      .select('id, created_at, ip_address, email')
      .or(`ip_address.eq.${key.identifier},email.eq.${key.identifier}`)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Rate limit check failed:', error)
      // Allow request if we can't check rate limits
      return {
        allowed: true,
        remaining: adjustedMaxAttempts,
        resetTime: new Date(now.getTime() + (config.windowMinutes * 60 * 1000))
      }
    }
    
    const attemptCount = recentAttempts?.length || 0
    const remaining = Math.max(0, adjustedMaxAttempts - attemptCount)
    const resetTime = new Date(now.getTime() + (config.windowMinutes * 60 * 1000))
    
    if (attemptCount >= adjustedMaxAttempts) {
      const retryAfter = config.blockDurationMinutes * 60 // seconds
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter,
        reason: `Rate limit exceeded. Try again in ${config.blockDurationMinutes} minutes.`
      }
    }
    
    return {
      allowed: true,
      remaining,
      resetTime
    }
    
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Allow request if rate limit check fails
    return {
      allowed: true,
      remaining: 1,
      resetTime: new Date()
    }
  }
}

/**
 * Check multiple rate limits (IP and email based)
 */
export async function checkMultipleRateLimits(
  ipAddress: string,
  email: string,
  action: 'contact_form' | 'listing_contact',
  recaptchaScore?: number
): Promise<RateLimitResult> {
  // Check IP-based rate limit
  const ipLimit = await checkRateLimit({
    type: 'ip_based',
    identifier: ipAddress,
    action
  }, recaptchaScore)
  
  if (!ipLimit.allowed) {
    return ipLimit
  }
  
  // Check email-based rate limit
  const emailLimit = await checkRateLimit({
    type: 'email_based',
    identifier: email,
    action
  }, recaptchaScore)
  
  if (!emailLimit.allowed) {
    return emailLimit
  }
  
  // Check action-specific rate limit
  const actionLimit = await checkRateLimit({
    type: action,
    identifier: email,
    action
  }, recaptchaScore)
  
  return actionLimit
}

/**
 * Spam detection based on content analysis
 */
export function detectSpam(content: {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}): {
  isSpam: boolean
  score: number
  reasons: string[]
} {
  let spamScore = 0
  const reasons: string[] = []
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
    /\b(click here|act now|limited time|urgent|immediate)\b/i,
    /\b(make money|earn \$|guaranteed|risk-free)\b/i,
    /\b(free|cheap|discount|sale|offer)\b/i,
    /\b(loan|credit|debt|mortgage)\b/i
  ]
  
  const allText = `${content.name} ${content.subject} ${content.message}`.toLowerCase()
  
  suspiciousPatterns.forEach((pattern, index) => {
    if (pattern.test(allText)) {
      spamScore += 10
      reasons.push(`Suspicious pattern ${index + 1} detected`)
    }
  })
  
  // Check for excessive capitalization
  const capsRatio = (allText.match(/[A-Z]/g) || []).length / allText.length
  if (capsRatio > 0.3) {
    spamScore += 15
    reasons.push('Excessive capitalization')
  }
  
  // Check for excessive punctuation
  const punctuationRatio = (allText.match(/[!?]{2,}/g) || []).length
  if (punctuationRatio > 2) {
    spamScore += 10
    reasons.push('Excessive punctuation')
  }
  
  // Check for suspicious email patterns
  const suspiciousEmailPatterns = [
    /\d{5,}@/,  // Many numbers in email
    /[a-z]{20,}@/, // Very long username
    /@[a-z]{2,3}\.[a-z]{10,}/ // Suspicious domain
  ]
  
  suspiciousEmailPatterns.forEach((pattern, index) => {
    if (pattern.test(content.email)) {
      spamScore += 20
      reasons.push(`Suspicious email pattern ${index + 1}`)
    }
  })
  
  // Check for URL patterns in message
  const urlPattern = /https?:\/\/[^\s]+/gi
  const urls = content.message.match(urlPattern) || []
  if (urls.length > 2) {
    spamScore += 25
    reasons.push('Multiple URLs detected')
  }
  
  // Check for phone number patterns (if phone not provided but numbers in message)
  if (!content.phone) {
    const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
    const phoneMatches = content.message.match(phonePattern) || []
    if (phoneMatches.length > 1) {
      spamScore += 15
      reasons.push('Multiple phone numbers in message')
    }
  }
  
  // Check message length (too short or too long can be suspicious)
  if (content.message.length < 20) {
    spamScore += 10
    reasons.push('Message too short')
  } else if (content.message.length > 2000) {
    spamScore += 15
    reasons.push('Message too long')
  }
  
  // Check for repetitive content
  const words = content.message.toLowerCase().split(/\s+/)
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    if (word.length > 3) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  })
  
  const maxWordCount = Math.max(...Array.from(wordCount.values()))
  if (maxWordCount > words.length * 0.2) {
    spamScore += 20
    reasons.push('Repetitive content detected')
  }
  
  // Check for name/email mismatch
  const nameParts = content.name.toLowerCase().split(/\s+/)
  const emailUser = content.email.split('@')[0].toLowerCase()
  const hasNameMatch = nameParts.some(part => 
    part.length > 2 && emailUser.includes(part)
  )
  
  if (!hasNameMatch && content.name.length > 5) {
    spamScore += 10
    reasons.push('Name and email mismatch')
  }
  
  return {
    isSpam: spamScore >= 50,
    score: spamScore,
    reasons
  }
}

/**
 * Check if IP address is in blocklist
 */
export async function checkIPBlocklist(ipAddress: string): Promise<{
  blocked: boolean
  reason?: string
}> {
  try {
    // Check against known spam IP ranges
    const blockedRanges = [
      '10.0.0.0/8',     // Private networks (shouldn't be public)
      '172.16.0.0/12',  // Private networks
      '192.168.0.0/16', // Private networks
      '127.0.0.0/8'     // Loopback
    ]
    
    // Simple IP range check (in production, use a proper IP library)
    for (const range of blockedRanges) {
      if (ipAddress.startsWith(range.split('/')[0].split('.').slice(0, -1).join('.'))) {
        return {
          blocked: true,
          reason: 'IP address in blocked range'
        }
      }
    }
    
    // Check database for manually blocked IPs
    const supabase = await createServerComponentClient()
    const { data: blockedIPs } = await supabase
      .from('contact_messages')
      .select('ip_address')
      .eq('ip_address', ipAddress)
      .eq('status', 'closed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(10)
    
    // If IP has many closed/spam messages, consider it suspicious
    if (blockedIPs && blockedIPs.length >= 5) {
      return {
        blocked: true,
        reason: 'IP address has excessive spam history'
      }
    }
    
    return { blocked: false }
    
  } catch (error) {
    console.error('IP blocklist check failed:', error)
    return { blocked: false }
  }
}

/**
 * Comprehensive spam and rate limit check
 */
export async function performSecurityChecks(
  request: Request,
  content: {
    name: string
    email: string
    subject: string
    message: string
    phone?: string
  },
  recaptchaScore?: number
): Promise<{
  allowed: boolean
  reason?: string
  rateLimitInfo?: RateLimitResult
  spamInfo?: ReturnType<typeof detectSpam>
}> {
  // Get IP address
  const ipAddress = getIPAddress(request)
  
  // Check IP blocklist
  const ipCheck = await checkIPBlocklist(ipAddress)
  if (ipCheck.blocked) {
    return {
      allowed: false,
      reason: ipCheck.reason
    }
  }
  
  // Check rate limits
  const rateLimitResult = await checkMultipleRateLimits(
    ipAddress,
    content.email,
    'contact_form',
    recaptchaScore
  )
  
  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      reason: rateLimitResult.reason,
      rateLimitInfo: rateLimitResult
    }
  }
  
  // Check for spam
  const spamCheck = detectSpam(content)
  
  // Adjust spam threshold based on reCAPTCHA score
  let spamThreshold = 50
  if (recaptchaScore !== undefined) {
    if (recaptchaScore >= 0.8) spamThreshold = 70  // More lenient for high scores
    else if (recaptchaScore <= 0.3) spamThreshold = 30  // Stricter for low scores
  }
  
  if (spamCheck.score >= spamThreshold) {
    return {
      allowed: false,
      reason: `Message flagged as spam (score: ${spamCheck.score})`,
      spamInfo: spamCheck
    }
  }
  
  return {
    allowed: true,
    rateLimitInfo: rateLimitResult,
    spamInfo: spamCheck
  }
}

/**
 * Get IP address from request
 */
function getIPAddress(request: Request): string {
  // Check various headers for client IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      const ip = value.split(',')[0].trim()
      if (ip && isValidIP(ip)) {
        return ip
      }
    }
  }

  return '127.0.0.1' // Fallback
}

/**
 * Basic IP address validation
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * Log security event for monitoring
 */
export function logSecurityEvent(
  event: 'rate_limit_exceeded' | 'spam_detected' | 'ip_blocked' | 'recaptcha_failed',
  details: {
    ipAddress: string
    email?: string
    userAgent?: string
    reason?: string
    score?: number
    timestamp?: Date
  }
) {
  const logEntry = {
    event,
    timestamp: details.timestamp || new Date(),
    ipAddress: details.ipAddress,
    email: details.email,
    userAgent: details.userAgent,
    reason: details.reason,
    score: details.score
  }
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'development') {
    console.log('Security event:', logEntry)
  }
  
  // You can extend this to send to services like:
  // - Sentry for error tracking
  // - DataDog for security monitoring
  // - Custom security dashboard
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(rateLimitResult: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(rateLimitResult.resetTime.getTime() / 1000).toString()
  }
  
  if (rateLimitResult.retryAfter) {
    headers['Retry-After'] = rateLimitResult.retryAfter.toString()
  }
  
  return headers
}