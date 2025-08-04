"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  Check,
  Star,
  Image as ImageIcon,
  Calendar,
  TrendingUp,
  Crown,
  Gift,
  CreditCard,
  Info
} from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'

interface PackageOption {
  id: string
  name: string
  name_de: string
  name_fr: string
  name_en: string
  price: number
  currency: string
  duration_days: number
  max_images: number
  description: string
  features: {
    priority_support?: boolean
    featured_listing?: boolean
    social_media_promotion?: boolean
    analytics?: boolean
    multiple_categories?: boolean
    auto_renewal?: boolean
    dealer_badge?: boolean
    unlimited_editing?: boolean
  }
  is_popular?: boolean
}

interface UserProfile {
  id: string
  free_listings_used: number
  current_package_id?: string
  is_dealer: boolean
  package_expires_at?: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPackagesAndProfile()
  }, [])

  const fetchPackagesAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pobierz pakiety
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      // Pobierz profil użytkownika
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setPackages(packagesData || [])
      setUserProfile(profileData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Błąd podczas ładowania danych')
    } finally {
      setLoading(false)
    }
  }

  const handlePackageSelection = async (packageId: string, price: number) => {
    if (price === 0) {
      // Darmowy pakiet - aktywuj od razu
      try {
        setProcessingPayment(packageId)
        
        const { error } = await supabase
          .from('profiles')
          .update({
            current_package_id: packageId,
            package_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', userProfile?.id)

        if (error) throw error

        toast.success('Darmowy pakiet został aktywowany!')
        fetchPackagesAndProfile()
      } catch (error) {
        console.error('Error activating free package:', error)
        toast.error('Błąd podczas aktywacji pakietu')
      } finally {
        setProcessingPayment(null)
      }
    } else {
      // Płatny pakiet - przekieruj do płatności
      router.push(`/dashboard/payments?packageId=${packageId}&price=${price}`)
    }
  }

  const canUseFreePackage = () => {
    return (userProfile?.free_listings_used || 0) === 0
  }

  const getCurrentPackage = () => {
    if (!userProfile?.current_package_id) return null
    return packages.find(p => p.id === userProfile.current_package_id)
  }

  const getDaysRemaining = () => {
    if (!userProfile?.package_expires_at) return 0
    const now = new Date()
    const expiry = new Date(userProfile.package_expires_at)
    const diff = expiry.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const currentPackage = getCurrentPackage()
  const daysRemaining = getDaysRemaining()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Wybierz pakiet</h1>
        <p className="text-gray-600 mt-2">
          Wybierz najlepszy pakiet dla swoich potrzeb. Pierwsze ogłoszenie zawsze za darmo!
        </p>
      </div>

      {/* Obecny pakiet info */}
      {currentPackage && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Obecny pakiet: {currentPackage.name}
                  </h3>
                  <p className="text-blue-600">
                    {daysRemaining > 0 
                      ? `Wygasa za ${daysRemaining} dni`
                      : 'Pakiet wygasł'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">
                  {currentPackage.price === 0 ? 'Darmowy' : `${currentPackage.price} CHF`}
                </div>
                {daysRemaining > 0 && (
                  <Progress value={(daysRemaining / currentPackage.duration_days) * 100} className="w-32 mt-2" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Darmowe ogłoszenie info */}
      {canUseFreePackage() && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Gift className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  🎉 Twoje pierwsze ogłoszenie jest darmowe!
                </h3>
                <p className="text-green-600">
                  Możesz dodać jedno ogłoszenie całkowicie za darmo - bez ukrytych kosztów i opłat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pakiety */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => {
          const isFree = pkg.price === 0
          const isCurrentPackage = currentPackage?.id === pkg.id
          const canUseFree = isFree && canUseFreePackage()
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative ${
                pkg.is_popular ? 'border-orange-300 shadow-lg scale-105' : ''
              } ${isCurrentPackage ? 'border-blue-300 bg-blue-50' : ''}`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Najpopularniejszy
                  </Badge>
                </div>
              )}

              {isCurrentPackage && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Twój pakiet
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  {isFree ? (
                    <Gift className="w-8 h-8 text-green-600" />
                  ) : pkg.price < 50 ? (
                    <Package className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Crown className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {isFree ? (
                    <span className="text-green-600">Darmowy</span>
                  ) : (
                    <>
                      <span className="text-gray-900">{pkg.price}</span>
                      <span className="text-gray-600 text-lg ml-1">{pkg.currency}</span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{pkg.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Podstawowe funkcje */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        Czas publikacji: <strong>{pkg.duration_days} dni</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        Maksymalnie: <strong>{pkg.max_images} zdjęć</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Podstawowe statystyki</span>
                    </div>
                  </div>

                  {/* Dodatkowe funkcje */}
                  {Object.keys(pkg.features).length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        {pkg.features.featured_listing && (
                          <div className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Wyróżnienie ogłoszenia</span>
                          </div>
                        )}
                        {pkg.features.priority_support && (
                          <div className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Priorytetowe wsparcie</span>
                          </div>
                        )}
                        {pkg.features.analytics && (
                          <div className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Zaawansowana analityka</span>
                          </div>
                        )}
                        {pkg.features.social_media_promotion && (
                          <div className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Promocja w social media</span>
                          </div>
                        )}
                        {pkg.features.dealer_badge && (
                          <div className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Odznaka dealera</span>
                          </div>
                        )}
                        {pkg.features.unlimited_editing && (
                          <div className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Nieograniczone edycje</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Przycisk wyboru */}
                  <div className="pt-4">
                    {isCurrentPackage ? (
                      <Button disabled className="w-full">
                        <Check className="w-4 h-4 mr-2" />
                        Obecny pakiet
                      </Button>
                    ) : isFree && !canUseFree ? (
                      <Button disabled className="w-full" variant="outline">
                        <Info className="w-4 h-4 mr-2" />
                        Wykorzystany
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={pkg.is_popular ? 'default' : 'outline'}
                        onClick={() => handlePackageSelection(pkg.id, pkg.price)}
                        disabled={processingPayment === pkg.id}
                      >
                        {processingPayment === pkg.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Przetwarzanie...
                          </>
                        ) : isFree ? (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Aktywuj za darmo
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Wybierz pakiet
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Informacja o pierwszym darmowym ogłoszeniu */}
                  {!isFree && canUseFreePackage() && (
                    <div className="text-xs text-center text-gray-600 bg-yellow-50 p-2 rounded">
                      💡 Pamiętaj: Twoje pierwsze ogłoszenie jest zawsze darmowe!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dodatkowe informacje */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Informacje o cenach</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">💳 Płatności</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bezpieczne płatności przez Stripe</li>
                <li>• Karty kredytowe/debetowe</li>
                <li>• TWINT, PostFinance</li>
                <li>• Faktury VAT dla firm</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Prowizje</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 5% prowizji od sprzedaży</li>
                <li>• Maksymalnie 500 CHF</li>
                <li>• Brak prowizji od aukcji bez sprzedaży</li>
                <li>• Transparentne rozliczenia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
