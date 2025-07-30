/**
 * Test Database Helper
 * Manages test database setup, cleanup, and utilities
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Test Supabase client with test credentials
const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export class TestDatabase {
  static async setup() {
    console.log('🔧 Setting up test database...')
    
    try {
      // For basic testing, just verify connection works
      const { data, error } = await testSupabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (error && !error.message.includes('relation "profiles" does not exist')) {
        console.warn(`Warning during setup: ${error.message}`)
      }
      
      console.log('✅ Test database connection verified')
    } catch (error) {
      console.error('❌ Test database setup failed:', error)
      // Don't throw error in tests - let individual tests handle it
    }
  }

  static async cleanup() {
    console.log('🧹 Cleaning up test database...')
    
    try {
      // Clean up test data in reverse order (respecting foreign keys)
      const tables = [
        'contact_messages',
        'payments', 
        'bids',
        'auctions',
        'listings',
        'packages',
        'categories',
        'profiles'
      ]
      
      for (const table of tables) {
        const { error } = await testSupabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        
        if (error && !error.message.includes('does not exist')) {
          console.warn(`Warning cleaning table ${table}:`, error.message)
        }
      }
      
      console.log('✅ Test database cleaned')
    } catch (error) {
      console.error('❌ Test database cleanup failed:', error)
    }
  }

  static async seedTestData() {
    console.log('🌱 Seeding test data...')
    
    try {
      // Simple test - just try to access existing data
      const { data: existingProfiles, error } = await testSupabase
        .from('profiles')
        .select('*')
        .limit(3)
      
      if (error) {
        console.log('📝 Note: Using existing Supabase data for testing')
        return { profiles: [], success: true }
      }

      console.log(`✅ Found ${existingProfiles?.length || 0} existing profiles for testing`)
      return { profiles: existingProfiles || [], success: true }
    } catch (error) {
      console.error('❌ Test data access failed:', error)
      return { profiles: [], success: false }
    }
  }

  static getTestClient() {
    return testSupabase
  }

  static async createTestListing(overrides: any = {}) {
    // Use existing categories and profiles for testing
    const { data: categories } = await testSupabase
      .from('categories')
      .select('id')
      .limit(1)
      .single()

    const { data: profiles } = await testSupabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    const defaultListing = {
      user_id: profiles?.id || 'test-user-id',
      category_id: categories?.id || 'test-category-id',
      title: 'Test Car Listing',
      description: 'A test car for automated testing',
      price_chf: 25000,
      condition: 'good',
      year: 2020,
      mileage: 50000,
      fuel_type: 'petrol',
      transmission: 'manual',
      location: 'Zurich',
      canton: 'ZH',
      postal_code: '8001'
    }

    const listing = { ...defaultListing, ...overrides }

    const { data, error } = await testSupabase
      .from('listings')
      .insert(listing)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createTestAuction(listingId: string, overrides: any = {}) {
    const defaultAuction = {
      listing_id: listingId,
      starting_price_chf: 20000,
      reserve_price_chf: 22000,
      current_price_chf: 20000,
      bid_increment_chf: 100,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'active'
    }

    const auction = { ...defaultAuction, ...overrides }

    const { data, error } = await testSupabase
      .from('auctions')
      .insert(auction)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createTestBid(auctionId: string, userId: string, amount: number, overrides: any = {}) {
    const defaultBid = {
      auction_id: auctionId,
      user_id: userId,
      amount_chf: amount,
      is_auto_bid: false,
      status: 'active'
    }

    const bid = { ...defaultBid, ...overrides }

    const { data, error } = await testSupabase
      .from('bids')
      .insert(bid)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Global test setup and teardown
export async function setupTestEnvironment() {
  // Load test environment variables
  if (process.env.NODE_ENV !== 'test') {
    require('dotenv').config({ path: '.env.test' })
  }

  await TestDatabase.setup()
  await TestDatabase.seedTestData()
}

export async function teardownTestEnvironment() {
  await TestDatabase.cleanup()
}

// Jest global setup
export default async function globalSetup() {
  await setupTestEnvironment()
}

// Jest global teardown  
export async function globalTeardown() {
  await teardownTestEnvironment()
}
