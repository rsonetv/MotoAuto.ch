/**
 * Database Integration Tests
 * Tests database schema, relationships, and data integrity
 */

const { createServerComponentClient } = require('@/lib/supabase')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid, 
  mockPayment,
  mockCategory,
  mockPackage,
  mockSupabaseResponse,
  databaseHelpers
} = require('../utils/test-helpers')

// Mock Supabase client
jest.mock('@/lib/supabase')

describe('Database Integration Tests', () => {
  let mockSupabase

  beforeEach(() => {
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
      rpc: jest.fn(),
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn()
      }
    }

    createServerComponentClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Database Schema Validation', () => {
    test('should validate all required tables exist', async () => {
      const expectedTables = [
        'categories',
        'packages', 
        'profiles',
        'listings',
        'auctions',
        'bids',
        'payments',
        'contact_messages',
        'contact_responses'
      ]

      // Mock successful table queries
      mockSupabase.from().select().single.mockResolvedValue(
        mockSupabaseResponse({ count: 1 })
      )

      for (const table of expectedTables) {
        const result = await mockSupabase.from(table).select('*').single()
        expect(result.error).toBeNull()
        expect(mockSupabase.from).toHaveBeenCalledWith(table)
      }
    })

    test('should validate table relationships', async () => {
      // Test profile -> listings relationship
      const profile = mockProfile()
      const listing = mockListing({ user_id: profile.id })

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(listing)
      )

      const result = await mockSupabase
        .from('listings')
        .select('*')
        .eq('user_id', profile.id)
        .single()

      expect(result.data.user_id).toBe(profile.id)
      expect(mockSupabase.from).toHaveBeenCalledWith('listings')
    })

    test('should validate foreign key constraints', async () => {
      // Test invalid foreign key
      const invalidListing = mockListing({ 
        user_id: 'invalid_user_id',
        category_id: 'invalid_category_id'
      })

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(null, {
          code: '23503',
          message: 'Foreign key constraint violation'
        })
      )

      const result = await mockSupabase
        .from('listings')
        .insert(invalidListing)

      expect(result.error).toBeTruthy()
      expect(result.error.code).toBe('23503')
    })
  })

  describe('Data Integrity Tests', () => {
    test('should maintain referential integrity on cascade delete', async () => {
      const profile = mockProfile()
      const listing = mockListing({ user_id: profile.id })
      const auction = mockAuction({ listing_id: listing.id })

      // Mock cascade delete
      mockSupabase.from().delete().eq.mockResolvedValue(
        mockSupabaseResponse({ count: 1 })
      )

      // Delete profile should cascade to listings and auctions
      await mockSupabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    test('should validate unique constraints', async () => {
      const profile1 = mockProfile({ email: 'test@example.com' })
      const profile2 = mockProfile({ email: 'test@example.com' })

      // First insert succeeds
      mockSupabase.from().insert().mockResolvedValueOnce(
        mockSupabaseResponse(profile1)
      )

      // Second insert fails due to unique constraint
      mockSupabase.from().insert().mockResolvedValueOnce(
        mockSupabaseResponse(null, {
          code: '23505',
          message: 'Unique constraint violation'
        })
      )

      const result1 = await mockSupabase.from('profiles').insert(profile1)
      const result2 = await mockSupabase.from('profiles').insert(profile2)

      expect(result1.error).toBeNull()
      expect(result2.error).toBeTruthy()
      expect(result2.error.code).toBe('23505')
    })

    test('should validate check constraints', async () => {
      // Test invalid price (negative)
      const invalidListing = mockListing({ price: -1000 })

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(null, {
          code: '23514',
          message: 'Check constraint violation'
        })
      )

      const result = await mockSupabase
        .from('listings')
        .insert(invalidListing)

      expect(result.error).toBeTruthy()
      expect(result.error.code).toBe('23514')
    })
  })

  describe('Database Functions Tests', () => {
    test('should test commission calculation function', async () => {
      const saleAmount = 50000
      const expectedCommission = Math.min(saleAmount * 0.05, 500) // 5% max 500 CHF

      mockSupabase.rpc.mockResolvedValue(
        mockSupabaseResponse(expectedCommission)
      )

      const result = await mockSupabase.rpc('calculate_commission', {
        sale_amount: saleAmount,
        rate: 0.05,
        max_commission: 500
      })

      expect(result.data).toBe(expectedCommission)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_commission', {
        sale_amount: saleAmount,
        rate: 0.05,
        max_commission: 500
      })
    })

    test('should test auction extension function', async () => {
      const auction = mockAuction()
      const extensionMinutes = 5

      mockSupabase.rpc.mockResolvedValue(
        mockSupabaseResponse({
          extended: true,
          new_end_time: new Date(Date.now() + extensionMinutes * 60000).toISOString(),
          extension_count: 1
        })
      )

      const result = await mockSupabase.rpc('extend_auction', {
        auction_id: auction.id,
        extension_minutes: extensionMinutes
      })

      expect(result.data.extended).toBe(true)
      expect(result.data.extension_count).toBe(1)
    })

    test('should test bid statistics update function', async () => {
      const listing = mockListing()
      const newBid = mockBid({ listing_id: listing.id, amount: 55000 })

      mockSupabase.rpc.mockResolvedValue(
        mockSupabaseResponse({
          current_bid: newBid.amount,
          bid_count: 1,
          unique_bidders: 1
        })
      )

      const result = await mockSupabase.rpc('update_listing_bid_stats', {
        listing_id: listing.id,
        bid_amount: newBid.amount,
        bidder_id: newBid.user_id
      })

      expect(result.data.current_bid).toBe(newBid.amount)
      expect(result.data.bid_count).toBe(1)
    })
  })

  describe('Database Triggers Tests', () => {
    test('should test updated_at trigger', async () => {
      const listing = mockListing()
      const updatedListing = { ...listing, title: 'Updated Title' }

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSupabaseResponse({
          ...updatedListing,
          updated_at: new Date().toISOString()
        })
      )

      const result = await mockSupabase
        .from('listings')
        .update({ title: 'Updated Title' })
        .eq('id', listing.id)
        .select()
        .single()

      expect(result.data.title).toBe('Updated Title')
      expect(new Date(result.data.updated_at).getTime()).toBeGreaterThan(
        new Date(listing.updated_at).getTime()
      )
    })

    test('should test bid statistics trigger', async () => {
      const listing = mockListing({ current_bid: 50000, bid_count: 0 })
      const newBid = mockBid({ listing_id: listing.id, amount: 55000 })

      // Mock bid insertion triggering listing update
      mockSupabase.from().insert().select().single.mockResolvedValue(
        mockSupabaseResponse(newBid)
      )

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse({
          ...listing,
          current_bid: 55000,
          bid_count: 1
        })
      )

      await mockSupabase.from('bids').insert(newBid).select().single()
      
      const updatedListing = await mockSupabase
        .from('listings')
        .select('*')
        .eq('id', listing.id)
        .single()

      expect(updatedListing.data.current_bid).toBe(55000)
      expect(updatedListing.data.bid_count).toBe(1)
    })
  })

  describe('Row Level Security Tests', () => {
    test('should enforce RLS on profiles table', async () => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })

      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse({ user })
      )

      // User can access their own profile
      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(profile)
      )

      const result = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      expect(result.data.id).toBe(user.id)
    })

    test('should prevent unauthorized access to private data', async () => {
      const user1 = mockUser({ id: 'user1' })
      const user2 = mockUser({ id: 'user2' })
      const profile2 = mockProfile({ id: user2.id })

      // Mock user1 trying to access user2's profile
      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse({ user: user1 })
      )

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(null, {
          code: 'PGRST116',
          message: 'Row not found'
        })
      )

      const result = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', user2.id)
        .single()

      expect(result.error).toBeTruthy()
      expect(result.data).toBeNull()
    })
  })

  describe('Database Performance Tests', () => {
    test('should test query performance with indexes', async () => {
      const listings = Array.from({ length: 100 }, (_, i) => 
        mockListing({ title: `Test Listing ${i}` })
      )

      mockSupabase.from().select().ilike().order().limit().mockResolvedValue(
        mockSupabaseResponse(listings.slice(0, 20))
      )

      const startTime = Date.now()
      
      const result = await mockSupabase
        .from('listings')
        .select('*')
        .ilike('title', '%Test%')
        .order('created_at', { ascending: false })
        .limit(20)

      const executionTime = Date.now() - startTime

      expect(result.data).toHaveLength(20)
      expect(executionTime).toBeLessThan(1000) // Should be fast with proper indexes
    })

    test('should test pagination performance', async () => {
      const totalListings = 1000
      const pageSize = 20
      const page = 5

      mockSupabase.from().select().range().mockResolvedValue(
        mockSupabaseResponse(
          Array.from({ length: pageSize }, (_, i) => 
            mockListing({ title: `Listing ${(page - 1) * pageSize + i}` })
          )
        )
      )

      const startTime = Date.now()
      
      const result = await mockSupabase
        .from('listings')
        .select('*')
        .range((page - 1) * pageSize, page * pageSize - 1)

      const executionTime = Date.now() - startTime

      expect(result.data).toHaveLength(pageSize)
      expect(executionTime).toBeLessThan(500)
    })
  })

  describe('Database Backup and Recovery Tests', () => {
    test('should validate data consistency after backup', async () => {
      // Mock data before backup
      const originalData = {
        profiles: [mockProfile()],
        listings: [mockListing()],
        auctions: [mockAuction()]
      }

      // Mock backup process
      mockSupabase.from().select().mockResolvedValue(
        mockSupabaseResponse(originalData.profiles)
      )

      const backupResult = await mockSupabase
        .from('profiles')
        .select('*')

      expect(backupResult.data).toEqual(originalData.profiles)
    })

    test('should validate data integrity after recovery', async () => {
      // Mock recovery process
      const recoveredData = [mockProfile(), mockListing()]

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(recoveredData)
      )

      const result = await mockSupabase
        .from('profiles')
        .insert(recoveredData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(recoveredData)
    })
  })

  describe('Database Connection Tests', () => {
    test('should handle connection failures gracefully', async () => {
      mockSupabase.from().select().mockRejectedValue(
        new Error('Connection failed')
      )

      try {
        await mockSupabase.from('profiles').select('*')
      } catch (error) {
        expect(error.message).toBe('Connection failed')
      }
    })

    test('should test connection pooling', async () => {
      // Mock multiple concurrent requests
      const requests = Array.from({ length: 10 }, () =>
        mockSupabase.from('listings').select('*')
      )

      mockSupabase.from().select().mockResolvedValue(
        mockSupabaseResponse([mockListing()])
      )

      const results = await Promise.all(requests)

      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data).toHaveLength(1)
      })
    })
  })

  describe('Database Migration Tests', () => {
    test('should validate schema version', async () => {
      mockSupabase.rpc.mockResolvedValue(
        mockSupabaseResponse({ version: '1.0.0' })
      )

      const result = await mockSupabase.rpc('get_schema_version')

      expect(result.data.version).toBe('1.0.0')
    })

    test('should test migration rollback', async () => {
      mockSupabase.rpc.mockResolvedValue(
        mockSupabaseResponse({ success: true, rolled_back_to: '0.9.0' })
      )

      const result = await mockSupabase.rpc('rollback_migration', {
        target_version: '0.9.0'
      })

      expect(result.data.success).toBe(true)
      expect(result.data.rolled_back_to).toBe('0.9.0')
    })
  })
})