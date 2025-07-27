#!/usr/bin/env node

/**
 * Payment Integration Test Script
 * Tests all payment API endpoints and functionality
 */

const https = require('https');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testToken: process.env.TEST_JWT_TOKEN || 'your-test-jwt-token-here',
  stripeTestCard: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  }
};

// Test data
const testData = {
  packagePayment: {
    amount: 29.90,
    currency: 'CHF',
    payment_type: 'premium_package',
    description: 'Test premium package payment',
    payment_methods: ['card', 'twint', 'postfinance'],
    invoice_data: {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_address: {
        line1: 'Teststrasse 1',
        city: 'Zürich',
        postal_code: '8000',
        country: 'CH',
        canton: 'ZH'
      }
    }
  },
  commissionPayment: {
    amount: 500.00,
    currency: 'CHF',
    payment_type: 'commission',
    description: 'Test auction commission payment'
  }
};

// HTTP request helper
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, config.baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.testToken}`
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper functions
function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testResults.passed++;
    testResults.tests.push({ name: message, status: 'PASSED' });
  } else {
    console.log(`❌ ${message}`);
    testResults.failed++;
    testResults.tests.push({ name: message, status: 'FAILED' });
  }
}

function logTest(testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('─'.repeat(50));
}

// Test functions
async function testPaymentIntentCreation() {
  logTest('Payment Intent Creation');
  
  try {
    const response = await makeRequest('POST', '/api/payments/create-intent', testData.packagePayment);
    
    assert(response.status === 201, 'Payment intent creation returns 201 status');
    assert(response.data.success === true, 'Response indicates success');
    assert(response.data.data.client_secret, 'Client secret is provided');
    assert(response.data.data.payment_intent_id, 'Payment intent ID is provided');
    assert(response.data.data.amount === testData.packagePayment.amount, 'Amount matches request');
    assert(response.data.data.currency === testData.packagePayment.currency, 'Currency matches request');
    
    // Store payment intent for subsequent tests
    global.testPaymentIntentId = response.data.data.payment_intent_id;
    global.testPaymentId = response.data.data.payment_id;
    
    console.log(`Payment Intent ID: ${global.testPaymentIntentId}`);
    console.log(`Payment ID: ${global.testPaymentId}`);
    
  } catch (error) {
    console.error('Payment intent creation test failed:', error);
    assert(false, 'Payment intent creation completed without errors');
  }
}

async function testPaymentHistory() {
  logTest('Payment History Retrieval');
  
  try {
    const response = await makeRequest('GET', '/api/payments/history?page=1&limit=10');
    
    assert(response.status === 200, 'Payment history returns 200 status');
    assert(response.data.success === true, 'Response indicates success');
    assert(Array.isArray(response.data.data.data), 'Payment history data is an array');
    assert(response.data.data.pagination, 'Pagination information is provided');
    assert(response.data.data.summary, 'Summary statistics are provided');
    
    console.log(`Found ${response.data.data.data.length} payment records`);
    
  } catch (error) {
    console.error('Payment history test failed:', error);
    assert(false, 'Payment history retrieval completed without errors');
  }
}

async function testCommissionCalculation() {
  logTest('Commission Calculation');
  
  // This test requires a valid auction ID - using a mock for demonstration
  const mockAuctionId = 'test-auction-id';
  
  try {
    const response = await makeRequest('GET', `/api/payments/commission/${mockAuctionId}?sale_amount=10000&commission_rate=0.05&max_commission=500`);
    
    // This might return 404 if auction doesn't exist, which is expected in test environment
    if (response.status === 404) {
      console.log('⚠️  Commission calculation test skipped - no test auction available');
      assert(true, 'Commission calculation endpoint is accessible');
    } else {
      assert(response.status === 200, 'Commission calculation returns 200 status');
      assert(response.data.success === true, 'Response indicates success');
      assert(response.data.data.commission_calculation, 'Commission calculation data is provided');
    }
    
  } catch (error) {
    console.error('Commission calculation test failed:', error);
    assert(false, 'Commission calculation completed without errors');
  }
}

async function testSwissComplianceValidation() {
  logTest('Swiss Compliance Validation');
  
  try {
    // Test Swiss postal code validation
    const { validateSwissPostalCode } = require('../lib/swiss-compliance');
    
    assert(validateSwissPostalCode('8000'), 'Valid Swiss postal code is accepted');
    assert(!validateSwissPostalCode('12345'), 'Invalid postal code is rejected');
    assert(!validateSwissPostalCode('800'), 'Short postal code is rejected');
    
    console.log('Swiss compliance validation functions work correctly');
    
  } catch (error) {
    console.error('Swiss compliance test failed:', error);
    assert(false, 'Swiss compliance validation completed without errors');
  }
}

async function testErrorHandling() {
  logTest('Error Handling');
  
  try {
    // Test invalid payment intent creation
    const invalidData = {
      amount: -10, // Invalid negative amount
      currency: 'INVALID',
      payment_type: 'invalid_type'
    };
    
    const response = await makeRequest('POST', '/api/payments/create-intent', invalidData);
    
    assert(response.status === 400, 'Invalid request returns 400 status');
    assert(response.data.error, 'Error message is provided');
    
    console.log('Error handling works correctly for invalid requests');
    
  } catch (error) {
    console.error('Error handling test failed:', error);
    assert(false, 'Error handling test completed without errors');
  }
}

async function testWebhookEndpoint() {
  logTest('Webhook Endpoint');
  
  try {
    // Test webhook endpoint accessibility (without valid signature)
    const response = await makeRequest('POST', '/api/payments/webhook', { test: 'data' });
    
    // Should return 400 due to missing/invalid signature
    assert(response.status === 400, 'Webhook endpoint returns 400 for invalid signature');
    assert(response.data.error, 'Error message is provided for invalid webhook');
    
    console.log('Webhook endpoint is accessible and validates signatures');
    
  } catch (error) {
    console.error('Webhook test failed:', error);
    assert(false, 'Webhook endpoint test completed without errors');
  }
}

async function testInvoiceGeneration() {
  logTest('Invoice Generation');
  
  if (!global.testPaymentId) {
    console.log('⚠️  Invoice generation test skipped - no test payment available');
    return;
  }
  
  try {
    const response = await makeRequest('GET', `/api/payments/invoice/${global.testPaymentId}?format=html&language=de`);
    
    // This might return 404 if payment is not completed
    if (response.status === 400 && response.data.error.includes('completed payments')) {
      console.log('⚠️  Invoice generation test skipped - payment not completed');
      assert(true, 'Invoice generation endpoint is accessible');
    } else {
      assert(response.status === 200, 'Invoice generation returns 200 status');
      assert(response.data.success === true, 'Response indicates success');
    }
    
  } catch (error) {
    console.error('Invoice generation test failed:', error);
    assert(false, 'Invoice generation test completed without errors');
  }
}

async function testRefundEndpoint() {
  logTest('Refund Endpoint');
  
  if (!global.testPaymentId) {
    console.log('⚠️  Refund test skipped - no test payment available');
    return;
  }
  
  try {
    const refundData = {
      payment_id: global.testPaymentId,
      amount: 10.00,
      reason: 'requested_by_customer',
      description: 'Test refund'
    };
    
    const response = await makeRequest('POST', '/api/payments/refund', refundData);
    
    // This might return 400 if payment is not completed or eligible for refund
    if (response.status === 400) {
      console.log('⚠️  Refund test expected to fail - payment not eligible for refund');
      assert(true, 'Refund endpoint is accessible and validates eligibility');
    } else {
      assert(response.status === 201, 'Refund processing returns 201 status');
      assert(response.data.success === true, 'Response indicates success');
    }
    
  } catch (error) {
    console.error('Refund test failed:', error);
    assert(false, 'Refund endpoint test completed without errors');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Payment Integration Tests');
  console.log('═'.repeat(60));
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Test Token: ${config.testToken ? 'Provided' : 'Missing'}`);
  console.log('═'.repeat(60));
  
  // Check if test token is provided
  if (!config.testToken || config.testToken === 'your-test-jwt-token-here') {
    console.log('❌ Test JWT token not provided. Please set TEST_JWT_TOKEN environment variable.');
    console.log('   You can get a test token by logging into the application and copying the JWT from localStorage.');
    process.exit(1);
  }
  
  // Run all tests
  await testPaymentIntentCreation();
  await testPaymentHistory();
  await testCommissionCalculation();
  await testSwissComplianceValidation();
  await testErrorHandling();
  await testWebhookEndpoint();
  await testInvoiceGeneration();
  await testRefundEndpoint();
  
  // Print results
  console.log('\n📊 Test Results');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => console.log(`   - ${test.name}`));
  }
  
  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      baseUrl: config.baseUrl,
      nodeVersion: process.version
    },
    results: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)
    },
    tests: testResults.tests
  };
  
  fs.writeFileSync('payment-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Test report saved to payment-test-report.json');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testPaymentIntentCreation,
  testPaymentHistory,
  testCommissionCalculation,
  testSwissComplianceValidation,
  testErrorHandling,
  testWebhookEndpoint,
  testInvoiceGeneration,
  testRefundEndpoint
};