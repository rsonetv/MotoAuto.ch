'use client'

import React, { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  Award, 
  Phone, 
  Mail, 
  Clock,
  ChevronRight,
  Info,
  Calculator,
  Globe
} from 'lucide-react'
import { formatSwissAmount, calculateSwissVAT } from '@/lib/stripe'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { Package } from '@/lib/database.types'

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Cennik - Pakiety i Ceny | MotoAuto.ch',
  description: 'Sprawdź nasze konkurencyjne ceny pakietów dla sprzedaży samochodów i motocykli w Szwajcarii. Pakiety Free, Premium i Dealer z przejrzystymi cenami w CHF.',
  keywords: ['cennik', 'pakiety', 'ceny', 'samochody', 'motocykle', 'sprzedaż', 'Szwajcaria', 'CHF', 'VAT'],
  openGraph: {
    title: 'Cennik - Pakiety i Ceny | MotoAuto.ch',
    description: 'Sprawdź nasze konkurencyjne ceny pakietów dla sprzedaży samochodów i motocykli w Szwajcarii.',
    url: 'https://motoauto.ch/cennik',
    siteName: 'MotoAuto.ch',
    locale: 'pl_PL',
    type: 'website',
  },
  alternates: {
    canonical: 'https://motoauto.ch/cennik',
    languages: {
      'pl': 'https://motoauto.ch/cennik',
      'de': 'https://motoauto.ch/de/preise',
      'fr': 'https://motoauto.ch/fr/prix',
      'en': 'https://motoauto.ch/en/pricing'
    }
  }
}

// Language type
type Language = 'pl' | 'de' | 'fr' | 'en'

// Package data structure
interface PackageData {
  id: string
  name: string
  price: number
  duration: number
  maxImages: number
  features: string[]
  isPopular?: boolean
  isRecommended?: boolean
  icon: React.ReactNode
  color: string
}

// Predefined packages
const predefinedPackages: Record<string, PackageData> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: 30,
    maxImages: 5,
    features: ['firstListingFree', 'basicSupport', 'standardPlacement'],
    icon: <Check className="h-6 w-6" />,
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 29.90,
    duration: 60,
    maxImages: 15,
    features: ['featuredPlacement', 'prioritySupport', 'basicAnalytics', 'extendedDuration'],
    isPopular: true,
    icon: <Star className="h-6 w-6" />,
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  dealer: {
    id: 'dealer',
    name: 'Dealer',
    price: 99.90,
    duration: 90,
    maxImages: 50,
    features: ['unlimitedListings', 'topPlacement', 'dedicatedSupport', 'advancedAnalytics', 'dealerBadge', 'bulkListingTools'],
    isRecommended: true,
    icon: <Crown className="h-6 w-6" />,
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  }
}

