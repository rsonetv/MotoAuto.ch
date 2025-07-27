'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info } from 'lucide-react'
import { PackageCard } from './package-card'
import { formatSwissAmount } from '@/lib/stripe'
import type { Package } from '@/lib/database.types'

interface PackageSelectionProps {
  onPackageSelect: (packageId: string, packageData: Package) => void
  selectedPackageId?: string
  language?: 'de' | 'fr' | 'en' | 'pl'
  userType?: 'private' | 'dealer'
  showFreeOption?: boolean
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      title: 'Wählen Sie Ihr Paket',
      subtitle: 'Wählen Sie das passende Paket für Ihr Fahrzeuginserat',
      loading: 'Pakete werden geladen...',
      error: 'Fehler beim Laden der Pakete',
      retry: 'Erneut versuchen',
      freeInfo: 'Als Privatperson ist Ihr erstes Inserat kostenlos',
      dealerInfo: 'Als Händler haben Sie Zugang zu erweiterten Funktionen',
      continue: 'Weiter zur Zahlung',
      selectPackage: 'Bitte wählen Sie ein Paket aus',
      popular: 'Beliebt',
      recommended: 'Empfohlen',
      savings: 'Sie sparen',
      perMonth: 'pro Monat',
      oneTime: 'Einmalig'
    },
    fr: {
      title: 'Choisissez votre package',
      subtitle: 'Sélectionnez le package adapté à votre annonce de véhicule',
      loading: 'Chargement des packages...',
      error: 'Erreur lors du chargement des packages',
      retry: 'Réessayer',
      freeInfo: 'En tant que particulier, votre première annonce est gratuite',
      dealerInfo: 'En tant que concessionnaire, vous avez accès à des fonctionnalités avancées',
      continue: 'Continuer vers le paiement',
      selectPackage: 'Veuillez sélectionner un package',
      popular: 'Populaire',
      recommended: 'Recommandé',
      savings: 'Vous économisez',
      perMonth: 'par mois',
      oneTime: 'Une fois'
    },
    en: {
      title: 'Choose Your Package',
      subtitle: 'Select the right package for your vehicle listing',
      loading: 'Loading packages...',
      error: 'Error loading packages',
      retry: 'Try again',
      freeInfo: 'As a private user, your first listing is free',
      dealerInfo: 'As a dealer, you have access to advanced features',
      continue: 'Continue to Payment',
      selectPackage: 'Please select a package',
      popular: 'Popular',
      recommended: 'Recommended',
      savings: 'You save',
      perMonth: 'per month',
      oneTime: 'One-time'
    },
    pl: {
      title: 'Wybierz swój pakiet',
      subtitle: 'Wybierz odpowiedni pakiet dla swojego ogłoszenia pojazdu',
      loading: 'Ładowanie pakietów...',
      error: 'Błąd podczas ładowania pakietów',
      retry: 'Spróbuj ponownie',
      freeInfo: 'Jako użytkownik prywatny, Twoje pierwsze ogłoszenie jest darmowe',
      dealerInfo: 'Jako dealer masz dostęp do zaawansowanych funkcji',
      continue: 'Przejdź do płatności',
      selectPackage: 'Proszę wybrać pakiet',
      popular: 'Popularne',
      recommended: 'Polecane',
      savings: 'Oszczędzasz',
      perMonth: 'miesięcznie',
      oneTime: 'Jednorazowo'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

export const PackageSelection: React.FC<PackageSelectionProps> = ({
  onPackageSelect,
  selectedPackageId,
  language = 'de',
  userType = 'private',
  showFreeOption = true
}) => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const t = getTranslations(language)

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/packages', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Filter packages based on user type and active status
          let filteredPackages = data.data.filter((pkg: Package) => pkg.is_active)
          
          // If not showing free option, filter out free packages
          if (!showFreeOption) {
            filteredPackages = filteredPackages.filter((pkg: Package) => pkg.price_chf > 0)
          }

          // Sort packages by price (free first, then by price)
          filteredPackages.sort((a: Package, b: Package) => {
            if (a.price_chf === 0 && b.price_chf > 0) return -1
            if (b.price_chf === 0 && a.price_chf > 0) return 1
            return a.price_chf - b.price_chf
          })

          setPackages(filteredPackages)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error fetching packages:', err)
        setError(err instanceof Error ? err.message : 'Failed to load packages')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [showFreeOption])

  // Handle package selection
  const handlePackageSelect = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId)
    if (pkg) {
      setSelectedPackage(pkg)
      onPackageSelect(packageId, pkg)
    }
  }

  // Determine which package is popular/recommended
  const getPackageProps = (pkg: Package, index: number) => {
    const isPopular = pkg.is_premium || (index === 1 && packages.length > 2)
    return { isPopular }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{t.error}: {error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                {t.retry}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (packages.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <div className="text-gray-500">No packages available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* User type info */}
      {userType && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {userType === 'dealer' ? t.dealerInfo : t.freeInfo}
          </AlertDescription>
        </Alert>
      )}

      {/* Package grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, index) => {
          const { isPopular } = getPackageProps(pkg, index)
          
          return (
            <PackageCard
              key={pkg.id}
              package={pkg}
              isSelected={selectedPackageId === pkg.id}
              isPopular={isPopular}
              onSelect={handlePackageSelect}
              language={language}
            />
          )
        })}
      </div>

      {/* Selected package summary */}
      {selectedPackage && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              Selected Package: {selectedPackage.name_de}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Price:</span>
                <div className="font-medium">
                  {selectedPackage.price_chf === 0 
                    ? t.freeInfo.split(' ')[0] // "Free" or equivalent
                    : formatSwissAmount(selectedPackage.price_chf, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <div className="font-medium">{selectedPackage.duration_days} days</div>
              </div>
              <div>
                <span className="text-gray-600">Images:</span>
                <div className="font-medium">{selectedPackage.max_images} max</div>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <div className="font-medium">
                  {selectedPackage.is_premium ? 'Premium' : 
                   selectedPackage.is_featured ? 'Featured' : 'Standard'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          disabled={!selectedPackage}
          onClick={() => selectedPackage && onPackageSelect(selectedPackage.id, selectedPackage)}
          className="px-8"
        >
          {selectedPackage ? t.continue : t.selectPackage}
        </Button>
      </div>
    </div>
  )
}

export default PackageSelection