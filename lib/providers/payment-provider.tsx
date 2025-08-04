'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { clientEnv } from '@/lib/env.client'

// Stripe configuration
const stripePromise = loadStripe(clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Payment context types
interface PaymentContextType {
  stripe: Stripe | null
  isLoading: boolean
  error: string | null
}

interface PaymentProviderProps {
  children: React.ReactNode
  options?: {
    locale?: 'de' | 'fr' | 'en' | 'pl'
    appearance?: {
      theme?: 'stripe' | 'night' | 'flat'
      variables?: Record<string, string>
    }
  }
}

// Create payment context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

// Payment provider component
export const PaymentProvider: React.FC<PaymentProviderProps> = ({ 
  children, 
  options = {} 
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const stripeInstance = await stripePromise
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe')
        }
        
        setStripe(stripeInstance)
      } catch (err) {
        console.error('Error initializing Stripe:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize payment system')
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [])

  // Stripe Elements options with Swiss market configuration
  const elementsOptions = {
    locale: options.locale || 'de' as const,
    appearance: {
      theme: options.appearance?.theme || 'stripe' as const,
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        ...options.appearance?.variables
      },
      rules: {
        '.Input': {
          border: '1px solid #e6e6e6',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px'
        },
        '.Input:focus': {
          borderColor: '#0570de',
          boxShadow: '0 0 0 2px rgba(5, 112, 222, 0.1)'
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px',
          color: '#374151'
        }
      }
    }
  }

  const contextValue: PaymentContextType = {
    stripe,
    isLoading,
    error
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">Payment System Error</div>
          <div className="text-red-500 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <PaymentContext.Provider value={contextValue}>
      {stripe ? (
        <Elements stripe={stripe} options={elementsOptions}>
          {children}
        </Elements>
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading payment system...</span>
          </div>
        </div>
      )}
    </PaymentContext.Provider>
  )
}

// Stripe Elements wrapper for specific payment forms
export const StripeElementsWrapper: React.FC<{
  children: React.ReactNode
  clientSecret?: string
  options?: {
    locale?: 'de' | 'fr' | 'en' | 'pl'
    appearance?: {
      theme?: 'stripe' | 'night' | 'flat'
      variables?: Record<string, string>
    }
  }
}> = ({ children, clientSecret, options = {} }) => {
  const elementsOptions = {
    clientSecret,
    locale: options.locale || 'de' as const,
    appearance: {
      theme: options.appearance?.theme || 'stripe' as const,
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        ...options.appearance?.variables
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  )
}

export default PaymentProvider