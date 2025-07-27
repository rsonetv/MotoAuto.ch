# MotoAuto.ch Testing Documentation

## Overview

This document provides comprehensive information about the testing framework and strategies implemented for the MotoAuto.ch platform - a Swiss automotive marketplace built with Next.js, TypeScript, Supabase, and Stripe.

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Test Categories](#test-categories)
3. [Setup and Configuration](#setup-and-configuration)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)

## Testing Architecture

### Technology Stack

- **Testing Framework**: Jest 29.x
- **API Testing**: Supertest
- **Component Testing**: React Testing Library
- **Mocking**: Jest mocks with MSW (Mock Service Worker)
- **Coverage**: Istanbul/NYC
- **CI/CD**: GitHub Actions

### Directory Structure

```
tests/
├── setup.js                    # Global test setup
├── env.setup.js               # Environment configuration
├── utils/
│   └── test-helpers.js        # Shared utilities and mocks
├── integration/
│   ├── database.test.js       # Database integration tests
│   ├── api-endpoints.test.js  # API endpoint tests
│   ├── auth-security.test.js  # Authentication & security
│   ├── payment-stripe.test.js # Stripe payment integration
│   ├── websocket-realtime.test.js # WebSocket & real-time
│   ├── email-system.test.js   # Email queue & delivery
│   ├── swiss-compliance.test.js # Swiss market compliance
│   ├── multilingual-support.test.js # i18n & localization
│   └── e2e-workflows.test.js  # End-to-end workflows
├── performance/
│   └── load-tests.test.js     # Performance & load testing
├── security/
│   └── security-validation.test.js # Security validation
└── reports/                   # Test reports and coverage
```

## Test Categories

### 1. Database Integration Tests

**File**: [`tests/integration/database.test.js`](../tests/integration/database.test.js)

Tests the Supabase PostgreSQL database integration including:

- **Schema Validation**: Table structure, constraints, indexes
- **Data Relationships**: Foreign keys, cascading deletes
- **Row Level Security (RLS)**: Policy enforcement
- **Database Functions**: Custom PostgreSQL functions
- **Triggers**: Automated data processing
- **Performance**: Query optimization and indexing

**Key Test Areas**:
- User profiles and authentication
- Vehicle listings and categories
- Auction system and bidding
- Payment processing records
- Email logs and notifications

### 2. API Endpoint Tests

**File**: [`tests/integration/api-endpoints.test.js`](../tests/integration/api-endpoints.test.js)

Comprehensive testing of REST API endpoints:

- **Listings API**: CRUD operations, search, filtering
- **Auctions API**: Auction management, bidding system
- **User Management**: Profile operations, favorites
- **Categories**: Vehicle categories and subcategories
- **Authentication**: Login, registration, token validation

**Test Coverage**:
- Request/response validation
- Error handling and status codes
- Authentication and authorization
- Input sanitization
- Rate limiting

### 3. Authentication & Security Tests

**File**: [`tests/integration/auth-security.test.js`](../tests/integration/auth-security.test.js)

Security-focused testing including:

- **JWT Token Management**: Generation, validation, expiration
- **User Authentication**: Login flows, password security
- **Authorization**: Role-based access control
- **Session Management**: Secure session handling
- **Input Validation**: XSS and injection prevention
- **Rate Limiting**: Brute force protection

### 4. Payment Integration Tests

**File**: [`tests/integration/payment-stripe.test.js`](../tests/integration/payment-stripe.test.js)

Stripe payment system testing:

- **Payment Intents**: Creation, confirmation, failure handling
- **Swiss Payment Methods**: TWINT, PostFinance, bank transfers
- **Webhooks**: Event processing and validation
- **Refunds**: Partial and full refund processing
- **Currency Handling**: CHF-specific formatting
- **Commission Calculation**: Swiss market commission cap

### 5. WebSocket & Real-time Tests

**File**: [`tests/integration/websocket-realtime.test.js`](../tests/integration/websocket-realtime.test.js)

Real-time functionality testing:

- **WebSocket Connections**: Connection management
- **Auction Rooms**: Live bidding updates
- **Real-time Notifications**: User alerts and updates
- **Connection Handling**: Reconnection and error recovery
- **Performance**: High-frequency message handling

### 6. Email System Tests

**File**: [`tests/integration/email-system.test.js`](../tests/integration/email-system.test.js)

Email delivery and queue management:

- **Email Queue**: Bull/Redis queue processing
- **Template Rendering**: Multilingual email templates
- **Delivery Tracking**: Open rates, bounce handling
- **Notification Workflows**: Auction alerts, payment confirmations
- **SMTP Configuration**: Email service integration

### 7. Swiss Market Compliance Tests

**File**: [`tests/integration/swiss-compliance.test.js`](../tests/integration/swiss-compliance.test.js)

Swiss-specific business rules and compliance:

- **Currency Formatting**: CHF with Swiss formatting
- **VAT Calculations**: 7.7% Swiss VAT
- **Address Validation**: Swiss postal codes, phone numbers
- **Payment Methods**: Swiss-specific payment options
- **Legal Compliance**: Swiss consumer protection laws
- **Commission Cap**: CHF 500 maximum commission

### 8. Multilingual Support Tests

**File**: [`tests/integration/multilingual-support.test.js`](../tests/integration/multilingual-support.test.js)

Internationalization and localization:

- **Language Detection**: Browser language preferences
- **Translation System**: i18n implementation
- **Content Localization**: Date, number, currency formatting
- **SEO**: Multilingual URLs and meta tags
- **Email Localization**: Language-specific templates

### 9. End-to-End Workflow Tests

**File**: [`tests/integration/e2e-workflows.test.js`](../tests/integration/e2e-workflows.test.js)

Complete user journey testing:

- **User Registration**: Full onboarding process
- **Listing Creation**: From draft to publication
- **Auction Participation**: Bidding and winning process
- **Payment Processing**: Complete payment workflow
- **Dispute Resolution**: Customer support workflows

### 10. Performance & Load Tests

**File**: [`tests/performance/load-tests.test.js`](../tests/performance/load-tests.test.js)

System performance and scalability:

- **Concurrent Requests**: High-load API testing
- **Database Performance**: Query optimization
- **Memory Management**: Resource usage monitoring
- **Caching Performance**: Cache hit/miss ratios
- **Scalability**: Performance under increasing load

### 11. Security Validation Tests

**File**: [`tests/security/security-validation.test.js`](../tests/security/security-validation.test.js)

Comprehensive security testing:

- **Input Validation**: SQL injection, XSS prevention
- **Authentication Security**: Brute force protection
- **Data Protection**: Encryption, anonymization
- **Network Security**: CSRF, rate limiting
- **Compliance**: GDPR, Swiss data protection

## Setup and Configuration

### Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Environment variables
cp .env.example .env.test
```

### Installation

```bash
# Install dependencies
npm install

# Install test-specific dependencies
npm install --save-dev jest supertest @testing-library/react @testing-library/jest-dom
```

### Configuration Files

#### Jest Configuration

**File**: [`jest.config.js`](../jest.config.js)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts}',
    'components/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

#### Test Environment Setup

**File**: [`tests/env.setup.js`](../tests/env.setup.js)

```javascript
// Test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_...'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_...'
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/integration/database.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should handle user registration"
```

### Test Categories

```bash
# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Security tests
npm run test:security

# End-to-end tests
npm run test:e2e
```

### Environment-Specific Testing

```bash
# Development environment
npm run test:dev

# Staging environment
npm run test:staging

# Production-like testing
npm run test:prod
```

## Test Coverage

### Coverage Reports

Test coverage is automatically generated and includes:

- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of code branches taken
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

### Coverage Thresholds

Minimum coverage requirements:
- **Lines**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Statements**: 80%

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Exclusions

Files excluded from coverage:
- Type definition files (`.d.ts`)
- Configuration files
- Test files themselves
- Third-party integrations
- Development utilities

## Best Practices

### Test Structure

1. **Arrange-Act-Assert Pattern**
   ```javascript
   test('should create user profile', async () => {
     // Arrange
     const userData = { name: 'John Doe', email: 'john@example.com' }
     
     // Act
     const result = await createUser(userData)
     
     // Assert
     expect(result.id).toBeDefined()
     expect(result.email).toBe(userData.email)
   })
   ```

2. **Descriptive Test Names**
   ```javascript
   // Good
   test('should return 401 when accessing protected route without authentication')
   
   // Bad
   test('auth test')
   ```

3. **Test Isolation**
   - Each test should be independent
   - Use `beforeEach` and `afterEach` for setup/cleanup
   - Mock external dependencies

### Mocking Guidelines

1. **Mock External Services**
   ```javascript
   // Mock Supabase
   jest.mock('@/lib/supabase', () => ({
     createServerComponentClient: () => mockSupabase
   }))
   ```

2. **Use Test Helpers**
   ```javascript
   const { mockUser, mockListing } = require('../utils/test-helpers')
   
   const user = mockUser({ role: 'admin' })
   const listing = mockListing({ price: 45000 })
   ```

3. **Mock Consistently**
   - Use the same mocking patterns across tests
   - Keep mocks simple and focused
   - Reset mocks between tests

### Data Management

1. **Use Factory Functions**
   ```javascript
   const mockUser = (overrides = {}) => ({
     id: 'user_123',
     email: 'test@example.com',
     role: 'user',
     ...overrides
   })
   ```

2. **Swiss-Specific Test Data**
   ```javascript
   const swissTestData = {
     postalCode: '8001',
     phoneNumber: '+41 79 123 45 67',
     vatNumber: 'CHE-123.456.789'
   }
   ```

### Performance Testing

1. **Set Realistic Thresholds**
   ```javascript
   expect(responseTime).toBeLessThan(500) // 500ms max
   expect(memoryUsage).toBeLessThan(100 * 1024 * 1024) // 100MB max
   ```

2. **Test Concurrent Scenarios**
   ```javascript
   const requests = Array.from({ length: 100 }, () => makeRequest())
   const results = await Promise.all(requests)
   ```

### Security Testing

1. **Test Input Validation**
   ```javascript
   const maliciousInputs = [
     '<script>alert("xss")</script>',
     "'; DROP TABLE users; --",
     '../../../etc/passwd'
   ]
   ```

2. **Verify Authentication**
   ```javascript
   // Test without authentication
   const response = await request(app).get('/api/admin')
   expect(response.status).toBe(401)
   ```

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   ```javascript
   // Increase timeout for slow tests
   test('slow operation', async () => {
     // test code
   }, 10000) // 10 second timeout
   ```

2. **Mock Issues**
   ```javascript
   // Clear mocks between tests
   afterEach(() => {
     jest.clearAllMocks()
     jest.resetModules()
   })
   ```

3. **Environment Variables**
   ```javascript
   // Ensure test environment is set
   beforeAll(() => {
     process.env.NODE_ENV = 'test'
   })
   ```

### Debugging Tests

1. **Use Console Logging**
   ```javascript
   console.log('Test data:', testData)
   console.log('Response:', response.body)
   ```

2. **Debug Mode**
   ```bash
   # Run tests in debug mode
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

3. **Isolate Failing Tests**
   ```javascript
   // Use .only to run specific test
   test.only('failing test', () => {
     // test code
   })
   ```

### Performance Issues

1. **Parallel Execution**
   ```bash
   # Run tests in parallel
   npm test -- --maxWorkers=4
   ```

2. **Test Optimization**
   ```javascript
   // Use beforeAll for expensive setup
   beforeAll(async () => {
     await setupDatabase()
   })
   ```

## Contributing

### Adding New Tests

1. **Follow Naming Conventions**
   - Use descriptive file names
   - Group related tests in describe blocks
   - Use clear test descriptions

2. **Update Documentation**
   - Add new test categories to this document
   - Update coverage requirements if needed
   - Document any new testing utilities

3. **Code Review Checklist**
   - [ ] Tests are isolated and independent
   - [ ] Mocks are properly configured
   - [ ] Error cases are tested
   - [ ] Performance implications considered
   - [ ] Security aspects covered

### Test Maintenance

1. **Regular Updates**
   - Keep test dependencies updated
   - Review and update test data
   - Maintain mock accuracy

2. **Performance Monitoring**
   - Monitor test execution times
   - Optimize slow tests
   - Review coverage reports

3. **Documentation Updates**
   - Keep this document current
   - Update examples and code snippets
   - Document new testing patterns

## Continuous Integration

### GitHub Actions

The project uses GitHub Actions for automated testing:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Quality Gates

- All tests must pass
- Coverage thresholds must be met
- Security tests must pass
- Performance benchmarks must be maintained

## Conclusion

This comprehensive testing framework ensures the reliability, security, and performance of the MotoAuto.ch platform. The multi-layered approach covers everything from unit tests to end-to-end workflows, with special attention to Swiss market requirements and compliance.

For questions or contributions, please refer to the project's contribution guidelines or contact the development team.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainers**: MotoAuto.ch Development Team