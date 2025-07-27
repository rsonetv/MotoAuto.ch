'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'
import type { Package } from '@/lib/database.types'

interface PackageCardProps {
  package: Package
  isSelected?: boolean
  isPopular?: boolean
  onSelect: (packageId: string) => void
  disabled?: boolean
  language?: 'de' | 'fr' | 'en' | 'pl'
}

const getPackageIcon = (packageName: string) => {
  const name = packageName.toLowerCase()
  if (name.includes('free') || name.includes('gratis')) {
    return <Check className="h-6 w-6" />
  }
  if (name.includes('premium')) {
    return <Star className="h-6 w-6" />
  }
  if (name.includes('dealer') || name.includes('händler')) {
    return <Crown className="h-6 w-6" />
  }
  return <Zap className="h-6 w-6" />
}

const getPackageColor = (packageName: string) => {
  const name = packageName.toLowerCase()
  if (name.includes('free') || name.includes('gratis')) {
    return 'bg-green-50 border-green-200 text-green-800'
  }
  if (name.includes('premium')) {
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }
  if (name.includes('dealer') || name.includes('händler')) {
    return 'bg-purple-50 border-purple-200 text-purple-800'
  }
  return 'bg-gray-50 border-gray-200 text-gray-800'
}

const getPackageName = (pkg: Package, language: string = 'de') => {
  switch (language) {
    case 'fr':
      return pkg.name_fr
    case 'en':
      return pkg.name_en
    case 'pl':
      return pkg.name_pl
    default:
      return pkg.name_de
  }
}

const getPackageDescription = (pkg: Package, language: string = 'de') => {
  switch (language) {
    case 'fr':
      return pkg.description_fr
    case 'en':
      return pkg.description_en
    case 'pl':
      return pkg.description_pl
    default:
      return pkg.description_de
  }
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      duration: 'Laufzeit',
      days: 'Tage',
      images: 'Bilder',
      maxImages: 'Max. Bilder',
      features: 'Funktionen',
      selectPackage: 'Paket auswählen',
      selected: 'Ausgewählt',
      popular: 'Beliebt',
      free: 'Kostenlos',
      chf: 'CHF'
    },
    fr: {
      duration: 'Durée',
      days: 'jours',
      images: 'images',
      maxImages: 'Max. images',
      features: 'Fonctionnalités',
      selectPackage: 'Sélectionner le package',
      selected: 'Sélectionné',
      popular: 'Populaire',
      free: 'Gratuit',
      chf: 'CHF'
    },
    en: {
      duration: 'Duration',
      days: 'days',
      images: 'images',
      maxImages: 'Max. images',
      features: 'Features',
      selectPackage: 'Select Package',
      selected: 'Selected',
      popular: 'Popular',
      free: 'Free',
      chf: 'CHF'
    },
    pl: {
      duration: 'Czas trwania',
      days: 'dni',
      images: 'zdjęcia',
      maxImages: 'Maks. zdjęć',
      features: 'Funkcje',
      selectPackage: 'Wybierz pakiet',
      selected: 'Wybrano',
      popular: 'Popularne',
      free: 'Darmowy',
      chf: 'CHF'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isSelected = false,
  isPopular = false,
  onSelect,
  disabled = false,
  language = 'de'
}) => {
  const t = getTranslations(language)
  const packageName = getPackageName(pkg, language)
  const packageDescription = getPackageDescription(pkg, language)
  const packageIcon = getPackageIcon(packageName)
  const packageColor = getPackageColor(packageName)
  
  // Parse features from JSONB - safely convert Json to string array
  const features: string[] = Array.isArray(pkg.features)
    ? pkg.features.filter((f): f is string => typeof f === 'string')
    : []
  const isFree = pkg.price_chf === 0

  return (
    <Card 
      className={`relative transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onSelect(pkg.id)}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white px-3 py-1">
            {t.popular}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        {/* Package icon */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${packageColor} mb-4`}>
          {packageIcon}
        </div>

        <CardTitle className="text-xl font-bold">
          {packageName}
        </CardTitle>

        {/* Price */}
        <div className="text-3xl font-bold text-gray-900 mt-2">
          {isFree ? (
            <span className="text-green-600">{t.free}</span>
          ) : (
            <>
              {formatSwissAmount(pkg.price_chf, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
              <span className="text-sm font-normal text-gray-500 ml-1">
                / {pkg.duration_days} {t.days}
              </span>
            </>
          )}
        </div>

        {packageDescription && (
          <CardDescription className="mt-2">
            {packageDescription}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key features */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t.duration}:</span>
            <span className="font-medium">{pkg.duration_days} {t.days}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t.maxImages}:</span>
            <span className="font-medium">{pkg.max_images} {t.images}</span>
          </div>

          {pkg.is_featured && (
            <div className="flex items-center text-sm text-blue-600">
              <Star className="h-4 w-4 mr-2" />
              <span>Featured Listing</span>
            </div>
          )}

          {pkg.is_premium && (
            <div className="flex items-center text-sm text-purple-600">
              <Crown className="h-4 w-4 mr-2" />
              <span>Premium Features</span>
            </div>
          )}
        </div>

        {/* Features list */}
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">{t.features}:</h4>
            <ul className="space-y-1">
              {features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{String(feature)}</span>
                </li>
              ))}
              {features.length > 4 && (
                <li className="text-sm text-gray-500 ml-6">
                  +{features.length - 4} more features
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className={`w-full ${
            isSelected 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) onSelect(pkg.id)
          }}
        >
          {isSelected ? t.selected : t.selectPackage}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PackageCard