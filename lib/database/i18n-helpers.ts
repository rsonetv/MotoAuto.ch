import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database-i18n';
import type { Locale } from '../../types/i18n';

// Initialize Supabase client with enhanced types
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get translation from JSONB field with fallback logic
 */
export function getTranslation(
  translations: Record<string, string> | null,
  locale: Locale,
  fallbackLocale: Locale = 'pl'
): string {
  if (!translations || typeof translations !== 'object') {
    return '';
  }

  // Try requested locale first
  if (translations[locale] && translations[locale].trim()) {
    return translations[locale];
  }

  // Try fallback locale
  if (translations[fallbackLocale] && translations[fallbackLocale].trim()) {
    return translations[fallbackLocale];
  }

  // Try any available translation
  const availableLocales = Object.keys(translations);
  for (const availableLocale of availableLocales) {
    if (translations[availableLocale] && translations[availableLocale].trim()) {
      return translations[availableLocale];
    }
  }

  return '';
}

/**
 * Set translation in JSONB field
 */
export function setTranslation(
  translations: Record<string, string> | null,
  locale: Locale,
  value: string
): Record<string, string> {
  const current = translations || {};
  return {
    ...current,
    [locale]: value.trim()
  };
}

/**
 * Get all translations for a field
 */
export function getAllTranslations(
  translations: Record<string, string> | null
): Record<Locale, string> {
  const defaultTranslations: Record<Locale, string> = {
    pl: '',
    de: '',
    fr: '',
    en: '',
    it: ''
  };

  if (!translations || typeof translations !== 'object') {
    return defaultTranslations;
  }

  return {
    pl: translations.pl || '',
    de: translations.de || '',
    fr: translations.fr || '',
    en: translations.en || '',
    it: translations.it || ''
  };
}

/**
 * Check if translation exists for locale
 */
export function hasTranslation(
  translations: Record<string, string> | null,
  locale: Locale
): boolean {
  if (!translations || typeof translations !== 'object') {
    return false;
  }
  return Boolean(translations[locale] && translations[locale].trim());
}

/**
 * Get translation completeness percentage
 */
export function getTranslationCompleteness(
  translations: Record<string, string> | null
): number {
  if (!translations || typeof translations !== 'object') {
    return 0;
  }

  const locales: Locale[] = ['pl', 'de', 'fr', 'en', 'it'];
  const completedCount = locales.filter(locale => 
    translations[locale] && translations[locale].trim()
  ).length;

  return Math.round((completedCount / locales.length) * 100);
}

/**
 * Get localized listings with translations
 */
export async function getLocalizedListings(
  locale: Locale = 'pl',
  filters?: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    year?: number;
    brand?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from('listings')
    .select(`
      *,
      categories (
        id,
        name_translations,
        slug
      )
    `);

  // Apply filters
  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters?.priceMin) {
    query = query.gte('price', filters.priceMin);
  }
  if (filters?.priceMax) {
    query = query.lte('price', filters.priceMax);
  }
  if (filters?.year) {
    query = query.eq('year', filters.year);
  }
  if (filters?.brand) {
    query = query.ilike('brand', `%${filters.brand}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Process translations
  return data?.map(listing => ({
    ...listing,
    title: getTranslation(listing.title_translations, locale),
    description: getTranslation(listing.description_translations, locale),
    category_name: listing.categories 
      ? getTranslation(listing.categories.name_translations, locale)
      : '',
  })) || [];
}

/**
 * Get localized categories
 */
export async function getLocalizedCategories(locale: Locale = 'pl') {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) {
    throw error;
  }

  return data?.map(category => ({
    ...category,
    name: getTranslation(category.name_translations, locale),
    description: getTranslation(category.description_translations, locale),
  })) || [];
}

/**
 * Update listing translations
 */
export async function updateListingTranslations(
  listingId: string,
  field: 'title' | 'description',
  locale: Locale,
  value: string
) {
  // First, get current translations
  const { data: currentData, error: fetchError } = await supabase
    .from('listings')
    .select(`${field}_translations`)
    .eq('id', listingId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Update translations
  const fieldTranslations = (currentData as any)[`${field}_translations`];

  const updatedTranslations = setTranslation(fieldTranslations, locale, value);

  // Save back to database
  const updateField = field === 'title' ? 'title_translations' : 'description_translations';

  const { data, error } = await supabase
    .from('listings')
    .update({ [updateField]: updatedTranslations })
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Search listings with translation support
 */
export async function searchListings(
  searchTerm: string,
  locale: Locale = 'pl',
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  // Use PostgreSQL full-text search
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      categories (
        id,
        name_translations,
        slug
      )
    `)
    .or(`title_translations->>${locale}.ilike.%${searchTerm}%,description_translations->>${locale}.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
    .limit(options?.limit || 20)
    .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20) - 1);

  if (error) {
    throw error;
  }

  return data?.map(listing => ({
    ...listing,
    title: getTranslation(listing.title_translations, locale),
    description: getTranslation(listing.description_translations, locale),
    category_name: listing.categories 
      ? getTranslation(listing.categories.name_translations, locale)
      : '',
  })) || [];
}

/**
 * Get translation statistics for admin dashboard
 */
export async function getTranslationStats() {
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('title_translations, description_translations');

  if (listingsError) {
    throw listingsError;
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('name_translations, description_translations');

  if (categoriesError) {
    throw categoriesError;
  }

  // Calculate statistics
  const locales: Locale[] = ['pl', 'de', 'fr', 'en', 'it'];
  const stats = locales.map(locale => {
    const listingTitles = listings?.filter(l => hasTranslation(l.title_translations, locale)).length || 0;
    const listingDescriptions = listings?.filter(l => hasTranslation(l.description_translations, locale)).length || 0;
    const categoryNames = categories?.filter(c => hasTranslation(c.name_translations, locale)).length || 0;
    const categoryDescriptions = categories?.filter(c => hasTranslation(c.description_translations, locale)).length || 0;

    const totalPossible = (listings?.length || 0) * 2 + (categories?.length || 0) * 2;
    const totalCompleted = listingTitles + listingDescriptions + categoryNames + categoryDescriptions;

    return {
      locale,
      completeness: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
      details: {
        listingTitles,
        listingDescriptions,
        categoryNames,
        categoryDescriptions
      }
    };
  });

  return stats;
}

export { supabase };