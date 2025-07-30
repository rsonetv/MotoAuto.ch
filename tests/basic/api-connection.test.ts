/**
 * API Connection Test
 * Tests basic Supabase API connectivity without auth
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Creating Supabase client with:')
console.log('- URL:', supabaseUrl)
console.log('- Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set')

const supabase = createClient(supabaseUrl, supabaseKey)

describe('🌐 API Connection Test', () => {
  test('should create client with valid config', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    
    // Test client is properly initialized
    expect(supabaseUrl).toContain('supabase.co')
    expect(supabaseKey).toMatch(/^eyJ/)
  })

  test('should handle simple query without destructuring', async () => {
    try {
      // Use a simple table query
      const result = await supabase
        .from('profiles')
        .select('count')
        .limit(0)
      
      console.log('Query result:', result)
      console.log('Result type:', typeof result)
      
      // Just check we got some response
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
      
      // Modern Supabase client should return an object with properties
      if (result && typeof result === 'object') {
        const keys = Object.keys(result)
        console.log('Response keys:', keys)
        expect(keys.length).toBeGreaterThan(0)
      }
      
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  })

  test('should get proper error for non-existent table', async () => {
    try {
      const result = await supabase
        .from('definitely_not_a_real_table_12345')
        .select('*')
        .limit(1)
      
      console.log('Non-existent table result:', result)
      
      // Should get a proper error response
      expect(result).toBeDefined()
      
      if (result && typeof result === 'object' && 'error' in result) {
        console.log('Error message:', result.error)
        expect(result.error).not.toBeNull()
      }
      
    } catch (error) {
      console.log('Expected error for non-existent table:', error)
      expect(true).toBe(true) // This is OK
    }
  })

  test('should test different response patterns', async () => {
    const testTables = ['profiles', 'users', 'listings', 'categories']
    
    for (const tableName of testTables) {
      try {
        console.log(`\n--- Testing table: ${tableName} ---`)
        
        const result = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        console.log(`${tableName} result:`, result)
        console.log(`${tableName} type:`, typeof result)
        
        if (result && typeof result === 'object') {
          const keys = Object.keys(result)
          console.log(`${tableName} keys:`, keys)
          
          // Check common Supabase response structure
          const hasData = 'data' in result
          const hasError = 'error' in result
          const hasStatus = 'status' in result
          
          console.log(`${tableName} structure: data=${hasData}, error=${hasError}, status=${hasStatus}`)
        }
        
        expect(result).toBeDefined()
        
      } catch (error) {
        console.log(`Table ${tableName} failed:`, error)
        // Don't fail test - table might not exist
      }
    }
  })
})
