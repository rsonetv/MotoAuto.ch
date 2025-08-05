"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Camera, 
  Gavel, 
  LayoutDashboard, 
  Heart, 
  Share2, 
  CreditCard,
  Zap,
  TrendingUp
} from "lucide-react"

import { EnhancedVehicleGallery } from "./components/EnhancedVehicleGallery"
import { AdvancedAuctionInterface } from "./components/AdvancedAuctionInterface"
import { TouchOptimizedDashboard } from "./components/TouchOptimizedDashboard"
import { AutoSwipeInterface } from "./components/AutoSwipeInterface"
import { SocialSharingModal } from "./components/SocialSharingModal"
import { SwissPaymentMethods } from "./components/SwissPaymentMethods"

interface EnhancedPlatformProps {
  galleryData: any
  auctionData: any
  dashboardWidgets: any[]
  autoSwipeData: any
  socialSharingData: any
  paymentMethods: any[]
  websocketStatus: any
  biometricAuth: any
  className?: string
}

export function EnhancedPlatform({
  galleryData,
  auctionData,
  dashboardWidgets,
  autoSwipeData,
  socialSharingData,
  paymentMethods,
  websocketStatus,
  biometricAuth,
  className
}: EnhancedPlatformProps) {
  const [activeTab, setActiveTab] = useState("gallery")
  const [paymentAmount] = useState(75000)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>()

  const handleImageChange = (index: number) => {
    console.log('Image changed to:', index)
  }

  const handleBidPlaced = (amount: number) => {
    console.log('Bid placed:', amount)
  }

  const handleWidgetMove = (widgetId: string, position: any) => {
    console.log('Widget moved:', widgetId, position)
  }

  const handleVehicleSwipe = (vehicleId: string, action: string) => {
    console.log('Vehicle swiped:', vehicleId, action)
  }

  const handleShare = (platform: string) => {
    console.log('Shared on:', platform)
  }

  const handlePaymentComplete = (result: any) => {
    console.log('Payment completed:', result)
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Zaawansowana Platforma MotoAuto.ch</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Mobilnie zoptymalizowane funkcje dla nowoczesnego handlu pojazdami
          </p>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              WebSocket Live
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              AI Rekomendacje
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              TWINT & PostFinance
            </Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Galeria</span>
            </TabsTrigger>
            <TabsTrigger value="auction" className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              <span className="hidden sm:inline">Aukcje</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="swipe" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Auto Swipe</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Udostępnij</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Płatności</span>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Vehicle Gallery */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Zaawansowana Galeria Pojazdów
                </CardTitle>
                <p className="text-muted-foreground">
                  Responsywna galeria z gestami swipe, pinch-to-zoom, widokami 360° i integracją video
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedVehicleGallery
                  images={galleryData.images}
                  title={galleryData.title}
                  hasVirtualTour={galleryData.hasVirtualTour}
                  supportsPinchZoom={galleryData.supportsPinchZoom}
                  lazyLoadingEnabled={galleryData.lazyLoadingEnabled}
                  onImageChange={handleImageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Auction Interface */}
          <TabsContent value="auction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Zaawansowany Interfejs Aukcji
                </CardTitle>
                <p className="text-muted-foreground">
                  Live aukcje z WebSocket, one-tap bidding, uwierzytelnieniem biometrycznym i powiadomieniami push
                </p>
              </CardHeader>
            </Card>
            
            <AdvancedAuctionInterface
              auction={auctionData}
              websocketStatus={websocketStatus}
              biometricAuth={biometricAuth}
              onBidPlaced={handleBidPlaced}
            />
          </TabsContent>

          {/* Touch-Optimized Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard Dotykowy
                </CardTitle>
                <p className="text-muted-foreground">
                  Modułowe widgety z drag-and-drop, FAB panele i nawigacja gestami
                </p>
              </CardHeader>
            </Card>
            
            <TouchOptimizedDashboard
              widgets={dashboardWidgets}
              isDealerAccount={true}
              onWidgetMove={handleWidgetMove}
            />
          </TabsContent>

          {/* Auto Swipe Recommendations */}
          <TabsContent value="swipe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Auto Swipe - Rekomendacje AI
                </CardTitle>
                <p className="text-muted-foreground">
                  Interfejs w stylu Tinder z rekomendacjami pojazdów opartymi na AI
                </p>
              </CardHeader>
            </Card>
            
            <AutoSwipeInterface
              recommendations={autoSwipeData.recommendations}
              userPreferences={autoSwipeData.userPreferences}
              onSwipe={handleVehicleSwipe}
            />
          </TabsContent>

          {/* Social Sharing */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Udostępnianie Społecznościowe
                </CardTitle>
                <p className="text-muted-foreground">
                  Zoptymalizowane udostępnianie na platformach społecznościowych z niestandardowymi kartami podglądu
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="mb-4 p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
                    <h3 className="text-xl font-bold mb-2">{socialSharingData.vehicleData.title}</h3>
                    <p className="text-lg opacity-90">{socialSharingData.vehicleData.price.toLocaleString()} CHF</p>
                  </div>
                  
                  <SocialSharingModal
                    platforms={socialSharingData.platforms}
                    shareText={socialSharingData.shareText}
                    shareUrl={socialSharingData.shareUrl}
                    vehicleData={socialSharingData.vehicleData}
                    onShare={handleShare}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swiss Payment Methods */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Szwajcarskie Metody Płatności
                </CardTitle>
                <p className="text-muted-foreground">
                  Natywna integracja TWINT i PostFinance z bezpieczną tokenizacją
                </p>
              </CardHeader>
            </Card>
            
            <SwissPaymentMethods
              methods={paymentMethods}
              selectedMethod={selectedPaymentMethod}
              amount={paymentAmount}
              currency="CHF"
              onMethodSelect={setSelectedPaymentMethod}
              onPaymentComplete={handlePaymentComplete}
            />
          </TabsContent>
        </Tabs>

        {/* Performance Info */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cele Wydajności</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-600">&lt; 1.5s</div>
                  <p className="text-green-700">First Contentful Paint</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600">&lt; 2.5s</div>
                  <p className="text-blue-700">Largest Contentful Paint</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-bold text-purple-600">&lt; 0.1</div>
                  <p className="text-purple-700">Cumulative Layout Shift</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-bold text-orange-600">44px</div>
                  <p className="text-orange-700">Min Touch Targets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}