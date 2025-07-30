/**
 * Test Environment Setup Script
 * Prepares the test environment and validates configuration
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Setting up test environment...')

// 1. Check if .env.test exists
const envTestPath = path.join(__dirname, '..', '.env.test')
if (!fs.existsSync(envTestPath)) {
  console.error('❌ .env.test file not found! Please create it with test configuration.')
  process.exit(1)
}

// 2. Load test environment variables
require('dotenv').config({ path: envTestPath })

// 3. Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '))
  process.exit(1)
}

// 4. Check if Docker is available (optional)
try {
  execSync('docker --version', { stdio: 'ignore' })
  console.log('✅ Docker is available')
  
  try {
    execSync('docker-compose --version', { stdio: 'ignore' })
    console.log('✅ Docker Compose is available')
  } catch (error) {
    console.log('⚠️  Docker Compose not found, using docker compose instead')
  }
} catch (error) {
  console.log('⚠️  Docker not found - you can still run tests without Docker')
}

// 5. Check if test database script exists
const dbSetupPath = path.join(__dirname, 'setup-test-database.sql')
if (!fs.existsSync(dbSetupPath)) {
  console.error('❌ Test database setup script not found at:', dbSetupPath)
  process.exit(1)
}

// 6. Create test helpers directory if it doesn't exist
const testHelpersDir = path.join(__dirname, '..', 'tests', 'helpers')
if (!fs.existsSync(testHelpersDir)) {
  fs.mkdirSync(testHelpersDir, { recursive: true })
  console.log('📁 Created tests/helpers directory')
}

// 7. Create basic test directory if it doesn't exist
const basicTestsDir = path.join(__dirname, '..', 'tests', 'basic')
if (!fs.existsSync(basicTestsDir)) {
  fs.mkdirSync(basicTestsDir, { recursive: true })
  console.log('📁 Created tests/basic directory')
}

// 8. Validate Jest configuration
const jestConfigPath = path.join(__dirname, '..', 'jest.config.js')
if (!fs.existsSync(jestConfigPath)) {
  console.error('❌ Jest configuration not found at:', jestConfigPath)
  process.exit(1)
}

console.log('✅ Test environment setup completed!')
console.log('')
console.log('🚀 Available test commands:')
console.log('  npm run test:basic      - Run basic database tests')
console.log('  npm run test:integration - Run integration tests')
console.log('  npm run test:docker     - Run tests in Docker environment')
console.log('  npm run docker:test:up  - Start test services with Docker')
console.log('')
console.log('📖 Test services:')
console.log('  Database: PostgreSQL on port 5433')
console.log('  Redis: Redis on port 6380')
console.log('  Email: MailHog UI on http://localhost:8025')
console.log('')
console.log('💡 Next steps:')
console.log('  1. Start Docker services: npm run docker:test:up')
console.log('  2. Run basic tests: npm run test:basic')
console.log('  3. View test coverage: npm run test:coverage')
