// Test Supabase connection with Deno
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hqygljpxjpzcrxojftbh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWdsanB4anB6Y3J4b2pmdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4Mzc4NjQsImV4cCI6MjA2NzQxMzg2NH0.Hs8d2HDG3JW68awxm6FbLyjLNb1JDcWk3JSenxjfik8'

console.log('🦕 Testing Supabase connection with Deno...')
console.log('URL:', supabaseUrl)
console.log('Key: ✓ Present')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n📡 Testing database connection...')
    
    // Test basic connection - try to get data from listings table
    const { data, error } = await supabase
      .from('listings')
      .select('id, title')
      .limit(5)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      console.error('Error details:', error)
      return
    }
    
    console.log('✅ Database connection successful!')
    console.log('Sample data from listings:', data)
    
    // Test auctions table
    const { data: auctionsData, error: auctionsError } = await supabase
      .from('auctions')
      .select('id, title, status')
      .limit(3)
    
    if (auctionsError) {
      console.log('❌ Auctions table error:', auctionsError.message)
    } else {
      console.log('✅ Auctions data:', auctionsData)
    }
    
    // Test bids table
    const { data: bidsData, error: bidsError } = await supabase
      .from('bids')
      .select('id, amount')
      .limit(3)
    
    if (bidsError) {
      console.log('❌ Bids table error:', bidsError.message)
    } else {
      console.log('✅ Bids data:', bidsData)
    }
    
    // Test authentication status
    const { data: user, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.log('⚠️  Auth error:', authError.message)
    } else {
      console.log('ℹ️  Auth status: No user logged in (normal for testing)')
    }
    
    // Test count functionality
    console.log('\n📊 Testing table counts...')
    const tables = ['listings', 'auctions', 'bids']
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`✅ Table '${table}': ${count || 0} records`)
        }
      } catch (e) {
        console.log(`❌ Table '${table}': ${e.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    console.error('Full error:', error)
  }
}

// Run the test
await testConnection()

console.log('\n🦕 Deno Supabase test completed!')
