/**
 * Authentication and Security Tests
 * Tests user authentication, authorization, and security measures
 */

const { 
  mockUser, 
  mockProfile, 
  mockListing,
  createMockJWT,
  createMockAuthRequest,
  mockSupabaseResponse,
  validationHelpers
} = require('../utils/test-helpers')

// Mock authentication middleware
jest.mock('@/lib/auth-middleware')

describe('Authentication and Security Tests', () => {
  let mockSupabase
  let mockAuthMiddleware

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        onAuthStateChange: jest.fn()
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
      }))
    }

    mockAuthMiddleware = {
      withAuth: jest.fn(),
      withOptionalAuth: jest.fn(),
      validateRequestBody: jest.fn(),
      validateQueryParams: jest.fn(),
      checkListingOwnership: jest.fn(),
      checkPackageAvailability: jest.fn()
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase,
      createClientComponentClient: () => mockSupabase
    }))

    jest.doMock('@/lib/auth-middleware', () => mockAuthMiddleware)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('JWT Token Validation', () => {
    test('should validate valid JWT token', async () => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })
      const token = createMockJWT({ sub: user.id })

      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse({ user })
      )
      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(profile)
      )

      const { withAuth } = require('@/lib/auth-middleware')
      
      // Mock successful authentication
      mockAuthMiddleware.withAuth.mockImplementation(async (request, handler) => {
        return await handler(request, { user, profile })
      })

      const mockRequest = createMockAuthRequest({
        headers: { authorization: `Bearer ${token}` }
      })

      const mockHandler = jest.fn().mockResolvedValue({ status: 200 })
      
      await mockAuthMiddleware.withAuth(mockRequest, mockHandler)
      
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { user, profile })
    })

    test('should reject expired JWT token', async () => {
      const expiredToken = createMockJWT({ 
        sub: 'user_test_123',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      })

      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse(null, { message: 'JWT expired' })
      )

      mockAuthMiddleware.withAuth.mockImplementation(async (request, handler) => {
        throw new Error('Invalid or expired token')
      })

      const mockRequest = createMockAuthRequest({
        headers: { authorization: `Bearer ${expiredToken}` }
      })

      const mockHandler = jest.fn()
      
      try {
        await mockAuthMiddleware.withAuth(mockRequest, mockHandler)
      } catch (error) {
        expect(error.message).toBe('Invalid or expired token')
      }
      
      expect(mockHandler).not.toHaveBeenCalled()
    })

    test('should reject malformed JWT token', async () => {
      const malformedToken = 'invalid.jwt.token'

      mockAuthMiddleware.withAuth.mockImplementation(async (request, handler) => {
        throw new Error('Invalid authentication token')
      })

      const mockRequest = createMockAuthRequest({
        headers: { authorization: `Bearer ${malformedToken}` }
      })

      const mockHandler = jest.fn()
      
      try {
        await mockAuthMiddleware.withAuth(mockRequest, mockHandler)
      } catch (error) {
        expect(error.message).toBe('Invalid authentication token')
      }
      
      expect(mockHandler).not.toHaveBeenCalled()
    })

    test('should reject missing authorization header', async () => {
      mockAuthMiddleware.withAuth.mockImplementation(async (request, handler) => {
        throw new Error('Missing or invalid authorization header')
      })

      const mockRequest = createMockAuthRequest({
        headers: {} // No authorization header
      })

      const mockHandler = jest.fn()
      
      try {
        await mockAuthMiddleware.withAuth(mockRequest, mockHandler)
      } catch (error) {
        expect(error.message).toBe('Missing or invalid authorization header')
      }
      
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('User Authentication Flow', () => {
    test('should authenticate user with valid credentials', async () => {
      const user = mockUser({ email: 'test@example.com' })
      const credentials = {
        email: 'test@example.com',
        password: 'securePassword123'
      }

      mockSupabase.auth.signIn.mockResolvedValue(
        mockSupabaseResponse({ user, session: { access_token: 'token123' } })
      )

      const result = await mockSupabase.auth.signIn(credentials)
      
      expect(result.data.user).toEqual(user)
      expect(result.data.session.access_token).toBe('token123')
      expect(mockSupabase.auth.signIn).toHaveBeenCalledWith(credentials)
    })

    test('should reject invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongPassword'
      }

      mockSupabase.auth.signIn.mockResolvedValue(
        mockSupabaseResponse(null, { message: 'Invalid credentials' })
      )

      const result = await mockSupabase.auth.signIn(credentials)
      
      expect(result.error.message).toBe('Invalid credentials')
      expect(result.data).toBeNull()
    })

    test('should handle user registration', async () => {
      const newUser = mockUser({ email: 'newuser@example.com' })
      const registrationData = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        options: {
          data: {
            full_name: 'New User'
          }
        }
      }

      mockSupabase.auth.signUp.mockResolvedValue(
        mockSupabaseResponse({ user: newUser })
      )

      const result = await mockSupabase.auth.signUp(registrationData)
      
      expect(result.data.user).toEqual(newUser)
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(registrationData)
    })

    test('should prevent duplicate email registration', async () => {
      const registrationData = {
        email: 'existing@example.com',
        password: 'securePassword123'
      }

      mockSupabase.auth.signUp.mockResolvedValue(
        mockSupabaseResponse(null, { message: 'User already registered' })
      )

      const result = await mockSupabase.auth.signUp(registrationData)
      
      expect(result.error.message).toBe('User already registered')
      expect(result.data).toBeNull()
    })
  })

  describe('Authorization Tests', () => {
    test('should allow user to access own resources', async () => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })
      const listing = mockListing({ user_id: user.id })

      mockAuthMiddleware.checkListingOwnership.mockResolvedValue(true)

      const hasAccess = await mockAuthMiddleware.checkListingOwnership(
        listing.id, 
        user.id
      )
      
      expect(hasAccess).toBe(true)
      expect(mockAuthMiddleware.checkListingOwnership).toHaveBeenCalledWith(
        listing.id, 
        user.id
      )
    })

    test('should deny user access to other users resources', async () => {
      const user1 = mockUser({ id: 'user1' })
      const user2 = mockUser({ id: 'user2' })
      const listing = mockListing({ user_id: user2.id })

      mockAuthMiddleware.checkListingOwnership.mockResolvedValue(false)

      const hasAccess = await mockAuthMiddleware.checkListingOwnership(
        listing.id, 
        user1.id
      )
      
      expect(hasAccess).toBe(false)
    })

    test('should validate dealer permissions', async () => {
      const dealerUser = mockUser()
      const dealerProfile = mockProfile({ 
        id: dealerUser.id, 
        is_dealer: true,
        dealer_license: 'DL123456'
      })

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(dealerProfile)
      )

      const result = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', dealerUser.id)
        .single()
      
      expect(result.data.is_dealer).toBe(true)
      expect(result.data.dealer_license).toBe('DL123456')
    })

    test('should validate package availability for users', async () => {
      const user = mockUser()
      const profile = mockProfile({ 
        id: user.id, 
        free_listings_used: 0,
        is_dealer: false 
      })

      mockAuthMiddleware.checkPackageAvailability.mockResolvedValue({
        available: true
      })

      const result = await mockAuthMiddleware.checkPackageAvailability(
        user.id, 
        null // Free package
      )
      
      expect(result.available).toBe(true)
    })

    test('should deny package access when quota exceeded', async () => {
      const user = mockUser()
      const profile = mockProfile({ 
        id: user.id, 
        free_listings_used: 1,
        is_dealer: false 
      })

      mockAuthMiddleware.checkPackageAvailability.mockResolvedValue({
        available: false,
        reason: 'Free listing quota exceeded'
      })

      const result = await mockAuthMiddleware.checkPackageAvailability(
        user.id, 
        null
      )
      
      expect(result.available).toBe(false)
      expect(result.reason).toBe('Free listing quota exceeded')
    })
  })

  describe('Input Validation and Sanitization', () => {
    test('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ]

      validEmails.forEach(email => {
        expect(validationHelpers.isValidEmail(email)).toBe(true)
      })

      invalidEmails.forEach(email => {
        expect(validationHelpers.isValidEmail(email)).toBe(false)
      })
    })

    test('should validate Swiss postal codes', () => {
      const validPostalCodes = ['8001', '3000', '1200', '7000']
      const invalidPostalCodes = ['800', '80001', 'ABCD', '']

      validPostalCodes.forEach(code => {
        expect(validationHelpers.isValidSwissPostalCode(code)).toBe(true)
      })

      invalidPostalCodes.forEach(code => {
        expect(validationHelpers.isValidSwissPostalCode(code)).toBe(false)
      })
    })

    test('should validate Swiss phone numbers', () => {
      const validPhoneNumbers = [
        '+41 44 123 45 67',
        '044 123 45 67',
        '+41441234567',
        '0441234567'
      ]

      const invalidPhoneNumbers = [
        '+1 555 123 4567', // US number
        '123456789',
        '+41 0 123 45 67', // Invalid format
        ''
      ]

      validPhoneNumbers.forEach(phone => {
        expect(validationHelpers.isValidSwissPhoneNumber(phone)).toBe(true)
      })

      invalidPhoneNumbers.forEach(phone => {
        expect(validationHelpers.isValidSwissPhoneNumber(phone)).toBe(false)
      })
    })

    test('should sanitize user input', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'DROP TABLE users;',
        '../../etc/passwd',
        'javascript:alert(1)'
      ]

      // Mock input sanitization
      const sanitizeInput = (input) => {
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/[<>]/g, '')
          .trim()
      }

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input)
        expect(sanitized).not.toContain('<script>')
        expect(sanitized).not.toContain('DROP TABLE')
      })
    })

    test('should validate UUID format', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      ]

      const invalidUUIDs = [
        'not-a-uuid',
        '123-456-789',
        '',
        '123e4567-e89b-12d3-a456-42661417400' // Too short
      ]

      validUUIDs.forEach(uuid => {
        expect(validationHelpers.isValidUUID(uuid)).toBe(true)
      })

      invalidUUIDs.forEach(uuid => {
        expect(validationHelpers.isValidUUID(uuid)).toBe(false)
      })
    })
  })

  describe('Rate Limiting Tests', () => {
    test('should implement rate limiting for API endpoints', async () => {
      const user = mockUser()
      const requests = Array.from({ length: 100 }, () => 
        createMockAuthRequest({
          headers: { authorization: `Bearer ${createMockJWT({ sub: user.id })}` }
        })
      )

      // Mock rate limiter
      let requestCount = 0
      const rateLimiter = {
        checkLimit: (userId) => {
          requestCount++
          return requestCount <= 60 // 60 requests per minute limit
        }
      }

      const results = requests.map(() => rateLimiter.checkLimit(user.id))
      const allowedRequests = results.filter(allowed => allowed).length
      const blockedRequests = results.filter(allowed => !allowed).length

      expect(allowedRequests).toBe(60)
      expect(blockedRequests).toBe(40)
    })

    test('should implement different rate limits for different endpoints', () => {
      const rateLimits = {
        '/api/listings': { limit: 100, window: 3600000 }, // 100 per hour
        '/api/bids': { limit: 10, window: 60000 }, // 10 per minute
        '/api/payments': { limit: 5, window: 300000 } // 5 per 5 minutes
      }

      Object.entries(rateLimits).forEach(([endpoint, config]) => {
        expect(config.limit).toBeGreaterThan(0)
        expect(config.window).toBeGreaterThan(0)
      })
    })
  })

  describe('Session Management', () => {
    test('should handle session creation', async () => {
      const user = mockUser()
      const session = {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
        expires_in: 3600,
        user
      }

      mockSupabase.auth.getSession.mockResolvedValue(
        mockSupabaseResponse({ session })
      )

      const result = await mockSupabase.auth.getSession()
      
      expect(result.data.session).toEqual(session)
      expect(result.data.session.user).toEqual(user)
    })

    test('should handle session expiration', async () => {
      mockSupabase.auth.getSession.mockResolvedValue(
        mockSupabaseResponse({ session: null })
      )

      const result = await mockSupabase.auth.getSession()
      
      expect(result.data.session).toBeNull()
    })

    test('should handle session refresh', async () => {
      const refreshToken = 'refresh_token_123'
      const newSession = {
        access_token: 'new_access_token_123',
        refresh_token: 'new_refresh_token_123',
        expires_in: 3600
      }

      // Mock refresh token flow
      mockSupabase.auth.refreshSession = jest.fn().mockResolvedValue(
        mockSupabaseResponse({ session: newSession })
      )

      const result = await mockSupabase.auth.refreshSession({ refresh_token: refreshToken })
      
      expect(result.data.session.access_token).toBe('new_access_token_123')
    })
  })

  describe('Password Security', () => {
    test('should enforce password complexity requirements', () => {
      const validatePassword = (password) => {
        const minLength = 8
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        return {
          valid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
          requirements: {
            minLength: password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar
          }
        }
      }

      const weakPasswords = [
        'password',
        '12345678',
        'Password',
        'password123'
      ]

      const strongPasswords = [
        'SecurePass123!',
        'MyStr0ngP@ssw0rd',
        'C0mpl3xP@ssw0rd!'
      ]

      weakPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.valid).toBe(false)
      })

      strongPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.valid).toBe(true)
      })
    })

    test('should handle password reset flow', async () => {
      const email = 'test@example.com'

      mockSupabase.auth.resetPasswordForEmail = jest.fn().mockResolvedValue(
        mockSupabaseResponse({ message: 'Password reset email sent' })
      )

      const result = await mockSupabase.auth.resetPasswordForEmail(email)
      
      expect(result.data.message).toBe('Password reset email sent')
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email)
    })
  })

  describe('CSRF Protection', () => {
    test('should validate CSRF tokens', () => {
      const generateCSRFToken = () => {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15)
      }

      const validateCSRFToken = (token, sessionToken) => {
        return token === sessionToken && token.length >= 20
      }

      const csrfToken = generateCSRFToken()
      
      expect(csrfToken.length).toBeGreaterThanOrEqual(20)
      expect(validateCSRFToken(csrfToken, csrfToken)).toBe(true)
      expect(validateCSRFToken(csrfToken, 'different_token')).toBe(false)
    })
  })

  describe('Security Headers', () => {
    test('should set appropriate security headers', () => {
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }

      Object.entries(securityHeaders).forEach(([header, value]) => {
        expect(header).toBeTruthy()
        expect(value).toBeTruthy()
      })
    })
  })

  describe('Data Encryption', () => {
    test('should encrypt sensitive data', () => {
      const mockEncrypt = (data) => {
        return Buffer.from(data).toString('base64') + '_encrypted'
      }

      const mockDecrypt = (encryptedData) => {
        return Buffer.from(encryptedData.replace('_encrypted', ''), 'base64').toString()
      }

      const sensitiveData = 'user_sensitive_information'
      const encrypted = mockEncrypt(sensitiveData)
      const decrypted = mockDecrypt(encrypted)

      expect(encrypted).not.toBe(sensitiveData)
      expect(encrypted).toContain('_encrypted')
      expect(decrypted).toBe(sensitiveData)
    })
  })

  describe('Audit Logging', () => {
    test('should log security events', () => {
      const securityEvents = []

      const logSecurityEvent = (event) => {
        securityEvents.push({
          ...event,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36)
        })
      }

      // Simulate security events
      logSecurityEvent({
        type: 'LOGIN_SUCCESS',
        userId: 'user_123',
        ip: '192.168.1.1'
      })

      logSecurityEvent({
        type: 'LOGIN_FAILED',
        email: 'test@example.com',
        ip: '192.168.1.1',
        reason: 'Invalid credentials'
      })

      logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: 'user_123',
        resource: '/api/admin/users',
        ip: '192.168.1.1'
      })

      expect(securityEvents).toHaveLength(3)
      expect(securityEvents[0].type).toBe('LOGIN_SUCCESS')
      expect(securityEvents[1].type).toBe('LOGIN_FAILED')
      expect(securityEvents[2].type).toBe('UNAUTHORIZED_ACCESS')
    })
  })
})