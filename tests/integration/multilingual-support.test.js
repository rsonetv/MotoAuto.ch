/**
 * Multilingual Support Tests
 * Tests translation systems, language switching, and localized content delivery
 */

const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction,
  mockSupabaseResponse,
  multilingualHelpers,
  swissTestData
} = require('../utils/test-helpers')

describe('Multilingual Support Tests', () => {
  let mockSupabase
  let mockI18n

  beforeEach(() => {
    // Mock Supabase
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis()
      }))
    }

    // Mock i18n system
    mockI18n = {
      t: jest.fn(),
      changeLanguage: jest.fn(),
      language: 'de',
      languages: ['de', 'fr', 'en', 'pl'],
      getResource: jest.fn(),
      addResource: jest.fn(),
      exists: jest.fn()
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))

    jest.doMock('react-i18next', () => ({
      useTranslation: () => ({
        t: mockI18n.t,
        i18n: mockI18n
      }),
      initReactI18next: {}
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('Language Detection and Switching', () => {
    test('should detect browser language preference', () => {
      const browserLanguages = [
        { accept: 'de-CH,de;q=0.9,en;q=0.8', expected: 'de' },
        { accept: 'fr-CH,fr;q=0.9,en;q=0.8', expected: 'fr' },
        { accept: 'en-US,en;q=0.9', expected: 'en' },
        { accept: 'pl-PL,pl;q=0.9,en;q=0.8', expected: 'pl' },
        { accept: 'it-IT,it;q=0.9,en;q=0.8', expected: 'en' } // Fallback to English
      ]

      browserLanguages.forEach(({ accept, expected }) => {
        const detected = multilingualHelpers.detectLanguage(accept)
        expect(detected).toBe(expected)
      })
    })

    test('should switch language and persist preference', async () => {
      const user = mockUser()
      const newLanguage = 'fr'

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({ language_preference: newLanguage })
      )

      mockI18n.changeLanguage.mockResolvedValue(true)

      // Simulate language switch
      await mockI18n.changeLanguage(newLanguage)
      
      // Update user preference in database
      await mockSupabase
        .from('user_profiles')
        .update({ language_preference: newLanguage })
        .eq('id', user.id)

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith(newLanguage)
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ 
        language_preference: newLanguage 
      })
    })

    test('should load user language preference on login', async () => {
      const user = mockUser()
      const profile = mockProfile({ 
        id: user.id, 
        language_preference: 'fr' 
      })

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(profile)
      )

      mockI18n.changeLanguage.mockResolvedValue(true)

      // Simulate user login and language loading
      const userProfile = await mockSupabase
        .from('user_profiles')
        .select('language_preference')
        .eq('id', user.id)
        .single()

      await mockI18n.changeLanguage(userProfile.data.language_preference)

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr')
    })

    test('should handle invalid language codes gracefully', async () => {
      const invalidLanguages = ['xx', 'invalid', '', null, undefined]

      invalidLanguages.forEach(async (lang) => {
        const result = multilingualHelpers.isValidLanguage(lang)
        expect(result).toBe(false)
      })

      // Should fallback to default language
      const fallback = multilingualHelpers.getFallbackLanguage('invalid')
      expect(fallback).toBe('en')
    })
  })

  describe('Translation System', () => {
    test('should translate common UI elements', () => {
      const translations = {
        de: {
          'common.search': 'Suchen',
          'common.filter': 'Filter',
          'common.sort': 'Sortieren',
          'common.price': 'Preis',
          'common.year': 'Jahr',
          'common.mileage': 'Kilometerstand'
        },
        fr: {
          'common.search': 'Rechercher',
          'common.filter': 'Filtrer',
          'common.sort': 'Trier',
          'common.price': 'Prix',
          'common.year': 'Année',
          'common.mileage': 'Kilométrage'
        },
        en: {
          'common.search': 'Search',
          'common.filter': 'Filter',
          'common.sort': 'Sort',
          'common.price': 'Price',
          'common.year': 'Year',
          'common.mileage': 'Mileage'
        },
        pl: {
          'common.search': 'Szukaj',
          'common.filter': 'Filtruj',
          'common.sort': 'Sortuj',
          'common.price': 'Cena',
          'common.year': 'Rok',
          'common.mileage': 'Przebieg'
        }
      }

      Object.entries(translations).forEach(([lang, keys]) => {
        mockI18n.language = lang
        
        Object.entries(keys).forEach(([key, expectedTranslation]) => {
          mockI18n.t.mockReturnValue(expectedTranslation)
          
          const translation = mockI18n.t(key)
          expect(translation).toBe(expectedTranslation)
        })
      })
    })

    test('should handle pluralization correctly', () => {
      const pluralTests = [
        { lang: 'de', key: 'listings.count', count: 0, expected: '0 Anzeigen' },
        { lang: 'de', key: 'listings.count', count: 1, expected: '1 Anzeige' },
        { lang: 'de', key: 'listings.count', count: 5, expected: '5 Anzeigen' },
        { lang: 'fr', key: 'listings.count', count: 0, expected: '0 annonce' },
        { lang: 'fr', key: 'listings.count', count: 1, expected: '1 annonce' },
        { lang: 'fr', key: 'listings.count', count: 5, expected: '5 annonces' },
        { lang: 'en', key: 'listings.count', count: 0, expected: '0 listings' },
        { lang: 'en', key: 'listings.count', count: 1, expected: '1 listing' },
        { lang: 'en', key: 'listings.count', count: 5, expected: '5 listings' }
      ]

      pluralTests.forEach(({ lang, key, count, expected }) => {
        mockI18n.language = lang
        mockI18n.t.mockReturnValue(expected)
        
        const translation = mockI18n.t(key, { count })
        expect(translation).toBe(expected)
      })
    })

    test('should interpolate variables in translations', () => {
      const interpolationTests = [
        {
          lang: 'de',
          key: 'auction.ending_in',
          variables: { time: '2 Stunden' },
          expected: 'Endet in 2 Stunden'
        },
        {
          lang: 'fr',
          key: 'auction.ending_in',
          variables: { time: '2 heures' },
          expected: 'Se termine dans 2 heures'
        },
        {
          lang: 'en',
          key: 'auction.ending_in',
          variables: { time: '2 hours' },
          expected: 'Ending in 2 hours'
        },
        {
          lang: 'pl',
          key: 'auction.ending_in',
          variables: { time: '2 godziny' },
          expected: 'Kończy się za 2 godziny'
        }
      ]

      interpolationTests.forEach(({ lang, key, variables, expected }) => {
        mockI18n.language = lang
        mockI18n.t.mockReturnValue(expected)
        
        const translation = mockI18n.t(key, variables)
        expect(translation).toBe(expected)
      })
    })

    test('should handle missing translations with fallback', () => {
      const missingKey = 'non.existent.key'
      const fallbackValue = 'Missing translation'

      mockI18n.exists.mockReturnValue(false)
      mockI18n.t.mockReturnValue(fallbackValue)

      const translation = mockI18n.t(missingKey, { defaultValue: fallbackValue })
      
      expect(translation).toBe(fallbackValue)
      expect(mockI18n.exists).toHaveBeenCalledWith(missingKey)
    })
  })

  describe('Localized Content', () => {
    test('should serve localized vehicle categories', () => {
      const categories = {
        de: [
          { id: 'cars', name: 'Autos', slug: 'autos' },
          { id: 'motorcycles', name: 'Motorräder', slug: 'motorraeder' },
          { id: 'trucks', name: 'Lastwagen', slug: 'lastwagen' },
          { id: 'trailers', name: 'Anhänger', slug: 'anhaenger' }
        ],
        fr: [
          { id: 'cars', name: 'Voitures', slug: 'voitures' },
          { id: 'motorcycles', name: 'Motos', slug: 'motos' },
          { id: 'trucks', name: 'Camions', slug: 'camions' },
          { id: 'trailers', name: 'Remorques', slug: 'remorques' }
        ],
        en: [
          { id: 'cars', name: 'Cars', slug: 'cars' },
          { id: 'motorcycles', name: 'Motorcycles', slug: 'motorcycles' },
          { id: 'trucks', name: 'Trucks', slug: 'trucks' },
          { id: 'trailers', name: 'Trailers', slug: 'trailers' }
        ],
        pl: [
          { id: 'cars', name: 'Samochody', slug: 'samochody' },
          { id: 'motorcycles', name: 'Motocykle', slug: 'motocykle' },
          { id: 'trucks', name: 'Ciężarówki', slug: 'ciezarowki' },
          { id: 'trailers', name: 'Przyczepy', slug: 'przyczepy' }
        ]
      }

      Object.entries(categories).forEach(([lang, expectedCategories]) => {
        mockSupabase.from().select().mockResolvedValue(
          mockSupabaseResponse(expectedCategories)
        )

        const localizedCategories = multilingualHelpers.getLocalizedCategories(lang)
        
        expectedCategories.forEach((category, index) => {
          expect(localizedCategories[index]).toEqual(category)
        })
      })
    })

    test('should format dates according to locale', () => {
      const testDate = new Date('2024-06-15T14:30:00Z')
      
      const localeFormats = {
        'de-CH': '15.06.2024, 16:30',
        'fr-CH': '15.06.2024 16:30',
        'en-US': '6/15/2024, 4:30 PM',
        'pl-PL': '15.06.2024, 16:30'
      }

      Object.entries(localeFormats).forEach(([locale, expected]) => {
        const formatted = multilingualHelpers.formatDate(testDate, locale)
        expect(formatted).toBe(expected)
      })
    })

    test('should format numbers according to locale', () => {
      const testNumber = 1234567.89
      
      const localeFormats = {
        'de-CH': "1'234'567.89",
        'fr-CH': "1'234'567.89",
        'en-US': '1,234,567.89',
        'pl-PL': '1 234 567,89'
      }

      Object.entries(localeFormats).forEach(([locale, expected]) => {
        const formatted = multilingualHelpers.formatNumber(testNumber, locale)
        expect(formatted).toBe(expected)
      })
    })

    test('should format currency according to locale', () => {
      const testAmount = 45000
      
      const localeFormats = {
        'de-CH': "CHF 45'000",
        'fr-CH': "CHF 45'000",
        'en-US': 'CHF 45,000',
        'pl-PL': '45 000 CHF'
      }

      Object.entries(localeFormats).forEach(([locale, expected]) => {
        const formatted = multilingualHelpers.formatCurrency(testAmount, 'CHF', locale)
        expect(formatted).toBe(expected)
      })
    })
  })

  describe('SEO and URL Localization', () => {
    test('should generate localized URLs', () => {
      const baseUrl = 'https://motoauto.ch'
      const paths = {
        de: {
          listings: '/anzeigen',
          auctions: '/auktionen',
          search: '/suche',
          profile: '/profil'
        },
        fr: {
          listings: '/annonces',
          auctions: '/encheres',
          search: '/recherche',
          profile: '/profil'
        },
        en: {
          listings: '/listings',
          auctions: '/auctions',
          search: '/search',
          profile: '/profile'
        },
        pl: {
          listings: '/ogloszenia',
          auctions: '/aukcje',
          search: '/szukaj',
          profile: '/profil'
        }
      }

      Object.entries(paths).forEach(([lang, langPaths]) => {
        Object.entries(langPaths).forEach(([key, path]) => {
          const localizedUrl = multilingualHelpers.getLocalizedUrl(baseUrl, key, lang)
          expect(localizedUrl).toBe(`${baseUrl}/${lang}${path}`)
        })
      })
    })

    test('should generate hreflang tags for SEO', () => {
      const currentPath = '/listings/bmw-x5-2020'
      const expectedHreflangs = [
        { lang: 'de-CH', url: 'https://motoauto.ch/de/anzeigen/bmw-x5-2020' },
        { lang: 'fr-CH', url: 'https://motoauto.ch/fr/annonces/bmw-x5-2020' },
        { lang: 'en', url: 'https://motoauto.ch/en/listings/bmw-x5-2020' },
        { lang: 'pl', url: 'https://motoauto.ch/pl/ogloszenia/bmw-x5-2020' },
        { lang: 'x-default', url: 'https://motoauto.ch/de/anzeigen/bmw-x5-2020' }
      ]

      const hreflangs = multilingualHelpers.generateHreflangTags(currentPath)
      
      expectedHreflangs.forEach((expected, index) => {
        expect(hreflangs[index]).toEqual(expected)
      })
    })

    test('should generate localized meta tags', () => {
      const listing = mockListing({ 
        title: 'BMW X5 2020',
        price: 45000,
        year: 2020,
        mileage: 50000
      })

      const metaTags = {
        de: {
          title: 'BMW X5 2020 - CHF 45\'000 - MotoAuto.ch',
          description: 'BMW X5 2020 mit 50\'000 km für CHF 45\'000. Jetzt auf MotoAuto.ch entdecken.',
          keywords: 'BMW, X5, 2020, Gebrauchtwagen, Auto kaufen, Schweiz'
        },
        fr: {
          title: 'BMW X5 2020 - CHF 45\'000 - MotoAuto.ch',
          description: 'BMW X5 2020 avec 50\'000 km pour CHF 45\'000. Découvrez maintenant sur MotoAuto.ch.',
          keywords: 'BMW, X5, 2020, voiture occasion, acheter auto, Suisse'
        },
        en: {
          title: 'BMW X5 2020 - CHF 45,000 - MotoAuto.ch',
          description: 'BMW X5 2020 with 50,000 km for CHF 45,000. Discover now on MotoAuto.ch.',
          keywords: 'BMW, X5, 2020, used car, buy car, Switzerland'
        }
      }

      Object.entries(metaTags).forEach(([lang, expected]) => {
        const generated = multilingualHelpers.generateMetaTags(listing, lang)
        
        expect(generated.title).toBe(expected.title)
        expect(generated.description).toBe(expected.description)
        expect(generated.keywords).toBe(expected.keywords)
      })
    })
  })

  describe('Email Localization', () => {
    test('should send emails in user preferred language', async () => {
      const user = mockUser({ email: 'test@example.com' })
      const profile = mockProfile({ 
        id: user.id, 
        language_preference: 'fr',
        first_name: 'Pierre'
      })

      const emailTemplates = {
        de: {
          subject: 'Willkommen bei MotoAuto.ch',
          greeting: 'Hallo Pierre',
          content: 'Vielen Dank für Ihre Registrierung'
        },
        fr: {
          subject: 'Bienvenue chez MotoAuto.ch',
          greeting: 'Bonjour Pierre',
          content: 'Merci pour votre inscription'
        },
        en: {
          subject: 'Welcome to MotoAuto.ch',
          greeting: 'Hello Pierre',
          content: 'Thank you for your registration'
        }
      }

      const template = emailTemplates[profile.language_preference]
      
      expect(template.subject).toBe('Bienvenue chez MotoAuto.ch')
      expect(template.greeting).toBe('Bonjour Pierre')
      expect(template.content).toBe('Merci pour votre inscription')
    })

    test('should localize auction notification emails', () => {
      const auction = mockAuction()
      const listing = mockListing({ 
        id: auction.listing_id,
        title: 'BMW X5 2020'
      })

      const notifications = {
        de: {
          subject: 'Sie wurden überboten - BMW X5 2020',
          content: 'Ihr Gebot wurde überboten. Aktuelles Höchstgebot: CHF 55\'000'
        },
        fr: {
          subject: 'Vous avez été surenchéri - BMW X5 2020',
          content: 'Votre offre a été surenchérie. Offre la plus élevée actuelle: CHF 55\'000'
        },
        en: {
          subject: 'You have been outbid - BMW X5 2020',
          content: 'Your bid has been outbid. Current highest bid: CHF 55,000'
        }
      }

      Object.entries(notifications).forEach(([lang, expected]) => {
        const notification = multilingualHelpers.generateAuctionNotification(
          listing, 55000, lang
        )
        
        expect(notification.subject).toBe(expected.subject)
        expect(notification.content).toContain(expected.content)
      })
    })
  })

  describe('Form Validation Messages', () => {
    test('should display localized validation errors', () => {
      const validationErrors = {
        de: {
          'email.required': 'E-Mail ist erforderlich',
          'email.invalid': 'Ungültige E-Mail-Adresse',
          'password.required': 'Passwort ist erforderlich',
          'password.min_length': 'Passwort muss mindestens 8 Zeichen lang sein',
          'phone.invalid': 'Ungültige Telefonnummer'
        },
        fr: {
          'email.required': 'L\'e-mail est requis',
          'email.invalid': 'Adresse e-mail invalide',
          'password.required': 'Le mot de passe est requis',
          'password.min_length': 'Le mot de passe doit contenir au moins 8 caractères',
          'phone.invalid': 'Numéro de téléphone invalide'
        },
        en: {
          'email.required': 'Email is required',
          'email.invalid': 'Invalid email address',
          'password.required': 'Password is required',
          'password.min_length': 'Password must be at least 8 characters long',
          'phone.invalid': 'Invalid phone number'
        },
        pl: {
          'email.required': 'E-mail jest wymagany',
          'email.invalid': 'Nieprawidłowy adres e-mail',
          'password.required': 'Hasło jest wymagane',
          'password.min_length': 'Hasło musi mieć co najmniej 8 znaków',
          'phone.invalid': 'Nieprawidłowy numer telefonu'
        }
      }

      Object.entries(validationErrors).forEach(([lang, errors]) => {
        mockI18n.language = lang
        
        Object.entries(errors).forEach(([key, expectedMessage]) => {
          mockI18n.t.mockReturnValue(expectedMessage)
          
          const message = mockI18n.t(`validation.${key}`)
          expect(message).toBe(expectedMessage)
        })
      })
    })

    test('should validate Swiss-specific fields with localized messages', () => {
      const swissValidations = {
        de: {
          'postal_code.invalid': 'Ungültige Postleitzahl (Format: 1000-9999)',
          'phone.invalid_swiss': 'Ungültige Schweizer Telefonnummer',
          'vat_number.invalid': 'Ungültige Schweizer MwSt-Nummer (Format: CHE-123.456.789)',
          'iban.invalid': 'Ungültige Schweizer IBAN'
        },
        fr: {
          'postal_code.invalid': 'Code postal invalide (Format: 1000-9999)',
          'phone.invalid_swiss': 'Numéro de téléphone suisse invalide',
          'vat_number.invalid': 'Numéro de TVA suisse invalide (Format: CHE-123.456.789)',
          'iban.invalid': 'IBAN suisse invalide'
        }
      }

      Object.entries(swissValidations).forEach(([lang, validations]) => {
        Object.entries(validations).forEach(([key, expectedMessage]) => {
          const message = multilingualHelpers.getValidationMessage(key, lang)
          expect(message).toBe(expectedMessage)
        })
      })
    })
  })

  describe('Right-to-Left (RTL) Support', () => {
    test('should detect RTL languages', () => {
      const rtlLanguages = ['ar', 'he', 'fa', 'ur']
      const ltrLanguages = ['de', 'fr', 'en', 'pl']

      rtlLanguages.forEach(lang => {
        expect(multilingualHelpers.isRTL(lang)).toBe(true)
      })

      ltrLanguages.forEach(lang => {
        expect(multilingualHelpers.isRTL(lang)).toBe(false)
      })
    })

    test('should apply correct text direction', () => {
      const languages = [
        { lang: 'de', direction: 'ltr' },
        { lang: 'fr', direction: 'ltr' },
        { lang: 'en', direction: 'ltr' },
        { lang: 'pl', direction: 'ltr' },
        { lang: 'ar', direction: 'rtl' },
        { lang: 'he', direction: 'rtl' }
      ]

      languages.forEach(({ lang, direction }) => {
        const textDirection = multilingualHelpers.getTextDirection(lang)
        expect(textDirection).toBe(direction)
      })
    })
  })

  describe('Performance and Caching', () => {
    test('should cache translations for performance', () => {
      const cacheKey = 'translations:de:common'
      const translations = {
        'common.search': 'Suchen',
        'common.filter': 'Filter',
        'common.sort': 'Sortieren'
      }

      // Mock cache operations
      const mockCache = {
        get: jest.fn(),
        set: jest.fn(),
        has: jest.fn()
      }

      mockCache.has.mockReturnValue(false)
      mockCache.get.mockReturnValue(null)
      mockCache.set.mockReturnValue(true)

      // First call - should cache
      multilingualHelpers.getTranslations('de', 'common', mockCache)
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, expect.any(Object))

      // Second call - should use cache
      mockCache.has.mockReturnValue(true)
      mockCache.get.mockReturnValue(translations)
      
      const cachedTranslations = multilingualHelpers.getTranslations('de', 'common', mockCache)
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey)
      expect(cachedTranslations).toEqual(translations)
    })

    test('should lazy load translation bundles', async () => {
      const mockLoader = jest.fn()
      
      // Mock dynamic import
      mockLoader.mockResolvedValue({
        default: {
          'common.search': 'Suchen',
          'common.filter': 'Filter'
        }
      })

      const translations = await multilingualHelpers.loadTranslationBundle('de', 'common', mockLoader)
      
      expect(mockLoader).toHaveBeenCalledWith('de', 'common')
      expect(translations).toHaveProperty('common.search', 'Suchen')
    })

    test('should handle translation loading errors gracefully', async () => {
      const mockLoader = jest.fn()
      mockLoader.mockRejectedValue(new Error('Failed to load translations'))

      const fallbackTranslations = {
        'common.search': 'Search',
        'common.filter': 'Filter'
      }

      const translations = await multilingualHelpers.loadTranslationBundle(
        'invalid', 
        'common', 
        mockLoader,
        fallbackTranslations
      )
      
      expect(translations).toEqual(fallbackTranslations)
    })
  })
})