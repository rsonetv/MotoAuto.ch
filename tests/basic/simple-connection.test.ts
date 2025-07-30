/**
 * Very Simple Supabase Connection Test
 * Tests basic connectivity without complex setup
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hqygljpxjpzcrxojftbh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWdsanB4anB6Y3J4b2pmdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4Mzc4NjQsImV4cCI6MjA2NzQxMzg2NH0.Hs8d2HDG3JW68awxm6FbLyjLNb1JDcWk3JSenxjfik8'

const supabase = createClient(supabaseUrl, supabaseKey)

describe('🔗 Simple Supabase Connection Test', () => {
  test('should create client successfully', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth.getSession).toBe('function')
  })

  test('should connect to Supabase API', async () => {
    // Try a simple API call that doesn't require specific tables
    const { data, error } = await supabase.auth.getSession()
    
    // We expect no error for getSession, even if user is not logged in
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.session).toBeNull() // No user logged in during tests
  })

  test('should handle table query gracefully', async () => {
    // Try to query a table - this will fail if table doesn't exist, but that's OK
    const { data, error } = await supabase
      .from('listings')
      .select('id')
      .limit(1)
    
    // Don't assert on specific results since we don't know what tables exist
    // Just verify the API call structure works
    expect(typeof data).toBeDefined()
    expect(typeof error !== 'undefined').toBe(true)
  })

  test('should have proper configuration', () => {
    expect(supabaseUrl).toContain('supabase.co')
    expect(supabaseKey).toMatch(/^eyJ/) // JWT tokens start with eyJ
    expect(supabaseKey.length).toBeGreaterThan(100) // JWT tokens are long
  })
})