// Translations
const translations = {
  pl: {
    title: 'Cennik - Pakiety i Ceny | MotoAuto.ch',
    description: 'Sprawdź nasze konkurencyjne ceny pakietów dla sprzedaży samochodów i motocykli w Szwajcarii.',
    heroTitle: 'Wybierz Idealny Pakiet dla Siebie',
    heroSubtitle: 'Przejrzyste ceny, bez ukrytych kosztów. Wszystkie ceny zawierają szwajcarski VAT 7.7%',
    heroDescription: 'Od darmowych ogłoszeń dla użytkowników prywatnych po zaawansowane narzędzia dla dealerów.',
    
    freePackage: 'Darmowy',
    premiumPackage: 'Premium', 
    dealerPackage: 'Dealer',
    
    freeDescription: 'Idealne dla użytkowników prywatnych sprzedających okazjonalnie',
    premiumDescription: 'Najlepszy wybór dla aktywnych sprzedawców prywatnych',
    dealerDescription: 'Profesjonalne narzędzia dla dealerów i firm motoryzacyjnych',
    
    features: 'Funkcje',
    duration: 'Czas trwania',
    maxImages: 'Maksymalnie zdjęć',
    days: 'dni',
    chf: 'CHF',
    free: 'Darmowy',
    popular: 'Popularne',
    recommended: 'Polecane',
    choosePackage: 'Wybierz pakiet',
    getStarted: 'Rozpocznij',
    contactSales: 'Skontaktuj się z działem sprzedaży',
    
    // Features
    firstListingFree: 'Pierwsze ogłoszenie darmowe',
    basicSupport: 'Podstawowe wsparcie',
    standardPlacement: 'Standardowe pozycjonowanie',
    featuredPlacement: 'Wyróżnione pozycjonowanie',
    prioritySupport: 'Priorytetowe wsparcie',
    basicAnalytics: 'Podstawowa analityka',
    extendedDuration: 'Wydłużony czas trwania',
    unlimitedListings: 'Nieograniczone ogłoszenia',
    topPlacement: 'Najwyższe pozycjonowanie',
    dedicatedSupport: 'Dedykowane wsparcie',
    advancedAnalytics: 'Zaawansowana analityka',
    dealerBadge: 'Odznaka dealera',
    bulkListingTools: 'Narzędzia masowego dodawania',
    
    // Comparison
    comparisonTitle: 'Porównanie Pakietów',
    comparisonSubtitle: 'Zobacz szczegółowe porównanie wszystkich funkcji dostępnych w każdym pakiecie',
    feature: 'Funkcja',
    
    // FAQ
    faqTitle: 'Często Zadawane Pytania',
    faqSubtitle: 'Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszych pakietów i cen',
    
    faq1Q: 'Czy mogę zmienić pakiet w trakcie trwania ogłoszenia?',
    faq1A: 'Tak, możesz w każdej chwili przejść na wyższy pakiet. Różnica w cenie zostanie naliczona proporcjonalnie.',
    
    faq2Q: 'Czy ceny zawierają szwajcarski VAT?',
    faq2A: 'Tak, wszystkie wyświetlane ceny zawierają szwajcarski VAT w wysokości 7.7%.',
    
    faq3Q: 'Jak długo trwa aktywacja pakietu?',
    faq3A: 'Pakiety są aktywowane natychmiast po potwierdzeniu płatności. Zazwyczaj zajmuje to kilka minut.',
    
    // Testimonials
    testimonialsTitle: 'Co Mówią Nasi Klienci',
    testimonialsSubtitle: 'Przeczytaj opinie zadowolonych użytkowników naszej platformy',
    
    testimonial1: 'Dzięki pakietowi Premium sprzedałem swój samochód w ciągu tygodnia. Wyróżnione pozycjonowanie naprawdę działa!',
    testimonial1Author: 'Marek K., Użytkownik prywatny',
    
    testimonial2: 'Jako dealer doceniam zaawansowane narzędzia analityczne. Mogę śledzić skuteczność moich ogłoszeń.',
    testimonial2Author: 'Auto Swiss GmbH, Dealer',
    
    testimonial3: 'Pierwszy raz sprzedawałem samochód online. Darmowy pakiet pozwolił mi przetestować platformę bez ryzyka.',
    testimonial3Author: 'Anna M., Użytkownik prywatny',
    
    // Contact
    needHelp: 'Potrzebujesz pomocy?',
    contactSupport: 'Skontaktuj się z naszym zespołem wsparcia',
    phone: 'Telefon',
    email: 'Email',
    hours: 'Godziny pracy: Pon-Pt 8:00-18:00',
    
    // Legal
    legalNotice: 'Informacje prawne',
    companyInfo: 'MotoAuto.ch AG, Zarejestrowana w Szwajcarii',
    vatNumber: 'Numer VAT: CHE-123.456.789',
    termsAndConditions: 'Regulamin',
    privacyPolicy: 'Polityka prywatności',
    refundPolicy: 'Polityka zwrotów',
    
    // Success stats
    successStats: 'Nasze Osiągnięcia',
    activeUsers: 'Aktywnych użytkowników',
    successfulSales: 'Udanych sprzedaży',
    averageTime: 'Średni czas sprzedaży',
    customerSatisfaction: 'Zadowolenie klientów',
    
    // VAT
    priceIncludesVat: 'Cena zawiera VAT 7.7%',
    netPrice: 'Cena netto',
    vatAmount: 'VAT (7.7%)',
    totalPrice: 'Cena całkowita'
  },
  
  de: {
    title: 'Preise - Pakete und Preise | MotoAuto.ch',
    description: 'Entdecken Sie unsere wettbewerbsfähigen Preise für Auto- und Motorradverkaufspakete in der Schweiz.',
    heroTitle: 'Wählen Sie das perfekte Paket für Sie',
    heroSubtitle: 'Transparente Preise, keine versteckten Kosten. Alle Preise inklusive Schweizer MwSt. 7.7%',
    heroDescription: 'Von kostenlosen Inseraten für Privatnutzer bis hin zu erweiterten Tools für Händler.',
    
    freePackage: 'Kostenlos',
    premiumPackage: 'Premium',
    dealerPackage: 'Händler',
    
    freeDescription: 'Ideal für Privatnutzer, die gelegentlich verkaufen',
    premiumDescription: 'Die beste Wahl für aktive Privatverkäufer',
    dealerDescription: 'Professionelle Tools für Händler und Automobilunternehmen',
    
    features: 'Funktionen',
    duration: 'Laufzeit',
    maxImages: 'Max. Bilder',
    days: 'Tage',
    chf: 'CHF',
    free: 'Kostenlos',
    popular: 'Beliebt',
    recommended: 'Empfohlen',
    choosePackage: 'Paket wählen',
    getStarted: 'Loslegen',
    contactSales: 'Vertrieb kontaktieren',
    
    // Features
    firstListingFree: 'Erstes Inserat kostenlos',
    basicSupport: 'Basis-Support',
    standardPlacement: 'Standard-Platzierung',
    featuredPlacement: 'Hervorgehobene Platzierung',
    prioritySupport: 'Priority-Support',
    basicAnalytics: 'Basis-Analytik',
    extendedDuration: 'Verlängerte Laufzeit',
    unlimitedListings: 'Unbegrenzte Inserate',
    topPlacement: 'Top-Platzierung',
    dedicatedSupport: 'Dedizierter Support',
    advancedAnalytics: 'Erweiterte Analytik',
    dealerBadge: 'Händler-Abzeichen',
    bulkListingTools: 'Bulk-Inserat-Tools',
    
    // Comparison
    comparisonTitle: 'Paket-Vergleich',
    comparisonSubtitle: 'Sehen Sie den detaillierten Vergleich aller in jedem Paket verfügbaren Funktionen',
    feature: 'Funktion',
    
    // FAQ
    faqTitle: 'Häufig gestellte Fragen',
    faqSubtitle: 'Finden Sie Antworten auf die häufigsten Fragen zu unseren Paketen und Preisen',
    
    faq1Q: 'Kann ich das Paket während der Laufzeit des Inserats ändern?',
    faq1A: 'Ja, Sie können jederzeit auf ein höheres Paket upgraden. Die Preisdifferenz wird anteilig berechnet.',
    
    faq2Q: 'Enthalten die Preise die Schweizer MwSt.?',
    faq2A: 'Ja, alle angezeigten Preise enthalten die Schweizer MwSt. von 7.7%.',
    
    faq3Q: 'Wie lange dauert die Paket-Aktivierung?',
    faq3A: 'Pakete werden sofort nach Zahlungsbestätigung aktiviert. Dies dauert normalerweise nur wenige Minuten.',
    
    // Testimonials
    testimonialsTitle: 'Was unsere Kunden sagen',
    testimonialsSubtitle: 'Lesen Sie Bewertungen von zufriedenen Nutzern unserer Plattform',
    
    testimonial1: 'Dank des Premium-Pakets habe ich mein Auto innerhalb einer Woche verkauft. Die hervorgehobene Platzierung funktioniert wirklich!',
    testimonial1Author: 'Markus K., Privatnutzer',
    
    testimonial2: 'Als Händler schätze ich die erweiterten Analyse-Tools. Ich kann die Wirksamkeit meiner Inserate verfolgen.',
    testimonial2Author: 'Auto Swiss GmbH, Händler',
    
    testimonial3: 'Ich habe zum ersten Mal online ein Auto verkauft. Das kostenlose Paket ermöglichte es mir, die Plattform risikofrei zu testen.',
    testimonial3Author: 'Anna M., Privatnutzerin',
    
    // Contact
    needHelp: 'Brauchen Sie Hilfe?',
    contactSupport: 'Kontaktieren Sie unser Support-Team',
    phone: 'Telefon',
    email: 'E-Mail',
    hours: 'Öffnungszeiten: Mo-Fr 8:00-18:00',
    
    // Legal
    legalNotice: 'Rechtliche Hinweise',
    companyInfo: 'MotoAuto.ch AG, Registriert in der Schweiz',
    vatNumber: 'MwSt.-Nr.: CHE-123.456.789',
    termsAndConditions: 'AGB',
    privacyPolicy: 'Datenschutz',
    refundPolicy: 'Rückgaberichtlinie',
    
    // Success stats
    successStats: 'Unsere Erfolge',
    activeUsers: 'Aktive Nutzer',
    successfulSales: 'Erfolgreiche Verkäufe',
    averageTime: 'Durchschnittliche Verkaufszeit',
    customerSatisfaction: 'Kundenzufriedenheit',
    
    // VAT
    priceIncludesVat: 'Preis inkl. MwSt. 7.7%',
    netPrice: 'Nettopreis',
    vatAmount: 'MwSt. (7.7%)',
    totalPrice: 'Gesamtpreis'
  },
  
  fr: {
    title: 'Prix - Forfaits et Tarifs | MotoAuto.ch',
    description: 'Découvrez nos prix compétitifs pour les forfaits de vente d\'automobiles et de motos en Suisse.',
    heroTitle: 'Choisissez le forfait parfait pour vous',
    heroSubtitle: 'Prix transparents, sans coûts cachés. Tous les prix incluent la TVA suisse de 7.7%',
    heroDescription: 'Des annonces gratuites pour les utilisateurs privés aux outils avancés pour les concessionnaires.',
    
    freePackage: 'Gratuit',
    premiumPackage: 'Premium',
    dealerPackage: 'Concessionnaire',
    
    freeDescription: 'Idéal pour les utilisateurs privés vendant occasionnellement',
    premiumDescription: 'Le meilleur choix pour les vendeurs privés actifs',
    dealerDescription: 'Outils professionnels pour les concessionnaires et entreprises automobiles',
    
    features: 'Fonctionnalités',
    duration: 'Durée',
    maxImages: 'Max. images',
    days: 'jours',
    chf: 'CHF',
    free: 'Gratuit',
    popular: 'Populaire',
    recommended: 'Recommandé',
    choosePackage: 'Choisir le forfait',
    getStarted: 'Commencer',
    contactSales: 'Contacter les ventes',
    
    // Features
    firstListingFree: 'Première annonce gratuite',
    basicSupport: 'Support de base',
    standardPlacement: 'Placement standard',
    featuredPlacement: 'Placement en vedette',
    prioritySupport: 'Support prioritaire',
    basicAnalytics: 'Analytique de base',
    extendedDuration: 'Durée prolongée',
    unlimitedListings: 'Annonces illimitées',
    topPlacement: 'Placement en haut',
    dedicatedSupport: 'Support dédié',
    advancedAnalytics: 'Analytique avancée',
    dealerBadge: 'Badge concessionnaire',
    bulkListingTools: 'Outils d\'annonces en lot',
    
    // Comparison
    comparisonTitle: 'Comparaison des forfaits',
    comparisonSubtitle: 'Voir la comparaison détaillée de toutes les fonctionnalités disponibles dans chaque forfait',
    feature: 'Fonctionnalité',
    
    // FAQ
    faqTitle: 'Questions fréquemment posées',
    faqSubtitle: 'Trouvez des réponses aux questions les plus courantes sur nos forfaits et prix',
    
    faq1Q: 'Puis-je changer de forfait pendant la durée de l\'annonce?',
    faq1A: 'Oui, vous pouvez passer à un forfait supérieur à tout moment. La différence de prix sera calculée au prorata.',
    
    faq2Q: 'Les prix incluent-ils la TVA suisse?',
    faq2A: 'Oui, tous les prix affichés incluent la TVA suisse de 7.7%.',
    
    faq3Q: 'Combien de temps prend l\'activation du forfait?',
    faq3A: 'Les forfaits sont activés immédiatement après confirmation du paiement. Cela prend généralement quelques minutes.',
    
    // Testimonials
    testimonialsTitle: 'Ce que disent nos clients',
    testimonialsSubtitle: 'Lisez les avis d\'utilisateurs satisfaits de notre plateforme',
    
    testimonial1: 'Grâce au forfait Premium, j\'ai vendu ma voiture en une semaine. Le placement en vedette fonctionne vraiment!',
    testimonial1Author: 'Marc K., Utilisateur privé',
    
    testimonial2: 'En tant que concessionnaire, j\'apprécie les outils d\'analyse avancés. Je peux suivre l\'efficacité de mes annonces.',
    testimonial2Author: 'Auto Swiss GmbH, Concessionnaire',
    
    testimonial3: 'J\'ai vendu une voiture en ligne pour la première fois. Le forfait gratuit m\'a permis de tester la plateforme sans risque.',
    testimonial3Author: 'Anne M., Utilisatrice privée',
    
    // Contact
    needHelp: 'Besoin d\'aide?',
    contactSupport: 'Contactez notre équipe de support',
    phone: 'Téléphone',
    email: 'Email',
    hours: 'Heures d\'ouverture: Lun-Ven 8h00-18h00',
    
    // Legal
    legalNotice: 'Mentions légales',
    companyInfo: 'MotoAuto.ch AG, Enregistrée en Suisse',
    vatNumber: 'N° TVA: CHE-123.456.789',
    termsAndConditions: 'Conditions générales',
    privacyPolicy: 'Politique de confidentialité',
    refundPolicy: 'Politique de remboursement',
    
    // Success stats
    successStats: 'Nos succès',
    activeUsers: 'Utilisateurs actifs',
    successfulSales: 'Ventes réussies',
    averageTime: 'Temps de vente moyen',
    customerSatisfaction: 'Satisfaction client',
    
    // VAT
    priceIncludesVat: 'Prix TTC 7.7%',
    netPrice: 'Prix net',
    vatAmount: 'TVA (7.7%)',
    totalPrice: 'Prix total'
  },
  
  en: {
    title: 'Pricing - Packages and Prices | MotoAuto.ch',
    description: 'Check our competitive prices for car and motorcycle sales packages in Switzerland.',
    heroTitle: 'Choose the Perfect Package for You',
    heroSubtitle: 'Transparent pricing, no hidden costs. All prices include Swiss VAT 7.7%',
    heroDescription: 'From free listings for private users to advanced tools for dealers.',
    
    freePackage: 'Free',
    premiumPackage: 'Premium',
    dealerPackage: 'Dealer',
    
    freeDescription: 'Perfect for private users selling occasionally',
    premiumDescription: 'Best choice for active private sellers',
    dealerDescription: 'Professional tools for dealers and automotive companies',
    
    features: 'Features',
    duration: 'Duration',
    maxImages: 'Max. images',
    days: 'days',
    chf: 'CHF',
    free: 'Free',
    popular: 'Popular',
    recommended: 'Recommended',
    choosePackage: 'Choose package',
    getStarted: 'Get started',
    contactSales: 'Contact sales',
    
    // Features
    firstListingFree: 'First listing free',
    basicSupport: 'Basic support',
    standardPlacement: 'Standard placement',
    featuredPlacement: 'Featured placement',
    prioritySupport: 'Priority support',
    basicAnalytics: 'Basic analytics',
    extendedDuration: 'Extended duration',
    unlimitedListings: 'Unlimited listings',
    topPlacement: 'Top placement',
    dedicatedSupport: 'Dedicated support',
    advancedAnalytics: 'Advanced analytics',
    dealerBadge: 'Dealer badge',
    bulkListingTools: 'Bulk listing tools',
    
    // Comparison
    comparisonTitle: 'Package Comparison',
    comparisonSubtitle: 'See detailed comparison of all features available in each package',
    feature: 'Feature',
    
    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Find answers to the most common questions about our packages and pricing',
    
    faq1Q: 'Can I change packages during the listing duration?',
    faq1A: 'Yes, you can upgrade to a higher package at any time. The price difference will be calculated proportionally.',
    
    faq2Q: 'Do prices include Swiss VAT?',
    faq2A: 'Yes, all displayed prices include Swiss VAT of 7.7%.',
    
    faq3Q: 'How long does package activation take?',
    faq3A: 'Packages are activated immediately after payment confirmation. This usually takes just a few minutes.',
    
    // Testimonials
    testimonialsTitle: 'What Our Customers Say',
    testimonialsSubtitle: 'Read reviews from satisfied users of our platform',
    
    testimonial1: 'Thanks to the Premium package, I sold my car within a week. Featured placement really works!',
    testimonial1Author: 'Mark K., Private user',
    
    testimonial2: 'As a dealer, I appreciate the advanced analytics tools. I can track the effectiveness of my listings.',
    testimonial2Author: 'Auto Swiss GmbH, Dealer',
    
    testimonial3: 'I sold a car online for the first time. The free package allowed me to test the platform risk-free.',
    testimonial3Author: 'Anna M., Private user',
    
    // Contact
    needHelp: 'Need help?',
    contactSupport: 'Contact our support team',
    phone: 'Phone',
    email: 'Email',
    hours: 'Hours: Mon-Fri 8:00-18:00',
    
    // Legal
    legalNotice: 'Legal notice',
    companyInfo: 'MotoAuto.ch AG, Registered in Switzerland',
    vatNumber: 'VAT No.: CHE-123.456.789',
    termsAndConditions: 'Terms and conditions',
    privacyPolicy: 'Privacy policy',
    refundPolicy: 'Refund policy',
    
    // Success stats
    successStats: 'Our Success',
    activeUsers: 'Active users',
    successfulSales: 'Successful sales',
    averageTime: 'Average selling time',
    customerSatisfaction: 'Customer satisfaction',
    
    // VAT
    priceIncludesVat: 'Price includes VAT 7.7%',
    netPrice: 'Net price',
    vatAmount: 'VAT (7.7%)',
    totalPrice: 'Total price'
  }
}

