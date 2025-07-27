import { formatSwissAmount, calculateSwissVAT } from './stripe'

// Swiss cantons for validation
export const SWISS_CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
] as const

export type SwissCanton = typeof SWISS_CANTONS[number]

// Swiss postal code validation
export function validateSwissPostalCode(postalCode: string): boolean {
  // Swiss postal codes are 4 digits
  return /^\d{4}$/.test(postalCode)
}

// Swiss phone number validation
export function validateSwissPhoneNumber(phone: string): boolean {
  // Swiss phone numbers: +41 XX XXX XX XX or 0XX XXX XX XX
  const swissPhoneRegex = /^(\+41|0041|0)[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/
  return swissPhoneRegex.test(phone.replace(/\s/g, ''))
}

// Swiss VAT number validation
export function validateSwissVATNumber(vatNumber: string): boolean {
  // Swiss VAT format: CHE-123.456.789 MWST
  const swissVATRegex = /^CHE-\d{3}\.\d{3}\.\d{3}\s(MWST|TVA|IVA)$/
  return swissVATRegex.test(vatNumber)
}

// Swiss IBAN validation (simplified)
export function validateSwissIBAN(iban: string): boolean {
  // Swiss IBAN: CH93 0076 2011 6238 5295 7
  const swissIBANRegex = /^CH\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d$/
  return swissIBANRegex.test(iban.replace(/\s/g, ''))
}

// Format Swiss address
export function formatSwissAddress(address: {
  street: string
  houseNumber?: string
  postalCode: string
  city: string
  canton?: string
  country?: string
}): string {
  const { street, houseNumber, postalCode, city, canton, country = 'Switzerland' } = address
  
  let formattedAddress = street
  if (houseNumber) {
    formattedAddress += ` ${houseNumber}`
  }
  formattedAddress += `\n${postalCode} ${city}`
  if (canton) {
    formattedAddress += ` ${canton}`
  }
  formattedAddress += `\n${country}`
  
  return formattedAddress
}

// Swiss payment method configuration
export const SWISS_PAYMENT_METHODS = {
  TWINT: {
    id: 'twint',
    name: 'TWINT',
    description: 'Swiss mobile payment app',
    currencies: ['CHF'],
    processingTime: 'instant',
    fees: {
      fixed: 0,
      percentage: 0.009 // 0.9%
    }
  },
  POSTFINANCE: {
    id: 'postfinance',
    name: 'PostFinance',
    description: 'Swiss postal bank',
    currencies: ['CHF', 'EUR'],
    processingTime: '1-2 business days',
    fees: {
      fixed: 0.35,
      percentage: 0.019 // 1.9%
    }
  },
  CARD: {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    currencies: ['CHF', 'EUR', 'USD'],
    processingTime: 'instant',
    fees: {
      fixed: 0.30,
      percentage: 0.029 // 2.9%
    }
  },
  SEPA: {
    id: 'sepa_debit',
    name: 'SEPA Direct Debit',
    description: 'European bank transfer',
    currencies: ['EUR'],
    processingTime: '2-5 business days',
    fees: {
      fixed: 0.35,
      percentage: 0.008 // 0.8%
    }
  }
} as const

// Calculate payment processing fees
export function calculatePaymentFees(
  amount: number,
  currency: string,
  paymentMethod: keyof typeof SWISS_PAYMENT_METHODS
): {
  amount: number
  currency: string
  paymentMethod: string
  fees: {
    fixed: number
    percentage: number
    total: number
  }
  netAmount: number
} {
  const method = SWISS_PAYMENT_METHODS[paymentMethod]
  const percentageFee = amount * method.fees.percentage
  const totalFees = method.fees.fixed + percentageFee
  
  return {
    amount,
    currency,
    paymentMethod: method.name,
    fees: {
      fixed: method.fees.fixed,
      percentage: percentageFee,
      total: totalFees
    },
    netAmount: amount - totalFees
  }
}

// Swiss tax calculation utilities
export interface SwissTaxCalculation {
  grossAmount: number
  netAmount: number
  vatAmount: number
  vatRate: number
  currency: string
  isVATApplicable: boolean
  taxPeriod: string
}

export function calculateSwissTax(
  amount: number,
  currency: string = 'CHF',
  includeVAT: boolean = true,
  vatRate: number = 0.077 // 7.7% standard Swiss VAT
): SwissTaxCalculation {
  const isVATApplicable = includeVAT && ['CHF', 'EUR'].includes(currency.toUpperCase())
  
  if (!isVATApplicable) {
    return {
      grossAmount: amount,
      netAmount: amount,
      vatAmount: 0,
      vatRate: 0,
      currency,
      isVATApplicable: false,
      taxPeriod: getCurrentTaxPeriod()
    }
  }
  
  const vatCalculation = calculateSwissVAT(amount, vatRate)
  
  return {
    grossAmount: amount,
    netAmount: vatCalculation.netAmount,
    vatAmount: vatCalculation.vatAmount,
    vatRate,
    currency,
    isVATApplicable: true,
    taxPeriod: getCurrentTaxPeriod()
  }
}

// Get current Swiss tax period (quarterly)
export function getCurrentTaxPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return `${year}-Q${quarter}`
}

