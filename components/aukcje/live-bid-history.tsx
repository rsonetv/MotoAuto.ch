"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { History, TrendingUp, Crown, Bot, User, RefreshCw } from 'lucide-react'
import { useAuctionWebSocket } from '@/lib/providers/websocket-provider'
import { formatDistanceToNow } from 'date-fns'

interface Bid {
  id: string
  amount: number
  userId: string
  userName: string
  userAvatar?: string
  isDealer: boolean
  isAutomatic: boolean
  status: 'active' | 'outbid' | 'winning' | 'won' | 'lost'
  placedAt: string
  isCurrentUser?: boolean
}

interface LiveBidHistoryProps {
  auctionId: string
  initialBids?: Bid[]
  currentUserId?: string
  className?: string
  maxHeight?: string
  showUserDetails?: boolean
}

export function LiveBidHistory({ 
  auctionId, 
  initialBids = [], 
  currentUserId,
  className = '',
  maxHeight = '400px',
  showUserDetails = true
}: LiveBidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>(initialBids)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const ws = useAuctionWebSocket(auctionId)

  // Load initial bid history
  const loadBidHistory = useCallback(async () => {
    if (bids.length > 0) return // Don't reload if we already have bids
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/auctions/${auctionId}`)
      if (response.ok) {
        const auctionData = await response.json()
        if (auctionData.data.bids) {
          setBids(auctionData.data.bids.map((bid: any) => ({
            id: bid.id,
            amount: bid.amount,
            userId: bid.profiles?.id || 'anonymous',
            userName: bid.profiles?.full_name || bid.profiles?.dealer_name || 'Anonymous Bidder',
            userAvatar: bid.profiles?.avatar_url,
            isDealer: bid.profiles?.is_dealer || false,
            isAutomatic: bid.is_auto_bid,
            status: bid.status,
            placedAt: bid.placed_at,
            isCurrentUser: currentUserId === bid.profiles?.id
          })))
        }
      }
    } catch (error) {
      console.error('Error loading bid history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [auctionId, bids.length, currentUserId])

  // Load bid history on mount
  useEffect(() => {
    loadBidHistory()
  }, [loadBidHistory])

  // Listen for new bids via WebSocket
  useEffect(() => {
    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auctionId) {
        const newBid: Bid = {
          id: data.bid.id,
          amount: data.bid.amount,
          userId: data.bid.userId,
          userName: data.bid.userName,
          userAvatar: data.bid.userAvatar,
          isDealer: data.bid.isDealer || false,
          isAutomatic: data.bid.isAutomatic,
          status: 'winning',
          placedAt: data.bid.timestamp,
          isCurrentUser: currentUserId === data.bid.userId
        }

        setBids(prevBids => {
          // Mark previous bids as outbid
          const updatedBids = prevBids.map(bid => ({
            ...bid,
            status: bid.status === 'winning' ? 'outbid' as const : bid.status
          }))
          
          // Add new bid at the beginning
          return [newBid, ...updatedBids]
        })
        
        setLastUpdate(new Date())
      }
    }

    const handleAuctionEnded = (data: any) => {
      if (data.auctionId === auctionId) {
        setBids(prevBids => prevBids.map(bid => ({
          ...bid,
          status: bid.status === 'winning' ? 'won' as const : 
                  bid.status === 'outbid' ? 'lost' as const : bid.status
        })))
      }
    }

    ws.on('bid_placed', handleBidPlaced)
    ws.on('auction_ended', handleAuctionEnded)

    return () => {
      ws.off('bid_placed', handleBidPlaced)
      ws.off('auction_ended', handleAuctionEnded)
    }
  }, [auctionId, currentUserId, ws])

  // Get bid status styling
  const getBidStatusStyling = (bid: Bid) => {
    switch (bid.status) {
      case 'winning':
        return {
          badge: 'default',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800'
        }
      case 'won':
        return {
          badge: 'default',
          bgColor: 'bg-green-100 border-green-300',
          textColor: 'text-green-900'
        }
      case 'outbid':
        return {
          badge: 'secondary',
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-600'
        }
      case 'lost':
        return {
          badge: 'secondary',
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-500'
        }
      default:
        return {
          badge: 'outline',
          bgColor: 'bg-white border-gray-200',
          textColor: 'text-gray-700'
        }
    }
  }

  // Format bid amount
  const formatBidAmount = (amount: number) => {
    return `CHF ${amount.toLocaleString()}`
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Bid History
            {bids.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {bids.length} bid{bids.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadBidHistory}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {ws.isConnected && (
              <Badge variant="outline" className="text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="px-6 pb-6" style={{ maxHeight }}>
          {isLoading && bids.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Loading bid history...
            </div>
          ) : bids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <History className="w-8 h-8 mb-2 opacity-50" />
              <p>No bids yet</p>
              <p className="text-sm">Be the first to place a bid!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bids.map((bid, index) => {
                const styling = getBidStatusStyling(bid)
                const isHighestBid = index === 0
                
                return (
                  <div
                    key={bid.id}
                    className={`relative p-4 rounded-lg border transition-all ${styling.bgColor} ${
                      bid.isCurrentUser ? 'ring-2 ring-blue-200' : ''
                    }`}
                  >
                    {/* Highest bid indicator */}
                    {isHighestBid && bid.status === 'winning' && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-600 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Highest
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {showUserDetails && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={bid.userAvatar} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(bid.userName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${styling.textColor}`}>
                              {showUserDetails ? bid.userName : `Bidder ${String.fromCharCode(65 + (index % 26))}`}
                            </span>
                            
                            {bid.isDealer && (
                              <Badge variant="outline" className="text-xs">
                                Dealer
                              </Badge>
                            )}
                            
                            {bid.isAutomatic && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                Auto
                              </Badge>
                            )}
                            
                            {bid.isCurrentUser && (
                              <Badge variant="outline" className="text-xs text-blue-600">
                                You
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(bid.placedAt), { addSuffix: true })}
                            </span>
                            
                            <Badge variant={styling.badge as any} className="text-xs">
                              {bid.status === 'winning' ? 'Current High' :
                               bid.status === 'won' ? 'Won' :
                               bid.status === 'outbid' ? 'Outbid' :
                               bid.status === 'lost' ? 'Lost' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${styling.textColor}`}>
                          {formatBidAmount(bid.amount)}
                        </div>
                        
                        {index > 0 && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +{formatBidAmount(bid.amount - bids[index + 1]?.amount || 0)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Summary footer */}
        {bids.length > 0 && (
          <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>
                Total: {bids.length} bid{bids.length !== 1 ? 's' : ''} from {new Set(bids.map(b => b.userId)).size} bidder{new Set(bids.map(b => b.userId)).size !== 1 ? 's' : ''}
              </span>
              <span>
                Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for smaller spaces
export function CompactBidHistory({ 
  auctionId, 
  maxItems = 3,
  className = '' 
}: { 
  auctionId: string
  maxItems?: number
  className?: string 
}) {
  const [recentBids, setRecentBids] = useState<Bid[]>([])
  const ws = useAuctionWebSocket(auctionId)

  useEffect(() => {
    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auctionId) {
        const newBid: Bid = {
          id: data.bid.id,
          amount: data.bid.amount,
          userId: data.bid.userId,
          userName: data.bid.userName,
          isDealer: data.bid.isDealer || false,
          isAutomatic: data.bid.isAutomatic,
          status: 'winning',
          placedAt: data.bid.timestamp
        }

        setRecentBids(prev => [newBid, ...prev.slice(0, maxItems - 1)])
      }
    }

    ws.on('bid_placed', handleBidPlaced)
    return () => ws.off('bid_placed', handleBidPlaced)
  }, [auctionId, maxItems, ws])

  if (recentBids.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent bids</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
        <History className="w-4 h-4" />
        Recent Bids
      </h4>
      
      {recentBids.map((bid, index) => (
        <div key={bid.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {bid.userName}
            </span>
            {bid.isAutomatic && (
              <Bot className="w-3 h-3 text-gray-400" />
            )}
          </div>
          <div className="text-sm font-bold text-green-600">
            CHF {bid.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}