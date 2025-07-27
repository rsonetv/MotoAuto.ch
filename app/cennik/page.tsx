import { Metadata } from 'next'
import PricingClient from './pricing-client'

// Metadata for SEO - Server Component only
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

// Server Component wrapper
export default function PricingPage() {
  return <PricingClient />
}