"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Gavel, TrendingUp, Users, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuctionWebSocket } from '@/lib/providers/websocket-provider'
import { LiveCountdownTimer } from './live-countdown-timer'
import { toast } from 'sonner'

interface LiveBiddingPanelProps {
  auction: {
    id: string
    listingId: string
    title: string
    currentBid: number
    bidCount: number
    minBidIncrement: number
    nextMinBid: number
    auctionEndTime: string
    reservePrice?: number
    reserveMet: boolean
    currency: string
    isOwner?: boolean
    canBid?: boolean
  }
  className?: string
}

interface BidState {
  amount: number
  isValid: boolean
  error?: string
}

export function LiveBiddingPanel({ auction, className = '' }: LiveBiddingPanelProps) {
  const [bidAmount, setBidAmount] = useState(auction.nextMinBid)
  const [bidState, setBidState] = useState<BidState>({ amount: auction.nextMinBid, isValid: true })
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [lastBidTime, setLastBidTime] = useState<string | null>(null)
  const [currentAuction, setCurrentAuction] = useState(auction)
  
  const ws = useAuctionWebSocket(auction.id)

  // Update auction data from WebSocket events
  useEffect(() => {
    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auction.id) {
        setCurrentAuction(prev => ({
          ...prev,
          currentBid: data.bid.newCurrentBid,
          bidCount: data.bid.newBidCount,
          nextMinBid: data.bid.nextMinBid
        }))
        
        // Update bid amount to new minimum
        setBidAmount(data.bid.nextMinBid)
        setLastBidTime(data.bid.timestamp)
        
        // Show notification for new bids
        if (data.bid.userId) {
          toast.info(`New bid: CHF ${data.bid.newCurrentBid.toLocaleString()}`, {
            description: `By ${data.bid.userName}`,
            duration: 3000
          })
        }
      }
    }

    const handleAuctionExtended = (data: any) => {
      if (data.auctionId === auction.id) {
        setCurrentAuction(prev => ({
          ...prev,
          auctionEndTime: data.newEndTime
        }))
        
        toast.success('Auction Extended!', {
          description: `Extended by ${data.extensionMinutes} minutes`,
          duration: 5000
        })
      }
    }

    const handleAuctionEnded = (data: any) => {
      if (data.auctionId === auction.id) {
        toast.info('Auction Ended', {
          description: data.winnerId ? 'Auction completed with winner' : 'Auction ended without winner',
          duration: 5000
        })
      }
    }

    ws.on('bid_placed', handleBidPlaced)
    ws.on('auction_extended', handleAuctionExtended)
    ws.on('auction_ended', handleAuctionEnded)

    return () => {
      ws.off('bid_placed', handleBidPlaced)
      ws.off('auction_extended', handleAuctionExtended)
      ws.off('auction_ended', handleAuctionEnded)
    }
  }, [auction.id, ws])

  // Validate bid amount
  const validateBid = useCallback((amount: number): BidState => {
    if (amount < currentAuction.nextMinBid) {
      return {
        amount,
        isValid: false,
        error: `Minimum bid is CHF ${currentAuction.nextMinBid.toLocaleString()}`
      }
    }

    if (amount > 10000000) { // 10M CHF limit
      return {
        amount,
        isValid: false,
        error: 'Bid amount too high'
      }
    }

    return { amount, isValid: true }
  }, [currentAuction.nextMinBid])

  // Handle bid amount change
  const handleBidAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    setBidAmount(amount)
    setBidState(validateBid(amount))
  }

  // Place bid
  const handlePlaceBid = async () => {
    if (!bidState.isValid || isPlacingBid) return

    setIsPlacingBid(true)

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          listing_id: currentAuction.listingId,
          auction_id: currentAuction.id,
          amount: bidAmount,
          is_auto_bid: false
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place bid')
      }

      toast.success('Bid Placed Successfully!', {
        description: `Your bid of CHF ${bidAmount.toLocaleString()} has been placed`,
        duration: 5000
      })

      // Reset form
      setBidAmount(result.auction_updated.next_min_bid)
      setBidState(validateBid(result.auction_updated.next_min_bid))

    } catch (error: any) {
      console.error('Error placing bid:', error)
      toast.error('Failed to Place Bid', {
        description: error.message || 'Please try again',
        duration: 5000
      })
    } finally {
      setIsPlacingBid(false)
    }
  }

  // Get auth token
  const getAuthToken = async () => {
    const { createClientComponentClient } = await import('@/lib/supabase')
    const supabase = createClientComponentClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  // Quick bid buttons
  const quickBidAmounts = [
    currentAuction.nextMinBid,
    currentAuction.nextMinBid + currentAuction.minBidIncrement,
    currentAuction.nextMinBid + (currentAuction.minBidIncrement * 2),
    currentAuction.nextMinBid + (currentAuction.minBidIncrement * 5)
  ]

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            Live Bidding
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {ws.participants} watching
            </Badge>
            {ws.isConnected ? (
              <Badge variant="outline" className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
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

      <CardContent className="space-y-4">
        {/* Current Bid Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Current Bid</p>
            <p className="text-2xl font-bold text-green-600">
              {currentAuction.currency} {currentAuction.currentBid.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {currentAuction.bidCount} bid{currentAuction.bidCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <LiveCountdownTimer 
              auctionId={currentAuction.id}
              endTime={currentAuction.auctionEndTime}
              variant="compact"
            />
          </div>
        </div>

        {/* Reserve Price Status */}
        {currentAuction.reservePrice && (
          <Alert className={currentAuction.reserveMet ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {currentAuction.reserveMet ? (
                <span className="text-green-700">Reserve price has been met</span>
              ) : (
                <span className="text-yellow-700">Reserve price not yet met</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Bidding Form */}
        {currentAuction.canBid && !currentAuction.isOwner ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Bid Amount</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => handleBidAmountChange(e.target.value)}
                    placeholder={`Minimum: ${currentAuction.currency} ${currentAuction.nextMinBid.toLocaleString()}`}
                    className={bidState.isValid ? '' : 'border-red-300 focus:border-red-500'}
                    disabled={isPlacingBid}
                  />
                  {bidState.error && (
                    <p className="text-sm text-red-600 mt-1">{bidState.error}</p>
                  )}
                </div>
                <Button 
                  onClick={handlePlaceBid}
                  disabled={!bidState.isValid || isPlacingBid}
                  className="min-w-[100px]"
                >
                  {isPlacingBid ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing...
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4 mr-2" />
                      Place Bid
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Bid Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Bid</p>
              <div className="grid grid-cols-2 gap-2">
                {quickBidAmounts.map((amount, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBidAmountChange(amount.toString())}
                    disabled={isPlacingBid}
                    className="text-xs"
                  >
                    {currentAuction.currency} {amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : currentAuction.isOwner ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You cannot bid on your own auction
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to place bids
            </AlertDescription>
          </Alert>
        )}

        {/* Bid Statistics */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{currentAuction.bidCount}</p>
              <p className="text-xs text-gray-600">Total Bids</p>
            </div>
            <div>
              <p className="text-lg font-semibold">
                {currentAuction.currency} {currentAuction.minBidIncrement.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Min Increment</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{ws.participants}</p>
              <p className="text-xs text-gray-600">Watching</p>
            </div>
          </div>
        </div>

        {/* Last Bid Info */}
        {lastBidTime && (
          <div className="text-xs text-gray-500 text-center">
            Last bid placed {new Date(lastBidTime).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Simplified bidding button component
export function QuickBidButton({ 
  auction, 
  amount, 
  variant = "outline" 
}: { 
  auction: any
  amount: number
  variant?: "outline" | "default" | "secondary"
}) {
  const [isPlacing, setIsPlacing] = useState(false)

  const handleQuickBid = async () => {
    setIsPlacing(true)
    try {
      const { createClientComponentClient } = await import('@/lib/supabase')
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          listing_id: auction.listingId,
          auction_id: auction.id,
          amount: amount,
          is_auto_bid: false
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to place bid')
      }

      toast.success(`Bid placed: CHF ${amount.toLocaleString()}`)
    } catch (error: any) {
      toast.error('Failed to place bid', {
        description: error.message
      })
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleQuickBid}
      disabled={isPlacing}
      className="min-w-[80px]"
    >
      {isPlacing ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        `CHF ${amount.toLocaleString()}`
      )}
    </Button>
  )
}