import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})

// Global test timeout
jest.setTimeout(30000)

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock WebSocket
const mockWebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}))

// Add static properties to the mock
Object.assign(mockWebSocket, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
})

global.WebSocket = mockWebSocket as any

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: true
  }))
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    pop: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
  })
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
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
      single: jest.fn(),
      maybeSingle: jest.fn()
    })),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn()
      }))
    }
  }))
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      list: jest.fn()
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn()
    },
    refunds: {
      create: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn()
    },
    webhooks: {
      constructEvent: jest.fn()
    },
    setupIntents: {
      create: jest.fn(),
      retrieve: jest.fn()
    },
    invoices: {
      create: jest.fn(),
      retrieve: jest.fn(),
      finalizeInvoice: jest.fn()
    },
    invoiceItems: {
      create: jest.fn()
    }
  }))
})

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(),
    verify: jest.fn()
  }))
}))

// Mock Bull queue
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn(),
    clean: jest.fn(),
    getJobs: jest.fn(),
    getJobCounts: jest.fn()
  }))
})

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    flushall: jest.fn(),
    quit: jest.fn()
  }))
})

// Export test utilities
export const mockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

export const mockStripePaymentIntent = (overrides: any = {}) => ({
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

export const mockUser = (overrides: any = {}) => ({
  id: 'user_test_123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const mockProfile = (overrides: any = {}) => ({
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

export const mockListing = (overrides: any = {}) => ({
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

export const mockAuction = (overrides: any = {}) => ({
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

export const mockBid = (overrides: any = {}) => ({
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

export const mockPayment = (overrides: any = {}) => ({
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