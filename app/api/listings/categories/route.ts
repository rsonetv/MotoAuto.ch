import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  createErrorResponse,
  createSuccessResponse
} from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

type CategoryWithChildren = Database['public']['Tables']['categories']['Row'] & {
  children?: CategoryWithChildren[]
  listing_count?: number
}

/**
 * GET /api/listings/categories
 * Get all categories for filtering with hierarchical structure and listing counts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const includeCounts = searchParams.get('include_counts') === 'true'
    const language = searchParams.get('lang') || 'en'
    
    const supabase = await createServerComponentClient(request)

    // Build base query
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    // Filter by active status unless explicitly requested
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Error fetching categories:', error)
      return createErrorResponse('Failed to fetch categories', 500)
    }

    if (!categories) {
      return createSuccessResponse([], 200)
    }

    // Get listing counts if requested
    let listingCounts: Record<string, number> = {}
    if (includeCounts) {
      const { data: counts, error: countsError } = await supabase
        .from('listings')
        .select('category_id')
        .eq('status', 'active')

      if (!countsError && counts) {
        listingCounts = counts.reduce((acc: Record<string, number>, listing) => {
          acc[listing.category_id] = (acc[listing.category_id] || 0) + 1
          return acc
        }, {})
      }
    }

    // Build hierarchical structure
    const categoryMap = new Map<string, CategoryWithChildren>()
    const rootCategories: CategoryWithChildren[] = []

    // First pass: create all category objects
    categories.forEach(category => {
      const categoryWithChildren: CategoryWithChildren = {
        ...category,
        children: [],
        ...(includeCounts && { listing_count: listingCounts[category.id] || 0 })
      }
      categoryMap.set(category.id, categoryWithChildren)
    })

    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.children!.push(categoryWithChildren)
        } else {
          // Parent not found or inactive, treat as root
          rootCategories.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    // Helper function to get localized name
    const getLocalizedName = (category: CategoryWithChildren, lang: string): string => {
      switch (lang) {
        case 'de':
          return category.name_de
        case 'fr':
          return category.name_fr
        case 'pl':
          return category.name_pl
        default:
          return category.name_en
      }
    }

    // Helper function to get localized description
    const getLocalizedDescription = (category: CategoryWithChildren, lang: string): string | null => {
      switch (lang) {
        case 'de':
          return category.description_de
        case 'fr':
          return category.description_fr
        case 'pl':
          return category.description_pl
        default:
          return category.description_en
      }
    }

    // Transform categories for response (add localized fields)
    const transformCategory = (category: CategoryWithChildren): any => ({
      id: category.id,
      name: getLocalizedName(category, language),
      slug: category.slug,
      parent_id: category.parent_id,
      description: getLocalizedDescription(category, language),
      icon: category.icon,
      sort_order: category.sort_order,
      is_active: category.is_active,
      ...(includeCounts && { listing_count: category.listing_count || 0 }),
      children: category.children?.map(transformCategory) || [],
      // Include all language variants for reference
      names: {
        en: category.name_en,
        de: category.name_de,
        fr: category.name_fr,
        pl: category.name_pl
      },
      descriptions: {
        en: category.description_en,
        de: category.description_de,
        fr: category.description_fr,
        pl: category.description_pl
      }
    })

    const transformedCategories = rootCategories.map(transformCategory)

    // Also provide a flat list for easier filtering
    const flatCategories = categories.map(category => ({
      id: category.id,
      name: getLocalizedName(category, language),
      slug: category.slug,
      parent_id: category.parent_id,
      description: getLocalizedDescription(category, language),
      icon: category.icon,
      sort_order: category.sort_order,
      is_active: category.is_active,
      ...(includeCounts && { listing_count: listingCounts[category.id] || 0 }),
      names: {
        en: category.name_en,
        de: category.name_de,
        fr: category.name_fr,
        pl: category.name_pl
      }
    }))

    return createSuccessResponse(
      {
        hierarchical: transformedCategories,
        flat: flatCategories,
        total_categories: categories.length,
        active_categories: categories.filter(c => c.is_active).length,
        ...(includeCounts && {
          total_listings: Object.values(listingCounts).reduce((sum, count) => sum + count, 0)
        })
      },
      200,
      {
        language,
        include_inactive: includeInactive,
        include_counts: includeCounts
      }
    )

  } catch (error) {
    console.error('Unexpected error in GET /api/listings/categories:', error)
    return createErrorResponse('Internal server error', 500)
  }
}