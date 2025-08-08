import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['pl', 'de', 'fr', 'en', 'it'],

  // Used when no locale matches
  defaultLocale: 'pl',

  // The pathnames object holds pairs of internal and external paths
  pathnames: {
    // If all locales use the same pathname, a single external path can be provided for all locales
    '/': '/',
    '/dashboard': '/dashboard',
    '/watchlist': '/watchlist',

    // If locales use different paths, you can specify each external path per locale
    '/cennik': {
      pl: '/cennik',
      de: '/preise', 
      fr: '/prix',
      en: '/pricing',
      it: '/prezzi'
    },
    '/faq': '/faq',
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
    }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);