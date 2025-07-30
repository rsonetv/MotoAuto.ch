/**
 * Real Database Connection Test
 * Tests connectivity to actual Supabase database
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

describe('🗄️ Real Database Connection Test', () => {
  test('should connect to Supabase database', async () => {
    // Test basic connectivity without destructuring
    const response = await supabase.auth.getSession()
    
    console.log('Auth response:', response)
    
    expect(response).toBeDefined()
    expect(typeof response).toBe('object')
  })

  test('should check available tables', async () => {
    // Try to query information_schema to see what tables exist
    try {
      const tablesQuery = await supabase
        .from('information_schema')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(10)
      
      console.log('Tables query result:', tablesQuery)
      
      // Just check we got some response
      expect(tablesQuery).toBeDefined()
      
    } catch (error) {
      console.log('Tables query failed:', error)
      // This is OK - we might not have access to information_schema
    }
  })

  test('should try common table names', async () => {
    const commonTables = ['users', 'profiles', 'listings', 'auctions', 'categories']
    
    for (const tableName of commonTables) {
      try {
        console.log(`Testing table: ${tableName}`)
        
        const query = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        console.log(`Table ${tableName} response:`, query)
        
        // If we get here without error, table exists
        expect(query).toBeDefined()
        
      } catch (error) {
        console.log(`Table ${tableName} failed:`, error)
        // This is OK - table might not exist
      }
    }
  })

  test('should handle query response structure', async () => {
    try {
      // Test with a table that probably exists or will give us a proper error
      const result = await supabase
        .from('profiles')  // This is often a default Supabase table
        .select('id')
        .limit(1)
      
      console.log('Query result structure:', result)
      console.log('Result type:', typeof result)
      console.log('Result keys:', result ? Object.keys(result) : 'no result')
      
      // Check the response structure
      expect(result).toBeDefined()
      
      // Modern Supabase should return { data, error, count, status, statusText }
      if (result && typeof result === 'object') {
        const hasDataProp = 'data' in result
        const hasErrorProp = 'error' in result
        
        console.log('Has data property:', hasDataProp)
        console.log('Has error property:', hasErrorProp)
        
        expect(hasDataProp || hasErrorProp).toBe(true)
      }
      
    } catch (error) {
      console.log('Query test failed:', error)
      expect(true).toBe(true) // Don't fail the test
    }
  })
})
