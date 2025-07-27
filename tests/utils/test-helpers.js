// Test utilities and helpers for MotoAuto.ch testing

/**
 * Mock Supabase response helper
 */
export const mockSupabaseResponse = (data, error = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

/**
 * Mock Stripe payment intent
 */
export const mockStripePaymentIntent = (overrides = {}) => ({
  id: 'pi_test_123',
  client_secret: 'pi_test_123_secret',
  amount: 2000,
  currency: 'chf',
  status: 'requires_payment_method',
  payment_method_types: ['card'],
  created: Math.floor(Date.now() / 1000),
  metadata: {},
  ...overrides
})

/**
 * Mock user data
 */
export const mockUser = (overrides = {}) => ({
  id: 'user_test_123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock profile data
 */
export const mockProfile = (overrides = {}) => ({
  id: 'user_test_123',
  email: 'test@example.com',
  full_name: 'Test User',
  is_dealer: false,
  free_listings_used: 0,
  total_listings: 0,
  total_sales: 0,
  rating: 0,
  rating_count: 0,
  preferred_language: 'de',
  country: 'CH',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock listing data
 */
export const mockListing = (overrides = {}) => ({
  id: 'listing_test_123',
  user_id: 'user_test_123',
  category_id: 'category_test_123',
  title: 'Test Vehicle',
  brand: 'BMW',
  model: 'X5',
  year: 2020,
  price: 50000,
  currency: 'CHF',
  location: 'Zurich',
  postal_code: '8001',
  country: 'CH',
  status: 'active',
  is_auction: false,
  current_bid: 0,
  bid_count: 0,
  views: 0,
  favorites_count: 0,
  images: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock auction data
 */
export const mockAuction = (overrides = {}) => ({
  id: 'auction_test_123',
  listing_id: 'listing_test_123',
  starting_price: 45000,
  reserve_met: false,
  total_bids: 0,
  unique_bidders: 0,
  extended_count: 0,
  max_extensions: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock bid data
 */
export const mockBid = (overrides = {}) => ({
  id: 'bid_test_123',
  listing_id: 'listing_test_123',
  auction_id: 'auction_test_123',
  user_id: 'user_test_123',
  amount: 46000,
  is_auto_bid: false,
  status: 'active',
  placed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock payment data
 */
export const mockPayment = (overrides = {}) => ({
  id: 'payment_test_123',
  user_id: 'user_test_123',
  amount: 2000,
  currency: 'CHF',
  payment_type: 'commission',
  status: 'pending',
  commission_rate: 0.05,
  commission_amount: 2000,
  max_commission: 500,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock category data
 */
export const mockCategory = (overrides = {}) => ({
  id: 'category_test_123',
  name_en: 'Cars',
  name_de: 'Autos',
  name_fr: 'Voitures',
  name_pl: 'Samochody',
  slug: 'cars',
  parent_id: null,
  is_active: true,
  sort_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Mock package data
 */
export const mockPackage = (overrides = {}) => ({
  id: 'package_test_123',
  name_en: 'Premium Package',
  name_de: 'Premium Paket',
  name_fr: 'Package Premium',
  name_pl: 'Pakiet Premium',
  price_chf: 29.90,
  duration_days: 60,
  max_images: 15,
  is_active: true,
  is_featured: true,
  is_premium: true,
  features: {
    highlighted: true,
    top_placement: true,
    social_media: true
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

/**
 * Create mock JWT token
 */
export const createMockJWT = (payload = {}) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const defaultPayload = {
    sub: 'user_test_123',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }
  
  const finalPayload = { ...defaultPayload, ...payload }
  
  // Simple base64 encoding for testing (not secure, just for mocking)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
  const encodedPayload = Buffer.from(JSON.stringify(finalPayload)).toString('base64')
  const signature = 'mock_signature'
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Create mock request with authentication
 */
export const createMockAuthRequest = (overrides = {}) => {
  const token = createMockJWT()
  return {
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...overrides.headers
    },
    json: jest.fn().mockResolvedValue(overrides.body || {}),
    url: overrides.url || 'http://localhost:3000/api/test',
    method: overrides.method || 'GET',
    ...overrides
  }
}

/**
 * Create mock Next.js request
 */
export const createMockNextRequest = (overrides = {}) => {
  return {
    headers: new Map(Object.entries(overrides.headers || {})),
    json: jest.fn().mockResolvedValue(overrides.body || {}),
    url: overrides.url || 'http://localhost:3000/api/test',
    method: overrides.method || 'GET',
    ...overrides
  }
}

/**
 * Swiss test data helpers
 */
export const swissTestData = {
  cantons: ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'],
  postalCodes: ['8001', '3001', '6000', '4001', '1200', '7000', '9000'],
  cities: ['Zürich', 'Bern', 'Luzern', 'Basel', 'Genève', 'Chur', 'St. Gallen'],
  phoneNumbers: ['+41 44 123 45 67', '+41 31 987 65 43', '044 123 45 67'],
  vatNumbers: ['CHE-123.456.789 MWST', 'CHE-987.654.321 TVA', 'CHE-555.666.777 IVA'],
  ibans: ['CH93 0076 2011 6238 5295 7', 'CH56 0483 5012 3456 7800 9']
}

/**
 * Currency formatting helpers
 */
export const formatCurrency = (amount, currency = 'CHF', locale = 'de-CH') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Date helpers for testing
 */
export const dateHelpers = {
  addDays: (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },
  
  addMinutes: (date, minutes) => {
    const result = new Date(date)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  },
  
  isSwissBusinessHours: (date = new Date()) => {
    const day = date.getDay()
    const hour = date.getHours()
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18
  },
  
  getCurrentTaxPeriod: () => {
    const now = new Date()
    const year = now.getFullYear()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    return `${year}-Q${quarter}`
  }
}

/**
 * Validation helpers
 */
export const validationHelpers = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  isValidSwissPostalCode: (postalCode) => {
    return /^\d{4}$/.test(postalCode)
  },
  
  isValidSwissPhoneNumber: (phone) => {
    const swissPhoneRegex = /^(\+41|0041|0)[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/
    return swissPhoneRegex.test(phone.replace(/\s/g, ''))
  },
  
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}

/**
 * API response helpers
 */
export const apiHelpers = {
  createSuccessResponse: (data, meta = {}) => ({
    success: true,
    data,
    ...meta
  }),
  
  createErrorResponse: (message, code = 'GENERIC_ERROR', details = {}) => ({
    success: false,
    error: message,
    code,
    details
  }),
  
  createPaginatedResponse: (data, pagination) => ({
    success: true,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      total: pagination.total || data.length,
      totalPages: Math.ceil((pagination.total || data.length) / (pagination.limit || 20)),
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    }
  })
}

/**
 * WebSocket test helpers
 */
export const websocketHelpers = {
  createMockSocket: () => ({
    id: 'socket_test_123',
    userId: 'user_test_123',
    emit: jest.fn(),
    on: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    to: jest.fn().mockReturnThis(),
    handshake: {
      auth: { token: createMockJWT() },
      headers: { authorization: `Bearer ${createMockJWT()}` }
    }
  }),
  
  createMockRoom: (auctionId = 'auction_test_123') => ({
    auctionId,
    listingId: 'listing_test_123',
    participants: new Set(['user_test_123']),
    lastActivity: new Date()
  })
}

/**
 * Email test helpers
 */
export const emailHelpers = {
  createMockEmailData: (overrides = {}) => ({
    to_email: 'test@example.com',
    to_name: 'Test User',
    from_email: 'noreply@motoauto.ch',
    from_name: 'MotoAuto.ch',
    subject: 'Test Email',
    html_content: '<p>Test email content</p>',
    text_content: 'Test email content',
    email_type: 'test',
    language: 'de',
    ...overrides
  }),
  
  createMockEmailTemplate: (overrides = {}) => ({
    name: 'test_template',
    subject: 'Test Subject {{name}}',
    html_template: '<p>Hello {{name}}</p>',
    text_template: 'Hello {{name}}',
    language: 'de',
    category: 'test',
    is_active: true,
    ...overrides
  })
}

/**
 * Performance test helpers
 */
export const performanceHelpers = {
  measureExecutionTime: async (fn) => {
    const start = process.hrtime.bigint()
    const result = await fn()
    const end = process.hrtime.bigint()
    const executionTime = Number(end - start) / 1000000 // Convert to milliseconds
    
    return {
      result,
      executionTime
    }
  },
  
  createLoadTestData: (count, factory) => {
    return Array.from({ length: count }, (_, index) => factory(index))
  }
}

/**
 * Database test helpers
 */
export const databaseHelpers = {
  createMockQueryBuilder: () => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn()
  }),
  
  mockDatabaseError: (message = 'Database error', code = 'PGRST301') => ({
    message,
    code,
    details: null,
    hint: null
  })
}