// Swiss business hours validation
export function isSwissBusinessHours(date: Date = new Date()): boolean {
  const day = date.getDay() // 0 = Sunday, 6 = Saturday
  const hour = date.getHours()
  
  // Monday to Friday, 8 AM to 6 PM Swiss time
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18
}

// Swiss holiday checker (simplified - you'd want a more comprehensive list)
export function isSwissHoliday(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Major Swiss holidays
  const holidays = [
    { month: 1, day: 1 },   // New Year's Day
    { month: 1, day: 2 },   // Berchtoldstag
    { month: 8, day: 1 },   // Swiss National Day
    { month: 12, day: 25 }, // Christmas Day
    { month: 12, day: 26 }  // Boxing Day
  ]
  
  return holidays.some(holiday => holiday.month === month && holiday.day === day)
}

// Format currency for Swiss market
export function formatSwissCurrency(
  amount: number,
  currency: string = 'CHF',
  locale: string = 'de-CH'
): string {
  return formatSwissAmount(amount, currency, locale)
}

// Swiss compliance validation for payments
export interface SwissComplianceCheck {
  isCompliant: boolean
  issues: string[]
  recommendations: string[]
}

export function validateSwissCompliance(paymentData: {
  amount: number
  currency: string
  customerCountry?: string
  vatNumber?: string
  paymentMethod?: string
  businessType?: 'B2B' | 'B2C'
}): SwissComplianceCheck {
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Currency validation
  if (!['CHF', 'EUR', 'USD'].includes(paymentData.currency)) {
    issues.push(`Currency ${paymentData.currency} is not commonly supported in Switzerland`)
    recommendations.push('Consider using CHF, EUR, or USD')
  }
  
  // Amount validation
  if (paymentData.amount < 0.50) {
    issues.push('Payment amount is below minimum threshold')
    recommendations.push('Minimum payment amount should be 0.50 CHF')
  }
  
  // VAT number validation for B2B
  if (paymentData.businessType === 'B2B' && paymentData.vatNumber) {
    if (paymentData.customerCountry === 'CH' && !validateSwissVATNumber(paymentData.vatNumber)) {
      issues.push('Invalid Swiss VAT number format')
      recommendations.push('Swiss VAT numbers should follow format: CHE-XXX.XXX.XXX MWST')
    }
  }
  
  // Payment method validation
  if (paymentData.paymentMethod && paymentData.currency === 'CHF') {
    if (!['card', 'twint', 'postfinance', 'sepa_debit'].includes(paymentData.paymentMethod)) {
      recommendations.push('Consider offering TWINT or PostFinance for Swiss customers')
    }
  }
  
  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations
  }
}

// Swiss data protection compliance
export interface SwissDataProtection {
  dataMinimization: boolean
  consentRequired: boolean
  retentionPeriod: number // in months
  crossBorderTransfer: boolean
  specialCategories: boolean
}

export function getSwissDataProtectionRequirements(
  dataType: 'payment' | 'personal' | 'financial' | 'marketing'
): SwissDataProtection {
  const baseRequirements = {
    dataMinimization: true,
    consentRequired: true,
    retentionPeriod: 120, // 10 years for financial data
    crossBorderTransfer: false,
    specialCategories: false
  }
  
  switch (dataType) {
    case 'payment':
      return {
        ...baseRequirements,
        retentionPeriod: 120, // 10 years for payment records
        crossBorderTransfer: true // Stripe processes internationally
      }
    
    case 'financial':
      return {
        ...baseRequirements,
        retentionPeriod: 120, // 10 years
        specialCategories: true
      }
    
    case 'personal':
      return {
        ...baseRequirements,
        retentionPeriod: 24, // 2 years
        crossBorderTransfer: false
      }
    
    case 'marketing':
      return {
        ...baseRequirements,
        retentionPeriod: 36, // 3 years
        consentRequired: true
      }
    
    default:
      return baseRequirements
  }
}

// Export all utilities
export {
  formatSwissAmount,
  calculateSwissVAT
}