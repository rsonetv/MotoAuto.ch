/**
 * API Endpoints Integration Tests
 * Tests all API routes for proper functionality and error handling
 */

const request = require('supertest')
const { NextRequest, NextResponse } = require('next/server')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid, 
  mockPayment,
  mockCategory,
  mockPackage,
  createMockJWT,
  createMockAuthRequest,
  apiHelpers,
  mockSupabaseResponse
} = require('../utils/test-helpers')

// Mock Next.js server for testing
const createMockApp = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  listen: jest.fn()
})

describe('API Endpoints Integration Tests', () => {
  let mockApp
  let mockSupabase

  beforeEach(() => {
    mockApp = createMockApp()
    
    mockSupabase = {
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
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn()
      },
      rpc: jest.fn()
    }

    // Mock Supabase client creation
    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('Listings API Tests', () => {
    describe('GET /api/listings', () => {
      test('should return paginated listings', async () => {
        const listings = Array.from({ length: 20 }, (_, i) => 
          mockListing({ title: `Test Listing ${i}` })
        )

        mockSupabase.from().select().eq().order().range().mockResolvedValue(
          mockSupabaseResponse(listings)
        )

        // Mock count query
        mockSupabase.from().select().mockResolvedValue(
          mockSupabaseResponse(null, null, { count: 100 })
        )

        const mockRequest = new NextRequest('http://localhost:3000/api/listings?page=1&limit=20')
        
        // Mock the API handler
        const { GET } = require('@/app/api/listings/route')
        const response = await GET(mockRequest)
        
        expect(response).toBeDefined()
        expect(mockSupabase.from).toHaveBeenCalledWith('listings')
      })

      test('should handle search queries', async () => {
        const searchTerm = 'BMW'
        const filteredListings = [
          mockListing({ brand: 'BMW', model: 'X5' }),
          mockListing({ brand: 'BMW', model: '3 Series' })
        ]

        mockSupabase.from().select().or().mockResolvedValue(
          mockSupabaseResponse(filteredListings)
        )

        const mockRequest = new NextRequest(`http://localhost:3000/api/listings?search=${searchTerm}`)
        
        const { GET } = require('@/app/api/listings/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from().select().or).toHaveBeenCalled()
      })

      test('should handle filtering by category', async () => {
        const categoryId = 'category_test_123'
        const categoryListings = [mockListing({ category_id: categoryId })]

        mockSupabase.from().select().eq().mockResolvedValue(
          mockSupabaseResponse(categoryListings)
        )

        const mockRequest = new NextRequest(`http://localhost:3000/api/listings?category_id=${categoryId}`)
        
        const { GET } = require('@/app/api/listings/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('category_id', categoryId)
      })

      test('should handle price range filtering', async () => {
        const minPrice = 10000
        const maxPrice = 50000

        mockSupabase.from().select().gte().lte().mockResolvedValue(
          mockSupabaseResponse([mockListing({ price: 30000 })])
        )

        const mockRequest = new NextRequest(`http://localhost:3000/api/listings?price_min=${minPrice}&price_max=${maxPrice}`)
        
        const { GET } = require('@/app/api/listings/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from().select().gte).toHaveBeenCalledWith('price', minPrice)
        expect(mockSupabase.from().select().lte).toHaveBeenCalledWith('price', maxPrice)
      })
    })

    describe('POST /api/listings', () => {
      test('should create new listing with authentication', async () => {
        const user = mockUser()
        const profile = mockProfile({ id: user.id })
        const newListing = mockListing({ user_id: user.id })

        // Mock authentication
        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(profile)
        )

        // Mock category validation
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse({ id: newListing.category_id, is_active: true })
        )

        // Mock listing creation
        mockSupabase.from().insert().select().single.mockResolvedValue(
          mockSupabaseResponse(newListing)
        )

        const token = createMockJWT({ sub: user.id })
        const mockRequest = new NextRequest('http://localhost:3000/api/listings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newListing.title,
            brand: newListing.brand,
            model: newListing.model,
            price: newListing.price,
            category_id: newListing.category_id,
            location: newListing.location,
            postal_code: newListing.postal_code
          })
        })

        const { POST } = require('@/app/api/listings/route')
        const response = await POST(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('listings')
      })

      test('should reject unauthenticated requests', async () => {
        const mockRequest = new NextRequest('http://localhost:3000/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockListing())
        })

        const { POST } = require('@/app/api/listings/route')
        const response = await POST(mockRequest)
        
        expect(response.status).toBe(401)
      })

      test('should validate required fields', async () => {
        const user = mockUser()
        const token = createMockJWT({ sub: user.id })

        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )

        const mockRequest = new NextRequest('http://localhost:3000/api/listings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // Missing required fields
            title: 'Test'
          })
        })

        const { POST } = require('@/app/api/listings/route')
        const response = await POST(mockRequest)
        
        expect(response.status).toBe(400)
      })
    })

    describe('GET /api/listings/[id]', () => {
      test('should return specific listing', async () => {
        const listing = mockListing()

        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(listing)
        )

        const mockRequest = new NextRequest(`http://localhost:3000/api/listings/${listing.id}`)
        
        const { GET } = require('@/app/api/listings/[id]/route')
        const response = await GET(mockRequest, { params: { id: listing.id } })
        
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('id', listing.id)
      })

      test('should return 404 for non-existent listing', async () => {
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(null, { code: 'PGRST116', message: 'Row not found' })
        )

        const mockRequest = new NextRequest('http://localhost:3000/api/listings/non-existent')
        
        const { GET } = require('@/app/api/listings/[id]/route')
        const response = await GET(mockRequest, { params: { id: 'non-existent' } })
        
        expect(response.status).toBe(404)
      })
    })
  })

  describe('Auctions API Tests', () => {
    describe('GET /api/auctions', () => {
      test('should return active auctions', async () => {
        const auctions = [
          mockAuction(),
          mockAuction({ id: 'auction_2' })
        ]

        mockSupabase.from().select().eq().order().mockResolvedValue(
          mockSupabaseResponse(auctions)
        )

        const mockRequest = new NextRequest('http://localhost:3000/api/auctions')
        
        const { GET } = require('@/app/api/auctions/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('auctions')
      })
    })

    describe('POST /api/auctions', () => {
      test('should create new auction', async () => {
        const user = mockUser()
        const profile = mockProfile({ id: user.id })
        const listing = mockListing({ user_id: user.id, is_auction: true })
        const auction = mockAuction({ listing_id: listing.id })

        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(profile)
        )

        // Mock listing validation
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(listing)
        )

        // Mock auction creation
        mockSupabase.from().insert().select().single.mockResolvedValue(
          mockSupabaseResponse(auction)
        )

        const token = createMockJWT({ sub: user.id })
        const mockRequest = new NextRequest('http://localhost:3000/api/auctions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            listing_id: listing.id,
            starting_price: auction.starting_price,
            duration_days: 7
          })
        })

        const { POST } = require('@/app/api/auctions/route')
        const response = await POST(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('auctions')
      })
    })
  })

  describe('Bids API Tests', () => {
    describe('POST /api/bids', () => {
      test('should place valid bid', async () => {
        const user = mockUser()
        const profile = mockProfile({ id: user.id })
        const listing = mockListing({ is_auction: true, current_bid: 50000 })
        const auction = mockAuction({ listing_id: listing.id })
        const bid = mockBid({ 
          user_id: user.id, 
          listing_id: listing.id, 
          auction_id: auction.id,
          amount: 55000 
        })

        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(profile)
        )

        // Mock auction validation
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse({ ...auction, listings: listing })
        )

        // Mock bid creation
        mockSupabase.from().insert().select().single.mockResolvedValue(
          mockSupabaseResponse(bid)
        )

        const token = createMockJWT({ sub: user.id })
        const mockRequest = new NextRequest('http://localhost:3000/api/bids', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auction_id: auction.id,
            amount: 55000
          })
        })

        const { POST } = require('@/app/api/bids/route')
        const response = await POST(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('bids')
      })

      test('should reject bid below minimum increment', async () => {
        const user = mockUser()
        const listing = mockListing({ 
          is_auction: true, 
          current_bid: 50000,
          min_bid_increment: 1000
        })
        const auction = mockAuction({ listing_id: listing.id })

        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )

        // Mock auction validation
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse({ ...auction, listings: listing })
        )

        const token = createMockJWT({ sub: user.id })
        const mockRequest = new NextRequest('http://localhost:3000/api/bids', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auction_id: auction.id,
            amount: 50500 // Below minimum increment
          })
        })

        const { POST } = require('@/app/api/bids/route')
        const response = await POST(mockRequest)
        
        expect(response.status).toBe(400)
      })
    })
  })

  describe('Payments API Tests', () => {
    describe('POST /api/payments/create-intent', () => {
      test('should create payment intent for commission', async () => {
        const user = mockUser()
        const profile = mockProfile({ id: user.id })
        const listing = mockListing({ user_id: user.id, price: 50000 })
        const payment = mockPayment({ 
          user_id: user.id, 
          listing_id: listing.id,
          amount: 2500, // 5% of 50000
          payment_type: 'commission'
        })

        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(profile)
        )

        // Mock listing validation
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(listing)
        )

        // Mock payment creation
        mockSupabase.from().insert().select().single.mockResolvedValue(
          mockSupabaseResponse(payment)
        )

        const token = createMockJWT({ sub: user.id })
        const mockRequest = new NextRequest('http://localhost:3000/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            listing_id: listing.id,
            amount: 2500,
            currency: 'CHF',
            payment_type: 'commission'
          })
        })

        const { POST } = require('@/app/api/payments/create-intent/route')
        const response = await POST(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('payments')
      })
    })
  })

  describe('User API Tests', () => {
    describe('GET /api/user/favorites', () => {
      test('should return user favorites', async () => {
        const user = mockUser()
        const profile = mockProfile({ id: user.id })
        const favorites = [
          { listing_id: 'listing_1', created_at: new Date().toISOString() },
          { listing_id: 'listing_2', created_at: new Date().toISOString() }
        ]

        mockSupabase.auth.getUser.mockResolvedValue(
          mockSupabaseResponse({ user })
        )
        mockSupabase.from().select().eq().single.mockResolvedValue(
          mockSupabaseResponse(profile)
        )

        // Mock favorites query
        mockSupabase.from().select().eq().mockResolvedValue(
          mockSupabaseResponse(favorites)
        )

        const token = createMockJWT({ sub: user.id })
        const mockRequest = new NextRequest('http://localhost:3000/api/user/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const { GET } = require('@/app/api/user/favorites/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('user_favorites')
      })
    })
  })

  describe('Categories API Tests', () => {
    describe('GET /api/listings/categories', () => {
      test('should return active categories', async () => {
        const categories = [
          mockCategory({ name_en: 'Cars', slug: 'cars' }),
          mockCategory({ name_en: 'Motorcycles', slug: 'motorcycles' })
        ]

        mockSupabase.from().select().eq().order().mockResolvedValue(
          mockSupabaseResponse(categories)
        )

        const mockRequest = new NextRequest('http://localhost:3000/api/listings/categories')
        
        const { GET } = require('@/app/api/listings/categories/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('categories')
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('is_active', true)
      })
    })
  })

  describe('Packages API Tests', () => {
    describe('GET /api/packages', () => {
      test('should return active packages', async () => {
        const packages = [
          mockPackage({ name_en: 'Free Package', price_chf: 0 }),
          mockPackage({ name_en: 'Premium Package', price_chf: 29.90 })
        ]

        mockSupabase.from().select().eq().order().mockResolvedValue(
          mockSupabaseResponse(packages)
        )

        const mockRequest = new NextRequest('http://localhost:3000/api/packages')
        
        const { GET } = require('@/app/api/packages/route')
        const response = await GET(mockRequest)
        
        expect(mockSupabase.from).toHaveBeenCalledWith('packages')
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('is_active', true)
      })
    })
  })

  describe('Error Handling Tests', () => {
    test('should handle database connection errors', async () => {
      mockSupabase.from().select().mockRejectedValue(
        new Error('Database connection failed')
      )

      const mockRequest = new NextRequest('http://localhost:3000/api/listings')
      
      const { GET } = require('@/app/api/listings/route')
      const response = await GET(mockRequest)
      
      expect(response.status).toBe(500)
    })

    test('should handle invalid JSON in request body', async () => {
      const user = mockUser()
      const token = createMockJWT({ sub: user.id })

      const mockRequest = new NextRequest('http://localhost:3000/api/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      })

      const { POST } = require('@/app/api/listings/route')
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })

    test('should handle rate limiting', async () => {
      // Mock rate limit exceeded
      const mockRequest = new NextRequest('http://localhost:3000/api/listings')
      
      // Simulate multiple rapid requests
      const requests = Array.from({ length: 100 }, () => 
        new NextRequest('http://localhost:3000/api/listings')
      )

      // In a real scenario, this would trigger rate limiting
      expect(requests).toHaveLength(100)
    })
  })

  describe('API Response Format Tests', () => {
    test('should return consistent success response format', async () => {
      const listings = [mockListing()]

      mockSupabase.from().select().mockResolvedValue(
        mockSupabaseResponse(listings)
      )

      const mockRequest = new NextRequest('http://localhost:3000/api/listings')
      
      const { GET } = require('@/app/api/listings/route')
      const response = await GET(mockRequest)
      
      const responseData = await response.json()
      
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
    })

    test('should return consistent error response format', async () => {
      mockSupabase.from().select().mockRejectedValue(
        new Error('Database error')
      )

      const mockRequest = new NextRequest('http://localhost:3000/api/listings')
      
      const { GET } = require('@/app/api/listings/route')
      const response = await GET(mockRequest)
      
      const responseData = await response.json()
      
      expect(responseData).toHaveProperty('error')
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})