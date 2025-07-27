import { NextRequest, NextResponse } from "next/server"
import { createSuccessResponse, createErrorResponse } from "@/lib/auth-middleware"
import { getCategoryTranslations } from "@/lib/i18n/contact-translations"

/**
 * GET /api/contact/categories
 * Get available contact categories with multilingual support
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'de'

    // Get all contact categories with translations
    const categories = getCategoryTranslations()

    // Add icons for categories
    const categoriesWithIcons = categories.map(category => ({
      ...category,
      icon: getCategoryIcon(category.key)
    }))

    return createSuccessResponse({
      categories: categoriesWithIcons,
      meta: {
        total: categories.length,
        language,
        supported_languages: ['de', 'fr', 'pl', 'en']
      }
    })

  } catch (error) {
    console.error('Contact categories error:', error)
    return createErrorResponse(
      'Failed to load contact categories',
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}

/**
 * Get icon for contact category
 */
function getCategoryIcon(categoryKey: string): string {
  const icons: Record<string, string> = {
    'general_inquiry': '❓',
    'listing_inquiry': '🚗',
    'technical_support': '🔧',
    'billing_support': '💳',
    'account_issues': '👤',
    'partnership': '🤝',
    'legal_compliance': '⚖️'
  }
  
  return icons[categoryKey] || '📧'
}