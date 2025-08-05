"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Gavel, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Zap,
  Shield,
  Fingerprint,
  Bell,
  Vibrate,
  Timer,
  DollarSign
} from "lucide-react"
import { useWebSocket } from "../hooks/useWebSocket"
import { useBiometricAuth } from "../hooks/useBiometricAuth"
import { AuctionBiddingProps } from "../schema"
import { formatBidAmount, formatTimeRemaining, formatBidIncrement } from "../string-formatters"

export function AdvancedAuctionInterface({
  auction,
  websocketStatus,
  biometricAuth,
  onBidPlaced,
  onAutoBidSetup
}: AuctionBiddingProps) {
  const [bidAmount, setBidAmount] = useState(auction.nextMinBid)
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [autoBidEnabled, setAutoBidEnabled] = useState(auction.autoBidEnabled)
  const [maxAutoBid, setMaxAutoBid] = useState(auction.maxAutoBid || 0)
  const [emergencyBidActive, setEmergencyBidActive] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)

  const ws = useWebSocket('wss://api.motoauto.ch/auctions', {
    onConnect: () => {
      ws.send('join_auction', { auctionId: auction.id })
    }
  })

  const biometric = useBiometricAuth()

  // Handle WebSocket events
  useEffect(() => {
    ws.on('bid_placed', (data) => {
      if (data.auctionId === auction.id) {
        setBidAmount(data.nextMinBid)
        
        // Show notification
        if (notificationsEnabled) {
          toast.info(`Nowa oferta: ${formatBidAmount(data.currentBid)}`, {
            description: `Przez ${data.bidderName}`,
            duration: 3000
          })
        }

        // Vibration feedback
        if (vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
      }
    })

    ws.on('auction_ending_soon', (data) => {
      if (data.auctionId === auction.id) {
        toast.warning('Aukcja kończy się za 5 minut!', {
          duration: 10000
        })
        
        if (vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200])
        }
      }
    })

    ws.on('auction_extended', (data) => {
      if (data.auctionId === auction.id) {
        toast.success('Aukcja przedłużona!', {
          description: `O ${data.extensionMinutes} minut`,
          duration: 5000
        })
      }
    })

    return () => {
      ws.off('bid_placed')
      ws.off('auction_ending_soon')
      ws.off('auction_extended')
    }
  }, [auction.id, notificationsEnabled, vibrationEnabled, ws])

  const handleQuickBid = async (amount: number) => {
    if (biometric.isEnabled) {
      const authResult = await biometric.authenticate()
      if (!authResult.success) {
        toast.error('Uwierzytelnienie nieudane', {
          description: authResult.error
        })
        return
      }
    }

    await placeBid(amount, 'quick')
  }

  const handleEmergencyBid = async () => {
    setEmergencyBidActive(true)
    
    try {
      // Emergency bid with priority queue
      await placeBid(auction.nextMinBid + auction.minBidIncrement, 'emergency')
      
      toast.success('Awaryjne licytowanie aktywowane!', {
        description: 'Twoja oferta ma priorytet',
        duration: 5000
      })
    } catch (error) {
      toast.error('Błąd awaryjnego licytowania')
    } finally {
      setEmergencyBidActive(false)
    }
  }

  const placeBid = async (amount: number, type: 'manual' | 'quick' | 'auto' | 'emergency' = 'manual') => {
    setIsPlacingBid(true)

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auctionId: auction.id,
          listingId: auction.listingId,
          amount,
          type,
          biometricAuth: biometric.isEnabled
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Błąd licytacji')
      }

      onBidPlaced?.(amount)
      
      toast.success('Oferta złożona!', {
        description: `${formatBidAmount(amount)} - ${type === 'emergency' ? 'Priorytet' : 'Standard'}`,
        duration: 3000
      })

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 25, 50])
      }

    } catch (error: any) {
      toast.error('Błąd licytacji', {
        description: error.message
      })
    } finally {
      setIsPlacingBid(false)
    }
  }

  const setupAutoBid = async () => {
    if (maxAutoBid <= auction.currentBid) {
      toast.error('Maksymalna kwota musi być wyższa od aktualnej oferty')
      return
    }

    try {
      const response = await fetch('/api/auto-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auctionId: auction.id,
          maxBid: maxAutoBid,
          enabled: autoBidEnabled
        })
      })

      if (!response.ok) {
        throw new Error('Błąd konfiguracji auto-licytacji')
      }

      onAutoBidSetup?.(maxAutoBid)
      
      toast.success(autoBidEnabled ? 'Auto-licytacja włączona' : 'Auto-licytacja wyłączona', {
        description: autoBidEnabled ? `Maksimum: ${formatBidAmount(maxAutoBid)}` : undefined
      })

    } catch (error: any) {
      toast.error('Błąd auto-licytacji', {
        description: error.message
      })
    }
  }

  const timeRemaining = formatTimeRemaining(auction.auctionEndTime)
  const isEndingSoon = timeRemaining.includes('m') && parseInt(timeRemaining) < 10

  return (
    <div className="space-y-6">
      {/* Main Auction Panel */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              {auction.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {ws.participants} uczestników
              </Badge>
              {ws.isConnected ? (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Na żywo
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Bid & Time */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Aktualna oferta</Label>
              <div className="text-3xl font-bold text-green-600">
                {formatBidAmount(auction.currentBid, auction.currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                {auction.bidCount} ofert • Następna min: {formatBidAmount(auction.nextMinBid, auction.currency)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Czas pozostały</Label>
              <div className={`text-3xl font-bold ${isEndingSoon ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                {timeRemaining}
              </div>
              <p className="text-sm text-muted-foreground">
                Status: {auction.status === 'live' ? 'Na żywo' : 'Zakończona'}
              </p>
            </div>
          </div>

          {/* Reserve Price Status */}
          {auction.reservePrice && (
            <Alert className={auction.reserveMet ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {auction.reserveMet ? (
                  <span className="text-green-700">Cena minimalna została osiągnięta</span>
                ) : (
                  <span className="text-yellow-700">Cena minimalna jeszcze nie osiągnięta</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Bid Buttons */}
          {auction.canBid && !auction.isOwner && (
            <div className="space-y-4">
              <Label>Szybkie licytowanie</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {auction.quickBidAmounts.map((amount, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickBid(amount)}
                    disabled={isPlacingBid || amount <= auction.currentBid}
                    className="touch-optimized flex flex-col h-auto py-3"
                  >
                    <span className="text-xs text-muted-foreground">
                      {formatBidIncrement(amount - auction.currentBid, auction.currency)}
                    </span>
                    <span className="font-semibold">
                      {formatBidAmount(amount, auction.currency)}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Bid Input */}
          {auction.canBid && !auction.isOwner && (
            <div className="space-y-4">
              <Label>Własna kwota</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  placeholder={`Min: ${formatBidAmount(auction.nextMinBid, auction.currency)}`}
                  className="touch-optimized"
                  min={auction.nextMinBid}
                />
                <Button
                  onClick={() => placeBid(bidAmount)}
                  disabled={isPlacingBid || bidAmount < auction.nextMinBid}
                  className="touch-optimized min-w-[120px]"
                >
                  {isPlacingBid ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Licytuję...
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4 mr-2" />
                      Licytuj
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Emergency Bid */}
          {auction.canBid && !auction.isOwner && isEndingSoon && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-800">Awaryjne licytowanie</h4>
                  <p className="text-sm text-red-600">Priorytetowa oferta w ostatnich minutach</p>
                </div>
                <Button
                  onClick={handleEmergencyBid}
                  disabled={emergencyBidActive}
                  className="bg-red-600 hover:bg-red-700 touch-optimized"
                >
                  {emergencyBidActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Licytuj teraz!
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Bid Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Auto-licytacja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Włącz auto-licytację</Label>
              <p className="text-sm text-muted-foreground">
                Automatyczne licytowanie do maksymalnej kwoty
              </p>
            </div>
            <Switch
              checked={autoBidEnabled}
              onCheckedChange={setAutoBidEnabled}
            />
          </div>

          {autoBidEnabled && (
            <div className="space-y-4">
              <div>
                <Label>Maksymalna kwota</Label>
                <Input
                  type="number"
                  value={maxAutoBid}
                  onChange={(e) => setMaxAutoBid(Number(e.target.value))}
                  placeholder="Wprowadź maksymalną kwotę"
                  className="touch-optimized"
                  min={auction.nextMinBid}
                />
              </div>
              
              <Button
                onClick={setupAutoBid}
                className="w-full touch-optimized"
              >
                Zapisz ustawienia auto-licytacji
              </Button>

              {auction.maxAutoBid > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    Auto-licytacja aktywna do {formatBidAmount(auction.maxAutoBid, auction.currency)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Ustawienia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Biometric Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5" />
              <div>
                <Label>Uwierzytelnienie biometryczne</Label>
                <p className="text-sm text-muted-foreground">
                  {biometric.isSupported ? 'Dostępne' : 'Niedostępne'}
                </p>
              </div>
            </div>
            {biometric.isSupported && (
              <Dialog open={showBiometricSetup} onOpenChange={setShowBiometricSetup}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    {biometric.isEnabled ? 'Skonfigurowane' : 'Skonfiguruj'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Uwierzytelnienie biometryczne</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Zabezpiecz swoje licytacje za pomocą odcisku palca lub Face ID
                    </p>
                    {!biometric.isEnabled ? (
                      <Button
                        onClick={() => biometric.enable('user')}
                        disabled={biometric.isAuthenticating}
                        className="w-full"
                      >
                        {biometric.isAuthenticating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Fingerprint className="w-4 h-4 mr-2" />
                        )}
                        Włącz uwierzytelnienie
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Uwierzytelnienie włączone</span>
                        </div>
                        <Button
                          onClick={biometric.disable}
                          variant="outline"
                          className="w-full"
                        >
                          Wyłącz
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <Label>Powiadomienia push</Label>
                <p className="text-sm text-muted-foreground">
                  Otrzymuj powiadomienia o nowych ofertach
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5" />
              <div>
                <Label>Wibracje</Label>
                <p className="text-sm text-muted-foreground">
                  Wibracje przy nowych ofertach
                </p>
              </div>
            </div>
            <Switch
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}