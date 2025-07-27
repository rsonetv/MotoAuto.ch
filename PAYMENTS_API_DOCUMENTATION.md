# MotoAuto.ch Payment API Documentation

This document provides comprehensive documentation for the MotoAuto.ch payment system, including API endpoints, Swiss market compliance features, and integration guidelines.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Swiss Market Compliance](#swiss-market-compliance)
5. [Error Handling](#error-handling)
6. [Webhooks](#webhooks)
7. [Testing](#testing)
8. [Security](#security)

## Overview

The MotoAuto.ch payment system is built with Stripe integration and Swiss market compliance in mind. It supports:

- **Multiple Payment Methods**: Credit cards, TWINT, PostFinance, SEPA
- **Multi-currency Support**: CHF (primary), EUR, USD
- **Swiss VAT Handling**: 7.7% VAT calculation and compliance
- **Commission Processing**: 5% seller commission (max 500 CHF)
- **Invoice Generation**: Swiss-compliant invoices in multiple languages
- **Refund Processing**: Full and partial refunds with service deactivation

## Authentication

All payment API endpoints require authentication using Bearer tokens:

```http
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Create Payment Intent

**POST** `/api/payments/create-intent`

Creates a Stripe payment intent for packages and commissions.

#### Request Body

```json
{
  "amount": 29.90,
  "currency": "CHF",
  "payment_type": "premium_package",
  "package_id": "uuid-here",
  "description": "Premium listing package",
  "payment_methods": ["card", "twint", "postfinance"],
  "automatic_payment_methods": {
    "enabled": true,
    "allow_redirects": "always"
  },
  "invoice_data": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_address": {
      "line1": "Musterstrasse 1",
      "city": "Zürich",
      "postal_code": "8000",
      "country": "CH",
      "canton": "ZH"
    }
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "payment_id": "uuid-here",
    "client_secret": "pi_xxx_secret_xxx",
    "payment_intent_id": "pi_xxx",
    "amount": 29.90,
    "currency": "CHF",
    "status": "requires_payment_method",
    "payment_method_types": ["card", "twint", "postfinance"],
    "commission_info": {
      "commission_rate": 0.05,
      "commission_amount": 1.50,
      "max_commission": 500.00
    }
  }
}
```

### 2. Confirm Payment

**POST** `/api/payments/confirm`

Confirms a payment intent and activates services.

#### Request Body

```json
{
  "payment_intent_id": "pi_xxx",
  "payment_method_id": "pm_xxx",
  "return_url": "https://motoauto.ch/payment/success",
  "receipt_email": "customer@example.com"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "payment_id": "uuid-here",
    "payment_intent_id": "pi_xxx",
    "status": "succeeded",
    "amount": 29.90,
    "currency": "CHF",
    "payment_method": "card",
    "services_activated": {
      "payment_type": "premium_package",
      "listing_id": "uuid-here",
      "activated_at": "2024-01-15T10:30:00Z"
    },
    "receipt_info": {
      "receipt_email": "customer@example.com",
      "invoice_generation": "pending"
    }
  }
}
```

### 3. Payment History

**GET** `/api/payments/history`

Retrieves user's payment history with filtering and pagination.

#### Query Parameters

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by payment status
- `payment_type` (string): Filter by payment type
- `currency` (string): Filter by currency
- `date_from` (ISO string): Start date filter
- `date_to` (ISO string): End date filter
- `amount_min` (number): Minimum amount filter
- `amount_max` (number): Maximum amount filter
- `sort_by` (string): Sort field (default: created_at)
- `sort_order` (string): Sort order (asc/desc, default: desc)

#### Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid-here",
        "amount": 29.90,
        "currency": "CHF",
        "payment_type": "premium_package",
        "status": "completed",
        "payment_method": "card",
        "description": "Premium listing package",
        "completed_at": "2024-01-15T10:30:00Z",
        "created_at": "2024-01-15T10:25:00Z",
        "listings": {
          "id": "uuid-here",
          "title": "BMW 320i 2020",
          "brand": "BMW",
          "model": "320i"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "total_payments": 45,
      "total_amount": 1250.50,
      "completed_payments": 42,
      "completed_amount": 1180.30,
      "success_rate": 93.33
    }
  }
}
```

### 4. Generate Invoice

**GET** `/api/payments/invoice/[id]`

Generates and retrieves an invoice for a completed payment.

#### Query Parameters

- `language` (string): Invoice language (de/fr/en/pl, default: de)
- `format` (string): Output format (pdf/html, default: pdf)
- `include_vat` (boolean): Include VAT calculation (default: true)

#### Response (HTML format)

```json
{
  "success": true,
  "data": {
    "invoice_id": "inv_202401001234",
    "payment_id": "uuid-here",
    "invoice_number": "202401001234",
    "invoice_html": "<html>...</html>",
    "language": "de",
    "format": "html",
    "generated_at": "2024-01-15T11:00:00Z",
    "download_url": "/api/payments/invoice/uuid-here?format=pdf&language=de"
  }
}
```

### 5. Process Refund

**POST** `/api/payments/refund`

Processes full or partial refunds with automatic service deactivation.

#### Request Body

```json
{
  "payment_id": "uuid-here",
  "amount": 29.90,
  "reason": "requested_by_customer",
  "description": "Customer requested refund due to service issue",
  "refund_application_fee": false
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "refund_id": "uuid-here",
    "original_payment_id": "uuid-here",
    "refund_amount": 29.90,
    "currency": "CHF",
    "status": "completed",
    "reason": "requested_by_customer",
    "stripe_refund_id": "re_xxx",
    "processed_at": "2024-01-15T12:00:00Z",
    "refund_details": {
      "original_amount": 29.90,
      "refunded_amount": 29.90,
      "remaining_amount": 0.00,
      "is_full_refund": true,
      "refund_method": "original_payment_method",
      "estimated_processing_time": "5-10 business days"
    }
  }
}
```

### 6. Calculate Commission

**GET** `/api/payments/commission/[auctionId]`

Calculates auction commission for a specific auction.

#### Query Parameters

- `commission_rate` (number): Override commission rate (0-1)
- `max_commission` (number): Override maximum commission
- `sale_amount` (number): Override sale amount

#### Response

```json
{
  "success": true,
  "data": {
    "auction_id": "uuid-here",
    "listing_id": "uuid-here",
    "commission_calculation": {
      "sale_amount": 15000.00,
      "commission_rate": 0.05,
      "commission_amount": 500.00,
      "max_commission": 500.00,
      "currency": "CHF",
      "is_capped": true,
      "calculated_at": "2024-01-15T13:00:00Z"
    },
    "swiss_tax_info": {
      "vat_rate": 0.077,
      "vat_amount": 38.50,
      "total_with_vat": 538.50,
      "vat_applicable": true
    },
    "payment_status": {
      "commission_paid": false,
      "payment_due": "2024-01-22T13:00:00Z",
      "payment_overdue": false,
      "days_until_due": 7
    }
  }
}
```

### 7. Webhook Handler

**POST** `/api/payments/webhook`

Handles Stripe webhook events for payment processing.

#### Supported Events

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.requires_action`
- `charge.dispute.created`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Swiss Market Compliance

### Currency Support

- **Primary**: CHF (Swiss Franc)
- **Secondary**: EUR, USD
- **Formatting**: Swiss locale formatting (1'234.56 CHF)

### VAT Handling

- **Standard Rate**: 7.7%
- **Calculation**: Automatic VAT calculation for Swiss customers
- **Invoice Compliance**: Swiss-compliant invoice generation

### Payment Methods

#### TWINT
- **Type**: Swiss mobile payment
- **Currencies**: CHF
- **Processing**: Instant
- **Fees**: 0.9%

#### PostFinance
- **Type**: Swiss postal bank
- **Currencies**: CHF, EUR
- **Processing**: 1-2 business days
- **Fees**: 1.9% + 0.35 CHF

#### Credit/Debit Cards
- **Types**: Visa, Mastercard, American Express
- **Currencies**: CHF, EUR, USD
- **Processing**: Instant
- **Fees**: 2.9% + 0.30 CHF

### Data Protection

- **GDPR Compliance**: Full GDPR compliance
- **Data Retention**: 10 years for financial records
- **Cross-border Transfers**: Stripe processes internationally
- **Consent Management**: Explicit consent for data processing

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "code": "PAYMENT_FAILED",
    "type": "card_error",
    "param": "card_number",
    "message": "Your card was declined."
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `PAYMENT_FAILED`: Payment processing failed
- `INSUFFICIENT_FUNDS`: Card has insufficient funds
- `CARD_DECLINED`: Card was declined
- `EXPIRED_CARD`: Card has expired
- `INVALID_CVC`: Invalid CVC code
- `PROCESSING_ERROR`: Payment processing error
- `REFUND_FAILED`: Refund processing failed
- `INVOICE_GENERATION_FAILED`: Invoice generation failed

### Retry Logic

- **Card Errors**: User should retry with different payment method
- **Rate Limits**: Automatic retry with exponential backoff
- **Network Errors**: Automatic retry up to 3 times
- **API Errors**: Manual retry recommended

## Webhooks

### Webhook Security

All webhooks are verified using Stripe's signature verification:

```typescript
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

### Webhook Events

#### payment_intent.succeeded
Triggered when a payment is successfully completed.

#### payment_intent.payment_failed
Triggered when a payment fails.

#### charge.dispute.created
Triggered when a customer disputes a charge.

### Webhook Configuration

Set up webhooks in your Stripe dashboard:

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment_intent.*`, `charge.dispute.*`, `invoice.*`
4. Copy webhook secret to environment variables

## Testing

### Test Cards

Use Stripe's test cards for development:

```javascript
// Successful payment
const testCard = {
  number: '4242424242424242',
  exp_month: 12,
  exp_year: 2025,
  cvc: '123'
}

// Declined payment
const declinedCard = {
  number: '4000000000000002',
  exp_month: 12,
  exp_year: 2025,
  cvc: '123'
}

// 3D Secure required
const threeDSCard = {
  number: '4000002500003155',
  exp_month: 12,
  exp_year: 2025,
  cvc: '123'
}
```

### Test Environment

```bash
# Set test environment variables
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Integration Testing

```typescript
// Example test for payment creation
describe('Payment API', () => {
  test('should create payment intent', async () => {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        amount: 29.90,
        currency: 'CHF',
        payment_type: 'premium_package'
      })
    })
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.client_secret).toBeDefined()
  })
})
```

## Security

### PCI Compliance

- **Stripe Handles**: All sensitive card data
- **No Storage**: Never store card information
- **Tokenization**: Use Stripe tokens for recurring payments

### Authentication

- **JWT Tokens**: Secure authentication with JWT
- **Token Expiry**: Tokens expire after 24 hours
- **Refresh Tokens**: Automatic token refresh

### Data Encryption

- **In Transit**: All API calls use HTTPS/TLS 1.3
- **At Rest**: Database encryption for sensitive data
- **Tokenization**: Payment methods are tokenized

### Rate Limiting

- **API Limits**: 100 requests per minute per user
- **Webhook Limits**: 1000 webhooks per hour
- **Retry Limits**: Maximum 3 retries for failed requests

### Monitoring

- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: API response time tracking
- **Security Alerts**: Automated alerts for suspicious activity

## Environment Variables

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Application
NEXT_PUBLIC_APP_URL=https://motoauto.ch
NODE_ENV=production
```

## Support

For technical support or questions about the payment API:

- **Email**: dev@motoauto.ch
- **Documentation**: https://docs.motoauto.ch/payments
- **Status Page**: https://status.motoauto.ch
- **GitHub Issues**: https://github.com/motoauto/api/issues

## Changelog

### v1.0.0 (2024-01-15)
- Initial payment API implementation
- Stripe integration with Swiss payment methods
- Multi-currency support (CHF, EUR, USD)
- Swiss VAT calculation and compliance
- Invoice generation in multiple languages
- Commission calculation for auctions
- Comprehensive refund processing
- Webhook handling for payment events
- Swiss market compliance features
- Error handling and logging system