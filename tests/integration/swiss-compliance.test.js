/**
 * Swiss Market Compliance Tests
 * Tests CHF currency handling, VAT calculations, legal compliance, and Swiss-specific business rules
 */

const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid,
  mockPayment,
  swissTestData,
  mockSupabaseResponse,
  formatCurrency,
  calculateVAT,
  validateSwissPostalCode,
  validateSwissPhoneNumber,
  validateSwissVATNumber
} = require('../utils/test-helpers')

describe('Swiss Market Compliance Tests', () => {
  let mockSupabase

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }))
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('CHF Currency Handling', () => {
    test('should format CHF currency correctly', () => {
      const testAmounts = [
        { amount: 1000, expected: "CHF 1'000" },
        { amount: 50000, expected: "CHF 50'000" },
        { amount: 123456, expected: "CHF 123'456" },
        { amount: 1234567, expected: "CHF 1'234'567" },
        { amount: 999, expected: "CHF 999" },
        { amount: 0, expected: "CHF 0" }
      ]

      testAmounts.forEach(({ amount, expected }) => {
        const formatted = formatCurrency(amount, 'CHF')
        expect(formatted).toBe(expected)
      })
    })

    test('should handle decimal CHF amounts', () => {
      const testAmounts = [
        { amount: 1000.50, expected: "CHF 1'000.50" },
        { amount: 50000.99, expected: "CHF 50'000.99" },
        { amount: 123456.05, expected: "CHF 123'456.05" },
        { amount: 999.00, expected: "CHF 999.00" }
      ]

      testAmounts.forEach(({ amount, expected }) => {
        const formatted = formatCurrency(amount, 'CHF', true)
        expect(formatted).toBe(expected)
      })
    })

    test('should validate CHF amount ranges for listings', () => {
      const validAmounts = [1000, 50000, 500000, 999999]
      const invalidAmounts = [0, -1000, 1000000, 1500000]

      validAmounts.forEach(amount => {
        expect(swissTestData.isValidListingPrice(amount)).toBe(true)
      })

      invalidAmounts.forEach(amount => {
        expect(swissTestData.isValidListingPrice(amount)).toBe(false)
      })
    })

    test('should handle currency conversion rates', () => {
      const eurAmount = 45000
      const usdAmount = 48000
      const expectedCHFFromEUR = Math.round(eurAmount * 0.95) // Mock rate
      const expectedCHFFromUSD = Math.round(usdAmount * 0.92) // Mock rate

      expect(swissTestData.convertToCHF(eurAmount, 'EUR')).toBe(expectedCHFFromEUR)
      expect(swissTestData.convertToCHF(usdAmount, 'USD')).toBe(expectedCHFFromUSD)
    })
  })

  describe('Swiss VAT Calculations', () => {
    test('should calculate 7.7% VAT correctly', () => {
      const testAmounts = [
        { net: 10000, expectedVAT: 770, expectedGross: 10770 },
        { net: 50000, expectedVAT: 3850, expectedGross: 53850 },
        { net: 100000, expectedVAT: 7700, expectedGross: 107700 },
        { net: 25000, expectedVAT: 1925, expectedGross: 26925 }
      ]

      testAmounts.forEach(({ net, expectedVAT, expectedGross }) => {
        const vat = calculateVAT(net, 7.7)
        const gross = net + vat

        expect(vat).toBe(expectedVAT)
        expect(gross).toBe(expectedGross)
      })
    })

    test('should handle VAT-inclusive price calculations', () => {
      const testPrices = [
        { gross: 10770, expectedNet: 10000, expectedVAT: 770 },
        { gross: 53850, expectedNet: 50000, expectedVAT: 3850 },
        { gross: 107700, expectedNet: 100000, expectedVAT: 7700 }
      ]

      testPrices.forEach(({ gross, expectedNet, expectedVAT }) => {
        const net = Math.round(gross / 1.077)
        const vat = gross - net

        expect(net).toBe(expectedNet)
        expect(Math.round(vat)).toBe(expectedVAT)
      })
    })

    test('should apply VAT exemptions correctly', () => {
      const exemptCategories = ['export', 'private_sale', 'charity']
      const regularCategories = ['dealer_sale', 'commercial', 'business']

      exemptCategories.forEach(category => {
        const vatRate = swissTestData.getVATRate(category)
        expect(vatRate).toBe(0)
      })

      regularCategories.forEach(category => {
        const vatRate = swissTestData.getVATRate(category)
        expect(vatRate).toBe(7.7)
      })
    })

    test('should generate VAT-compliant invoices', () => {
      const payment = mockPayment()
      const invoice = swissTestData.generateInvoice(payment)

      expect(invoice).toHaveProperty('invoice_number')
      expect(invoice).toHaveProperty('vat_number')
      expect(invoice).toHaveProperty('net_amount')
      expect(invoice).toHaveProperty('vat_amount')
      expect(invoice).toHaveProperty('gross_amount')
      expect(invoice).toHaveProperty('vat_rate', 7.7)
      expect(invoice.vat_number).toMatch(/CHE-\d{3}\.\d{3}\.\d{3}/)
      expect(invoice.net_amount + invoice.vat_amount).toBe(invoice.gross_amount)
    })
  })

  describe('Swiss Address and Contact Validation', () => {
    test('should validate Swiss postal codes', () => {
      const validPostalCodes = ['8001', '1000', '3000', '4000', '6000', '7000', '9000']
      const invalidPostalCodes = ['0000', '999', '10000', 'ABC1', '80011']

      validPostalCodes.forEach(code => {
        expect(validateSwissPostalCode(code)).toBe(true)
      })

      invalidPostalCodes.forEach(code => {
        expect(validateSwissPostalCode(code)).toBe(false)
      })
    })

    test('should validate Swiss phone numbers', () => {
      const validPhoneNumbers = [
        '+41 44 123 45 67',
        '+41 79 123 45 67',
        '044 123 45 67',
        '079 123 45 67',
        '+41441234567',
        '0441234567'
      ]

      const invalidPhoneNumbers = [
        '+49 30 12345678', // German number
        '+33 1 23 45 67 89', // French number
        '123 456 789', // Too short
        '+41 123 456 789 012' // Too long
      ]

      validPhoneNumbers.forEach(phone => {
        expect(validateSwissPhoneNumber(phone)).toBe(true)
      })

      invalidPhoneNumbers.forEach(phone => {
        expect(validateSwissPhoneNumber(phone)).toBe(false)
      })
    })

    test('should validate Swiss VAT numbers', () => {
      const validVATNumbers = [
        'CHE-123.456.789',
        'CHE-987.654.321',
        'CHE-111.222.333'
      ]

      const invalidVATNumbers = [
        'DE123456789', // German VAT
        'FR12345678901', // French VAT
        'CHE-123.456', // Incomplete
        'CHE-123.456.789.012' // Too long
      ]

      validVATNumbers.forEach(vat => {
        expect(validateSwissVATNumber(vat)).toBe(true)
      })

      invalidVATNumbers.forEach(vat => {
        expect(validateSwissVATNumber(vat)).toBe(false)
      })
    })

    test('should validate Swiss IBAN format', () => {
      const validIBANs = [
        'CH93 0076 2011 6238 5295 7',
        'CH56 0483 5012 3456 7800 9',
        'CH21 0900 0000 8750 1234 5'
      ]

      const invalidIBANs = [
        'DE89 3704 0044 0532 0130 00', // German IBAN
        'FR14 2004 1010 0505 0001 3M02 606', // French IBAN
        'CH93 0076 2011 6238 5295', // Incomplete
        'CH93 0076 2011 6238 5295 78' // Too long
      ]

      validIBANs.forEach(iban => {
        expect(swissTestData.validateIBAN(iban)).toBe(true)
      })

      invalidIBANs.forEach(iban => {
        expect(swissTestData.validateIBAN(iban)).toBe(false)
      })
    })
  })

  describe('Swiss Payment Methods', () => {
    test('should support TWINT payments', () => {
      const twintPayment = {
        method: 'twint',
        amount: 45000,
        currency: 'CHF',
        phone: '+41 79 123 45 67'
      }

      const isSupported = swissTestData.isPaymentMethodSupported(twintPayment.method)
      const isValidAmount = swissTestData.isValidPaymentAmount(twintPayment.amount, twintPayment.method)

      expect(isSupported).toBe(true)
      expect(isValidAmount).toBe(true)
    })

    test('should support PostFinance payments', () => {
      const postFinancePayment = {
        method: 'postfinance',
        amount: 75000,
        currency: 'CHF',
        account: 'CH93 0076 2011 6238 5295 7'
      }

      const isSupported = swissTestData.isPaymentMethodSupported(postFinancePayment.method)
      const isValidAmount = swissTestData.isValidPaymentAmount(postFinancePayment.amount, postFinancePayment.method)

      expect(isSupported).toBe(true)
      expect(isValidAmount).toBe(true)
    })

    test('should enforce payment limits for different methods', () => {
      const paymentLimits = {
        twint: { min: 1, max: 5000 },
        postfinance: { min: 1, max: 100000 },
        bank_transfer: { min: 100, max: 1000000 },
        credit_card: { min: 1, max: 50000 }
      }

      Object.entries(paymentLimits).forEach(([method, limits]) => {
        expect(swissTestData.isValidPaymentAmount(limits.min, method)).toBe(true)
        expect(swissTestData.isValidPaymentAmount(limits.max, method)).toBe(true)
        expect(swissTestData.isValidPaymentAmount(limits.min - 1, method)).toBe(false)
        expect(swissTestData.isValidPaymentAmount(limits.max + 1, method)).toBe(false)
      })
    })

    test('should handle Swiss QR-Bill generation', () => {
      const payment = mockPayment()
      const qrBill = swissTestData.generateQRBill(payment)

      expect(qrBill).toHaveProperty('qr_reference')
      expect(qrBill).toHaveProperty('creditor_iban')
      expect(qrBill).toHaveProperty('amount')
      expect(qrBill).toHaveProperty('currency', 'CHF')
      expect(qrBill).toHaveProperty('debtor_info')
      expect(qrBill.creditor_iban).toMatch(/^CH\d{2}/)
      expect(qrBill.qr_reference).toHaveLength(27)
    })
  })

  describe('Swiss Legal Compliance', () => {
    test('should enforce maximum commission cap of CHF 500', () => {
      const testSales = [
        { price: 10000, expectedCommission: 500 }, // 5% would be 500, capped at 500
        { price: 20000, expectedCommission: 500 }, // 5% would be 1000, capped at 500
        { price: 5000, expectedCommission: 250 },  // 5% is 250, under cap
        { price: 8000, expectedCommission: 400 }   // 5% is 400, under cap
      ]

      testSales.forEach(({ price, expectedCommission }) => {
        const commission = swissTestData.calculateCommission(price)
        expect(commission).toBe(expectedCommission)
        expect(commission).toBeLessThanOrEqual(500)
      })
    })

    test('should validate Swiss business registration requirements', () => {
      const businessProfile = {
        type: 'dealer',
        vat_number: 'CHE-123.456.789',
        business_license: 'CH-BL-2024-001',
        address: {
          street: 'Bahnhofstrasse 1',
          postal_code: '8001',
          city: 'Zürich',
          country: 'CH'
        }
      }

      const validation = swissTestData.validateBusinessRegistration(businessProfile)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should enforce Swiss data protection (FADP) compliance', () => {
      const userData = {
        email: 'test@example.com',
        phone: '+41 79 123 45 67',
        address: 'Bahnhofstrasse 1, 8001 Zürich',
        consent_marketing: true,
        consent_data_processing: true,
        consent_timestamp: new Date().toISOString()
      }

      const compliance = swissTestData.checkDataProtectionCompliance(userData)

      expect(compliance.hasRequiredConsents).toBe(true)
      expect(compliance.isConsentTimestamped).toBe(true)
      expect(compliance.isCompliant).toBe(true)
    })

    test('should validate Swiss vehicle registration requirements', () => {
      const vehicleData = {
        vin: 'WBAVA31070NL12345',
        license_plate: 'ZH 123456',
        registration_document: 'CH-REG-2024-001',
        technical_inspection: {
          valid_until: '2025-12-31',
          inspection_center: 'MFK Zürich'
        },
        insurance: {
          policy_number: 'CH-INS-2024-001',
          valid_until: '2025-06-30'
        }
      }

      const validation = swissTestData.validateVehicleRegistration(vehicleData)

      expect(validation.isValid).toBe(true)
      expect(validation.hasValidInspection).toBe(true)
      expect(validation.hasValidInsurance).toBe(true)
    })

    test('should enforce Swiss auction regulations', () => {
      const auction = mockAuction()
      const regulations = swissTestData.checkAuctionRegulations(auction)

      expect(regulations.hasMinimumDuration).toBe(true) // At least 24 hours
      expect(regulations.hasProperNotification).toBe(true) // 48h advance notice
      expect(regulations.hasTermsAndConditions).toBe(true)
      expect(regulations.isCompliant).toBe(true)
    })
  })

  describe('Swiss Market Specific Features', () => {
    test('should handle Swiss German language specifics', () => {
      const swissGermanTerms = {
        'Occasionen': 'Used cars',
        'Fahrzeugausweis': 'Vehicle registration document',
        'MFK': 'Technical inspection',
        'Haftpflichtversicherung': 'Liability insurance',
        'Vignette': 'Highway toll sticker'
      }

      Object.entries(swissGermanTerms).forEach(([german, english]) => {
        const translation = swissTestData.translateTerm(german, 'de-CH', 'en')
        expect(translation).toBe(english)
      })
    })

    test('should support Swiss French language specifics', () => {
      const swissFrenchTerms = {
        'Occasions': 'Used cars',
        'Permis de circulation': 'Vehicle registration document',
        'Expertise': 'Technical inspection',
        'Assurance responsabilité civile': 'Liability insurance',
        'Vignette': 'Highway toll sticker'
      }

      Object.entries(swissFrenchTerms).forEach(([french, english]) => {
        const translation = swissTestData.translateTerm(french, 'fr-CH', 'en')
        expect(translation).toBe(english)
      })
    })

    test('should handle Swiss holiday calendar', () => {
      const swissHolidays2024 = [
        '2024-01-01', // New Year
        '2024-01-02', // Berchtoldstag
        '2024-03-29', // Good Friday
        '2024-04-01', // Easter Monday
        '2024-05-01', // Labour Day
        '2024-05-09', // Ascension Day
        '2024-05-20', // Whit Monday
        '2024-08-01', // Swiss National Day
        '2024-12-25', // Christmas Day
        '2024-12-26'  // Boxing Day
      ]

      swissHolidays2024.forEach(date => {
        expect(swissTestData.isSwissHoliday(date)).toBe(true)
      })

      expect(swissTestData.isSwissHoliday('2024-07-04')).toBe(false) // US Independence Day
    })

    test('should calculate Swiss working days', () => {
      const startDate = '2024-01-01' // New Year (holiday)
      const endDate = '2024-01-10'
      
      const workingDays = swissTestData.calculateWorkingDays(startDate, endDate)
      
      // Should exclude weekends and New Year's Day and Berchtoldstag
      expect(workingDays).toBe(6) // 10 days - 2 weekends - 2 holidays
    })

    test('should handle Swiss time zones', () => {
      const zurichTime = swissTestData.convertToSwissTime('2024-06-15T12:00:00Z')
      const expectedTime = '2024-06-15T14:00:00+02:00' // CET+1 (summer time)
      
      expect(zurichTime).toBe(expectedTime)
    })
  })

  describe('Swiss Banking and Finance Integration', () => {
    test('should validate Swiss bank account formats', () => {
      const validAccounts = [
        'CH93 0076 2011 6238 5295 7',
        'CH56 0483 5012 3456 7800 9',
        'CH21 0900 0000 8750 1234 5'
      ]

      const invalidAccounts = [
        'CH93 0076 2011 6238 5295', // Too short
        'DE89 3704 0044 0532 0130 00', // German IBAN
        'CH93-0076-2011-6238-5295-7' // Wrong format
      ]

      validAccounts.forEach(account => {
        expect(swissTestData.validateBankAccount(account)).toBe(true)
      })

      invalidAccounts.forEach(account => {
        expect(swissTestData.validateBankAccount(account)).toBe(false)
      })
    })

    test('should handle Swiss banking holidays', () => {
      const bankingHolidays = [
        '2024-01-01', // New Year
        '2024-01-02', // Berchtoldstag
        '2024-03-29', // Good Friday
        '2024-04-01', // Easter Monday
        '2024-05-01', // Labour Day
        '2024-08-01', // Swiss National Day
        '2024-12-25', // Christmas
        '2024-12-26'  // Boxing Day
      ]

      bankingHolidays.forEach(date => {
        expect(swissTestData.isBankingHoliday(date)).toBe(true)
      })
    })

    test('should calculate Swiss banking processing times', () => {
      const paymentDate = '2024-06-14' // Friday
      const expectedProcessingDate = '2024-06-17' // Monday (next working day)
      
      const processingDate = swissTestData.calculateBankingProcessingDate(paymentDate)
      
      expect(processingDate).toBe(expectedProcessingDate)
    })

    test('should handle Swiss franc exchange rates', () => {
      const mockRates = {
        'EUR': 0.95,
        'USD': 0.92,
        'GBP': 1.15
      }

      Object.entries(mockRates).forEach(([currency, rate]) => {
        const chfAmount = 1000
        const convertedAmount = Math.round(chfAmount / rate)
        
        expect(swissTestData.convertFromCHF(chfAmount, currency)).toBe(convertedAmount)
      })
    })
  })

  describe('Swiss Regulatory Reporting', () => {
    test('should generate Swiss tax reporting data', () => {
      const salesData = [
        { amount: 50000, vat: 3850, date: '2024-01-15' },
        { amount: 75000, vat: 5775, date: '2024-02-20' },
        { amount: 30000, vat: 2310, date: '2024-03-10' }
      ]

      const taxReport = swissTestData.generateTaxReport(salesData, '2024-Q1')

      expect(taxReport).toHaveProperty('period', '2024-Q1')
      expect(taxReport).toHaveProperty('total_sales', 155000)
      expect(taxReport).toHaveProperty('total_vat', 11935)
      expect(taxReport).toHaveProperty('transaction_count', 3)
      expect(taxReport).toHaveProperty('vat_rate', 7.7)
    })

    test('should generate anti-money laundering reports', () => {
      const suspiciousTransaction = {
        amount: 150000, // High amount
        payment_method: 'cash',
        user_id: 'user_suspicious_123',
        listing_id: 'listing_luxury_456'
      }

      const amlCheck = swissTestData.checkAMLCompliance(suspiciousTransaction)

      expect(amlCheck.requiresReporting).toBe(true)
      expect(amlCheck.riskLevel).toBe('high')
      expect(amlCheck.reasons).toContain('high_cash_amount')
    })

    test('should track cross-border transactions', () => {
      const crossBorderSale = {
        seller_country: 'CH',
        buyer_country: 'DE',
        amount: 45000,
        currency: 'CHF'
      }

      const crossBorderReport = swissTestData.generateCrossBorderReport(crossBorderSale)

      expect(crossBorderReport.requires_customs_declaration).toBe(true)
      expect(crossBorderReport.export_documentation_needed).toBe(true)
      expect(crossBorderReport.vat_treatment).toBe('export_exempt')
    })
  })

  describe('Swiss Consumer Protection', () => {
    test('should enforce Swiss consumer rights', () => {
      const consumerSale = {
        seller_type: 'dealer',
        buyer_type: 'consumer',
        vehicle_age: 2, // years
        mileage: 45000,
        warranty_period: 12 // months
      }

      const consumerRights = swissTestData.getConsumerRights(consumerSale)

      expect(consumerRights.warranty_required).toBe(true)
      expect(consumerRights.return_period_days).toBe(14)
      expect(consumerRights.defect_liability_months).toBe(24)
    })

    test('should validate Swiss warranty requirements', () => {
      const warrantyTerms = {
        duration_months: 12,
        coverage: 'major_defects',
        exclusions: ['wear_items', 'accident_damage'],
        provider: 'dealer'
      }

      const warrantyValidation = swissTestData.validateWarranty(warrantyTerms)

      expect(warrantyValidation.meets_minimum_requirements).toBe(true)
      expect(warrantyValidation.is_legally_compliant).toBe(true)
    })

    test('should handle Swiss dispute resolution', () => {
      const dispute = {
        type: 'vehicle_defect',
        amount: 5000,
        consumer_involved: true,
        preferred_resolution: 'mediation'
      }

      const resolutionProcess = swissTestData.getDisputeResolutionProcess(dispute)

      expect(resolutionProcess.mediation_available).toBe(true)
      expect(resolutionProcess.arbitration_court).toBe('Swiss Arbitration Centre')
      expect(resolutionProcess.applicable_law).toBe('Swiss Consumer Protection Act')
    })
  })
})