// Package Card Component
const PackageCard: React.FC<{
  packageData: PackageData
  language: Language
  onSelect: (packageId: string) => void
}> = ({ packageData, language, onSelect }) => {
  const t = translations[language]
  const { netAmount, vatAmount, grossAmount } = calculateSwissVAT(packageData.price)
  
  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${packageData.isPopular ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
      {/* Popular/Recommended Badge */}
      {(packageData.isPopular || packageData.isRecommended) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className={packageData.isPopular ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}>
            {packageData.isPopular ? t.popular : t.recommended}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        {/* Package Icon */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${packageData.color} mb-4`}>
          {packageData.icon}
        </div>

        <CardTitle className="text-xl font-bold">
          {t[`${packageData.id}Package` as keyof typeof t] as string}
        </CardTitle>

        {/* Price */}
        <div className="text-3xl font-bold text-gray-900 mt-2">
          {packageData.price === 0 ? (
            <span className="text-green-600">{t.free}</span>
          ) : (
            <>
              {formatSwissAmount(packageData.price, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
              <span className="text-sm font-normal text-gray-500 ml-1">
                / {packageData.duration} {t.days}
              </span>
            </>
          )}
        </div>

        <CardDescription className="mt-2">
          {t[`${packageData.id}Description` as keyof typeof t] as string}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Features */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t.duration}:</span>
            <span className="font-medium">{packageData.duration} {t.days}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t.maxImages}:</span>
            <span className="font-medium">{packageData.maxImages}</span>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">{t.features}:</h4>
          <ul className="space-y-1">
            {packageData.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>{t[feature as keyof typeof t] as string}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* VAT Information */}
        {packageData.price > 0 && (
          <div className="text-xs text-gray-500 border-t pt-2">
            <div className="flex justify-between">
              <span>{t.netPrice}:</span>
              <span>{formatSwissAmount(netAmount, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.vatAmount}:</span>
              <span>{formatSwissAmount(vatAmount, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800"
          onClick={() => onSelect(packageData.id)}
        >
          {t.choosePackage}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Comparison Table Component
const ComparisonTable: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language]
  
  const allFeatures = [
    'firstListingFree',
    'basicSupport',
    'standardPlacement',
    'featuredPlacement',
    'prioritySupport',
    'basicAnalytics',
    'extendedDuration',
    'unlimitedListings',
    'topPlacement',
    'dedicatedSupport',
    'advancedAnalytics',
    'dealerBadge',
    'bulkListingTools'
  ]

  const hasFeature = (packageId: string, feature: string) => {
    return predefinedPackages[packageId].features.includes(feature)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium">{t.feature}</th>
            <th className="text-center p-4 font-medium">{t.freePackage}</th>
            <th className="text-center p-4 font-medium">{t.premiumPackage}</th>
            <th className="text-center p-4 font-medium">{t.dealerPackage}</th>
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, index) => (
            <tr key={feature} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="p-4 font-medium">{t[feature as keyof typeof t] as string}</td>
              <td className="text-center p-4">
                {hasFeature('free', feature) ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-gray-300 mx-auto" />
                )}
              </td>
              <td className="text-center p-4">
                {hasFeature('premium', feature) ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-gray-300 mx-auto" />
                )}
              </td>
              <td className="text-center p-4">
                {hasFeature('dealer', feature) ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-gray-300 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// FAQ Component
const FAQSection: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language]
  
  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A }
  ]

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
          <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Testimonials Component
const TestimonialsSection: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language]
  
  const testimonials = [
    { text: t.testimonial1, author: t.testimonial1Author },
    { text: t.testimonial2, author: t.testimonial2Author },
    { text: t.testimonial3, author: t.testimonial3Author }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-start space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-gray-700 mb-4 italic">
              "{testimonial.text}"
            </blockquote>
            <cite className="text-sm font-medium text-gray-900">
              {testimonial.author}
            </cite>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Success Stats Component
const SuccessStats: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language]
  
  const stats = [
    { icon: <Users className="h-8 w-8" />, value: '15,000+', label: t.activeUsers },
    { icon: <TrendingUp className="h-8 w-8" />, value: '8,500+', label: t.successfulSales },
    { icon: <Clock className="h-8 w-8" />, value: '12', label: t.averageTime + ' (dni)' },
    { icon: <Award className="h-8 w-8" />, value: '4.8/5', label: t.customerSatisfaction }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex justify-center mb-4 text-blue-600">
            {stat.icon}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Main Pricing Page Component
export default function PricingPage() {
  const [language, setLanguage] = useState<Language>('pl')
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const t = translations[language]

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setPackages(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    // Redirect to payment or show payment modal
    window.location.href = `/payment?package=${packageId}&lang=${language}`
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Language Selector */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2 bg-white/10 rounded-lg p-1">
                {(['pl', 'de', 'fr', 'en'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      language === lang
                        ? 'bg-white text-gray-900'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              {t.heroSubtitle}
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t.heroDescription}
            </p>

            {/* Success Stats */}
            <div className="mt-16">
              <h3 className="text-lg font-medium mb-8 text-gray-300">{t.successStats}</h3>
              <SuccessStats language={language} />
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Wybierz swój pakiet
              </h2>
              <p className="text-xl text-gray-600">
                Przejrzyste ceny dostosowane do Twoich potrzeb
              </p>
            </div>

            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {Object.values(predefinedPackages).map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  packageData={pkg}
                  language={language}
                  onSelect={handlePackageSelect}
                />
              ))}
            </div>

            {/* VAT Notice */}
            <Alert className="mb-16">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t.priceIncludesVat} - {t.companyInfo}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.comparisonTitle}
              </h2>
              <p className="text-xl text-gray-600">
                {t.comparisonSubtitle}
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <ComparisonTable language={language} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.faqTitle}
              </h2>
              <p className="text-xl text-gray-600">
                {t.faqSubtitle}
              </p>
            </div>

            <FAQSection language={language} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.testimonialsTitle}
              </h2>
              <p className="text-xl text-gray-600">
                {t.testimonialsSubtitle}
              </p>
            </div>

            <TestimonialsSection language={language} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              {t.needHelp}
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              {t.contactSupport}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <Phone className="h-8 w-8 mb-4 text-blue-400" />
                <h3 className="font-medium mb-2">{t.phone}</h3>
                <p className="text-gray-300">+41 44 123 45 67</p>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="h-8 w-8 mb-4 text-blue-400" />
                <h3 className="font-medium mb-2">{t.email}</h3>
                <p className="text-gray-300">support@motoauto.ch</p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 mb-4 text-blue-400" />
                <h3 className="font-medium mb-2">{t.hours}</h3>
                <p className="text-gray-300">Mon-Fri 8:00-18:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <section className="py-12 bg-gray-800 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-medium mb-4">{t.legalNotice}</h3>
              <p className="text-sm">{t.companyInfo}</p>
              <p className="text-sm">{t.vatNumber}</p>
            </div>

            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <a href="/regulamin" className="hover:text-white transition-colors">
                {t.termsAndConditions}
              </a>
              <a href="/polityka-prywatnosci" className="hover:text-white transition-colors">
                {t.privacyPolicy}
              </a>
              <a href="/polityka-zwrotow" className="hover:text-white transition-colors">
                {t.refundPolicy}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}