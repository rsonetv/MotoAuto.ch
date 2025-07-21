"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gavel, TrendingUp, Clock, Users } from "lucide-react"
import { formatCHF } from "@/lib/swiss/currency"
import { useAuth } from "@/lib/hooks/use-auth"

interface LiveBiddingProps {
  auctionId: string
  currentBid: number
  minIncrement: number
  reservePrice?: number
  endTime: string
  totalBids: number
  isActive: boolean
}

export function LiveBidding({
  auctionId,
  currentBid,
  minIncrement,
  reservePrice,
  endTime,
  totalBids,
  isActive,
}: LiveBiddingProps) {
  const { user } = useAuth()
  const [bidAmount, setBidAmount] = useState(currentBid + minIncrement)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [recentBids, setRecentBids] = useState<
    Array<{
      id: string
      amount: number
      timestamp: string
      bidder: string
    }>
  >([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`)
        }
      } else {
        setTimeLeft("Auktion beendet")
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  // WebSocket connection for real-time updates (mock implementation)
  useEffect(() => {
    // In a real implementation, you would connect to a WebSocket here
    // For now, we'll simulate real-time updates
    const interval = setInterval(() => {
      // Mock receiving new bids
      if (Math.random() > 0.95) {
        // 5% chance every second
        const newBid = {
          id: Date.now().toString(),
          amount: currentBid + minIncrement + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          bidder: "Bieter " + Math.floor(Math.random() * 100),
        }
        setRecentBids((prev) => [newBid, ...prev.slice(0, 4)])
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentBid, minIncrement])

  const submitBid = async () => {
    if (!user) {
      setError("Sie müssen angemeldet sein, um zu bieten.")
      return
    }

    if (bidAmount < currentBid + minIncrement) {
      setError(`Mindestgebot: ${formatCHF(currentBid + minIncrement)}`)
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // In a real implementation, you would submit the bid to your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(`Gebot von ${formatCHF(bidAmount)} erfolgreich abgegeben!`)
      setBidAmount(bidAmount + minIncrement)
    } catch (error) {
      setError("Fehler beim Abgeben des Gebots. Bitte versuchen Sie es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickBid = (increment: number) => {
    setBidAmount(currentBid + increment)
  }

  const reserveMet = reservePrice ? currentBid >= reservePrice : true

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Live Auktion
            {isActive ? (
              <Badge variant="default" className="bg-green-600">
                Aktiv
              </Badge>
            ) : (
              <Badge variant="secondary">Beendet</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCHF(currentBid)}</div>
              <div className="text-sm text-muted-foreground">Aktuelles Gebot</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {timeLeft}
              </div>
              <div className="text-sm text-muted-foreground">Verbleibende Zeit</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {totalBids} Gebote
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Min. Erhöhung: {formatCHF(minIncrement)}
            </div>
          </div>

          {reservePrice && (
            <div className="flex items-center justify-between text-sm">
              <span>Mindestpreis:</span>
              <span className={reserveMet ? "text-green-600" : "text-orange-600"}>
                {reserveMet ? "✓ Erreicht" : "Nicht erreicht"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bidding Interface */}
      {isActive && user && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Gebot abgeben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={currentBid + minIncrement}
                  step={minIncrement}
                  className="text-lg font-semibold"
                />
                <Button
                  onClick={submitBid}
                  disabled={isSubmitting || bidAmount < currentBid + minIncrement}
                  className="shrink-0"
                >
                  {isSubmitting ? "Bieten..." : "Bieten"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => quickBid(minIncrement)}>
                  +{formatCHF(minIncrement)}
                </Button>
                <Button variant="outline" size="sm" onClick={() => quickBid(minIncrement * 2)}>
                  +{formatCHF(minIncrement * 2)}
                </Button>
                <Button variant="outline" size="sm" onClick={() => quickBid(minIncrement * 5)}>
                  +{formatCHF(minIncrement * 5)}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Bids */}
      {recentBids.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Letzte Gebote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBids.map((bid) => (
                <div key={bid.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-semibold">{formatCHF(bid.amount)}</div>
                    <div className="text-sm text-muted-foreground">{bid.bidder}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(bid.timestamp).toLocaleTimeString("de-CH")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!user && isActive && (
        <Alert>
          <AlertDescription>
            <a href="/auth/login" className="text-primary underline">
              Melden Sie sich an
            </a>
            , um an dieser Auktion teilzunehmen.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
