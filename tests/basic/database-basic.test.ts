/**
 * Simple Database Tests - Start Here!
 * These basic tests verify core database functionality
 */

import { TestDatabase } from '../helpers/test-database'

describe('🔧 Basic Database Tests', () => {
  beforeAll(async () => {
    await TestDatabase.setup()
    await TestDatabase.seedTestData()
  })

  afterAll(async () => {
    await TestDatabase.cleanup()
  })

  describe('Database Connection', () => {
    test('should connect to test database', async () => {
      const client = TestDatabase.getTestClient()
      
      const { data, error } = await client
        .from('profiles')
        .select('id')
        .limit(1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should have test data seeded', async () => {
      const client = TestDatabase.getTestClient()
      
      const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .limit(5)
      
      expect(error).toBeNull()
      expect(profiles).toBeDefined()
      expect(Array.isArray(profiles)).toBe(true)
      
      if (profiles && profiles.length > 0) {
        expect(profiles[0]).toHaveProperty('id')
        expect(profiles[0]).toHaveProperty('email')
      }
    })
  })

  describe('Test Helpers', () => {
    test('should create test listing', async () => {
      const listing = await TestDatabase.createTestListing({
        title: 'Test Helper Listing',
        price_chf: 30000
      })
      
      expect(listing).toBeDefined()
      expect(listing.title).toBe('Test Helper Listing')
      expect(listing.price_chf).toBe(30000)
      expect(listing.user_id).toBe('550e8400-e29b-41d4-a716-446655440001')
    })

    test('should create test auction', async () => {
      const listing = await TestDatabase.createTestListing()
      const auction = await TestDatabase.createTestAuction(listing.id, {
        starting_price_chf: 15000
      })
      
      expect(auction).toBeDefined()
      expect(auction.listing_id).toBe(listing.id)
      expect(auction.starting_price_chf).toBe(15000)
      expect(auction.status).toBe('active')
    })

    test('should create test bid', async () => {
      const listing = await TestDatabase.createTestListing()
      const auction = await TestDatabase.createTestAuction(listing.id)
      const bid = await TestDatabase.createTestBid(
        auction.id,
        '550e8400-e29b-41d4-a716-446655440002',
        21000
      )
      
      expect(bid).toBeDefined()
      expect(bid.auction_id).toBe(auction.id)
      expect(bid.user_id).toBe('550e8400-e29b-41d4-a716-446655440002')
      expect(bid.amount_chf).toBe(21000)
    })
  })

  describe('Basic CRUD Operations', () => {
    test('should insert, read, update, delete profiles', async () => {
      const client = TestDatabase.getTestClient()
      
      // Create
      const { data: newProfile, error: insertError } = await client
        .from('profiles')
        .insert({
          email: 'crud-test@example.com',
          full_name: 'CRUD Test User'
        })
        .select()
        .single()
      
      expect(insertError).toBeNull()
      expect(newProfile.email).toBe('crud-test@example.com')
      
      // Read
      const { data: readProfile, error: readError } = await client
        .from('profiles')
        .select('*')
        .eq('id', newProfile.id)
        .single()
      
      expect(readError).toBeNull()
      expect(readProfile.full_name).toBe('CRUD Test User')
      
      // Update
      const { data: updatedProfile, error: updateError } = await client
        .from('profiles')
        .update({ full_name: 'Updated CRUD User' })
        .eq('id', newProfile.id)
        .select()
        .single()
      
      expect(updateError).toBeNull()
      expect(updatedProfile.full_name).toBe('Updated CRUD User')
      
      // Delete
      const { error: deleteError } = await client
        .from('profiles')
        .delete()
        .eq('id', newProfile.id)
      
      expect(deleteError).toBeNull()
      
      // Verify deletion
      const { data: deletedProfile, error: verifyError } = await client
        .from('profiles')
        .select('*')
        .eq('id', newProfile.id)
        .single()
      
      expect(verifyError).toBeTruthy() // Should error because record doesn't exist
      expect(deletedProfile).toBeNull()
    })
  })
})
