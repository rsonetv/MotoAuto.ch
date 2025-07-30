// Environment setup for tests
require('dotenv').config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'

console.log('Test environment setup:')
console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
console.log('- Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

// Fallback values only if not set in .env.test
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://hqygljpxjpzcrxojftbh.supabase.co'
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWdsanB4anB6Y3J4b2pmdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4Mzc4NjQsImV4cCI6MjA2NzQxMzg2NH0.Hs8d2HDG3JW68awxm6FbLyjLNb1JDcWk3JSenxjfik8'
}
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123'
process.env.SMTP_HOST = 'localhost'
process.env.SMTP_PORT = '587'
process.env.SMTP_USER = 'test@example.com'
process.env.SMTP_PASS = 'test-password'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.EMAIL_PROVIDER = 'smtp'
process.env.SMTP_FROM = 'noreply@motoauto.ch'
process.env.SMTP_FROM_NAME = 'MotoAuto.ch Test'