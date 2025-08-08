import { type Locale, localeMetadata } from '../../types/i18n';

/**
 * Get locale metadata for a given locale
 */
export function getLocaleMetadata(locale: Locale) {
  return localeMetadata[locale];
}

/**
 * Format currency according to Swiss standards
 */
export function formatCurrency(
  amount: number,
  locale: Locale = 'de',
  currency: 'CHF' | 'EUR' | 'USD' = 'CHF'
): string {
  const localeMap: Record<Locale, string> = {
    pl: 'pl-CH',
    de: 'de-CH', 
    fr: 'fr-CH',
    en: 'en-CH',
    it: 'it-CH'
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'CHF' ? 2 : 2,
    maximumFractionDigits: currency === 'CHF' ? 2 : 2
  }).format(amount);
}

/**
 * Format date according to Swiss locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale = 'de',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const localeMap: Record<Locale, string> = {
    pl: 'pl-CH',
    de: 'de-CH',
    fr: 'fr-CH', 
    en: 'en-CH',
    it: 'it-CH'
  };

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Zurich',
    ...options
  };

  return new Intl.DateTimeFormat(localeMap[locale], defaultOptions).format(
    new Date(date)
  );
}

/**
 * Get browser locale preference that matches our supported locales
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'pl';

  const browserLangs = navigator.languages || [navigator.language];
  const supportedLocales = ['pl', 'de', 'fr', 'en', 'it'];

  for (const lang of browserLangs) {
    const langCode = lang.split('-')[0].toLowerCase();
    if (supportedLocales.includes(langCode)) {
      return langCode as Locale;
    }
  }

  return 'pl'; // fallback
}

/**
 * Generate hreflang attributes for SEO
 */
export function generateHreflangLinks(pathname: string): Array<{
  hreflang: string;
  href: string;
}> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://motoauto.ch';

  return Object.values(localeMetadata).map(({ code }) => ({
    hreflang: code === 'pl' ? 'x-default' : code,
    href: code === 'pl' ? `${baseUrl}${pathname}` : `${baseUrl}/${code}${pathname}`
  }));
}