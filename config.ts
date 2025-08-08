import { Pathnames, LocalePrefix } from 'next-intl/routing';

export const defaultLocale = 'pl' as const;
export const locales = ['pl', 'de', 'fr', 'en', 'it'] as const;

export type Locale = (typeof locales)[number];

export const pathnames = {
  '/': '/',
  '/cennik': {
    pl: '/cennik',
    de: '/preise',
    fr: '/prix',
    en: '/pricing',
    it: '/prezzi'
  },
  '/faq': {
    pl: '/faq',
    de: '/faq',
    fr: '/faq',
    en: '/faq',
    it: '/faq'
  },
  '/regulamin': {
    pl: '/regulamin',
    de: '/nutzungsbedingungen',
    fr: '/conditions-generales',
    en: '/terms-of-service',
    it: '/termini-di-servizio'
  },
  '/polityka-prywatnosci': {
    pl: '/polityka-prywatnosci',
    de: '/datenschutzrichtlinie',
    fr: '/politique-confidentialite',
    en: '/privacy-policy',
    it: '/informativa-sulla-privacy'
  },
  '/kontakt': {
    pl: '/kontakt',
    de: '/kontakt',
    fr: '/contact',
    en: '/contact',
    it: '/contatto'
  },
  '/dashboard': '/dashboard',
  '/dashboard/payments': '/dashboard/payments',
  '/dashboard/listings': '/dashboard/listings',
  '/ogloszenia': {
    pl: '/ogloszenia',
    de: '/anzeigen',
    fr: '/annonces',
    en: '/listings',
    it: '/annunci'
  },
  '/aukcje': {
    pl: '/aukcje',
    de: '/auktionen',
    fr: '/encheres',
    en: '/auctions',
    it: '/aste'
  },
  '/watchlist': {
    pl: '/obserwowane',
    de: '/merkliste',
    fr: '/favoris',
    en: '/watchlist',
    it: '/preferiti'
  }
} satisfies Pathnames<typeof locales>;

// Use the default: `as-needed` - only show locale in URL when not default
export const localePrefix: LocalePrefix<typeof locales> = 'as-needed';

export type AppPathnames = keyof typeof pathnames;

// Swiss-specific configuration
export const swissConfig = {
  timezone: 'Europe/Zurich',
  currency: 'CHF',
  phonePrefix: '+41',
  postalCodePattern: /^[1-9][0-9]{3}$/,
  cantons: [
    'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
    'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
    'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
  ]
};