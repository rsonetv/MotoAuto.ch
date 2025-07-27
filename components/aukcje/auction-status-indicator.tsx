"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Clock, 
  Gavel, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Pause, 
  Play,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'
import { useAuctionWebSocket } from '@/lib/providers/websocket-provider'
import { LiveCountdownTimer } from './live-countdown-timer'

interface AuctionStatus {
  state: 'draft' | 'active' | 'extended' | 'ended' | 'cancelled'
  endTime: string
  currentBid: number
  bidCount: number
  reservePrice?: number
  reserveMet: boolean
  extensionCount: number
  maxExtensions: number
  participantCount?: number
}

interface AuctionStatusIndicatorProps {
  auctionId: string
  initialStatus: AuctionStatus
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  showParticipants?: boolean
}

export function AuctionStatusIndicator({ 
  auctionId, 
  initialStatus, 
  className = '',
  variant = 'default',
  showParticipants = true
}: AuctionStatusIndicatorProps) {
  const [status, setStatus] = useState<AuctionStatus>(initialStatus)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const ws = useAuctionWebSocket(auctionId)

  // Update status from WebSocket events
  useEffect(() => {
    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          currentBid: data.bid.newCurrentBid,
          bidCount: data.bid.newBidCount
        }))
        setLastUpdate(new Date())
      }
    }

    const handleAuctionExtended = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          state: 'extended',
          endTime: data.newEndTime,
          extensionCount: data.extensionCount
        }))
        setLastUpdate(new Date())
      }
    }

    const handleAuctionEnded = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          state: 'ended'
        }))
        setLastUpdate(new Date())
      }
    }

    const handleAuctionStatusChanged = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          state: data.newStatus as any
        }))
        setLastUpdate(new Date())
      }
    }

    const handleParticipantJoined = (data: any) => {
      setStatus(prev => ({
        ...prev,
        participantCount: data.participantCount
      }))
    }

    const handleParticipantLeft = (data: any) => {
      setStatus(prev => ({
        ...prev,
        participantCount: data.participantCount
      }))
    }

    ws.on('bid_placed', handleBidPlaced)
    ws.on('auction_extended', handleAuctionExtended)
    ws.on('auction_ended', handleAuctionEnded)
    ws.on('auction_status_changed', handleAuctionStatusChanged)
    ws.on('participant_joined', handleParticipantJoined)
    ws.on('participant_left', handleParticipantLeft)

    return () => {
      ws.off('bid_placed', handleBidPlaced)
      ws.off('auction_extended', handleAuctionExtended)
      ws.off('auction_ended', handleAuctionEnded)
      ws.off('auction_status_changed', handleAuctionStatusChanged)
      ws.off('participant_joined', handleParticipantJoined)
      ws.off('participant_left', handleParticipantLeft)
    }
  }, [auctionId, ws])

  // Get status configuration
  const getStatusConfig = (state: AuctionStatus['state']) => {
    switch (state) {
      case 'draft':
        return {
          icon: Pause,
          label: 'Draft',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          badgeVariant: 'secondary' as const,
          description: 'Auction not yet started'
        }
      case 'active':
        return {
          icon: Play,
          label: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'default' as const,
          description: 'Auction is live and accepting bids'
        }
      case 'extended':
        return {
          icon: Clock,
          label: 'Extended',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeVariant: 'secondary' as const,
          description: 'Auction time has been extended'
        }
      case 'ended':
        return {
          icon: CheckCircle,
          label: 'Ended',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'outline' as const,
          description: 'Auction has completed'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          description: 'Auction has been cancelled'
        }
      default:
        return {
          icon: AlertTriangle,
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeVariant: 'outline' as const,
          description: 'Status unknown'
        }
    }
  }

  const statusConfig = getStatusConfig(status.state)
  const StatusIcon = statusConfig.icon

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={statusConfig.badgeVariant} className="flex items-center gap-1">
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </Badge>
        
        {status.state === 'active' || status.state === 'extended' ? (
          <LiveCountdownTimer 
            auctionId={auctionId}
            endTime={status.endTime}
            variant="compact"
            showIcon={false}
          />
        ) : null}
        
        {showParticipants && status.participantCount !== undefined && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {status.participantCount}
          </Badge>
        )}
      </div>
    )
  }

  // Render detailed variant
  if (variant === 'detailed') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{statusConfig.label}</h3>
                  <p className="text-sm text-gray-600">{statusConfig.description}</p>
                </div>
              </div>
              
              {ws.isConnected && (
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  Live
                </Badge>
              )}
            </div>

            {/* Auction Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Current Bid</p>
                <p className="text-xl font-bold text-green-600">
                  CHF {status.currentBid.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {status.bidCount} bid{status.bidCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              {(status.state === 'active' || status.state === 'extended') && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Time Remaining</p>
                  <LiveCountdownTimer 
                    auctionId={auctionId}
                    endTime={status.endTime}
                    variant="compact"
                  />
                </div>
              )}
            </div>

            {/* Reserve Price Status */}
            {status.reservePrice && (
              <Alert className={status.reserveMet ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {status.reserveMet ? (
                    <span className="text-green-700">Reserve price has been met</span>
                  ) : (
                    <span className="text-yellow-700">Reserve price not yet met</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Extension Info */}
            {status.state === 'extended' && (
              <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <span className="text-orange-700">
                    Auction extended {status.extensionCount} time{status.extensionCount !== 1 ? 's' : ''} 
                    ({status.maxExtensions - status.extensionCount} extension{status.maxExtensions - status.extensionCount !== 1 ? 's' : ''} remaining)
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Participants */}
            {showParticipants && status.participantCount !== undefined && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {status.participantCount} watching this auction
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor} ${className}`}>
      <div className={`p-2 rounded-full bg-white`}>
        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{statusConfig.label}</span>
          <Badge variant={statusConfig.badgeVariant} className="text-xs">
            CHF {status.currentBid.toLocaleString()}
          </Badge>
          {status.bidCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {status.bidCount} bid{status.bidCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-1">
          {(status.state === 'active' || status.state === 'extended') && (
            <LiveCountdownTimer 
              auctionId={auctionId}
              endTime={status.endTime}
              variant="compact"
              showIcon={false}
            />
          )}
          
          {showParticipants && status.participantCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              {status.participantCount} watching
            </div>
          )}
          
          {status.state === 'extended' && (
            <div className="text-xs text-orange-600">
              Extended {status.extensionCount}x
            </div>
          )}
        </div>
      </div>
      
      {ws.isConnected && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      )}
    </div>
  )
}

// Simple status badge component
export function AuctionStatusBadge({ 
  status, 
  className = '' 
}: { 
  status: AuctionStatus['state']
  className?: string 
}) {
  const statusConfig = {
    draft: { variant: 'secondary' as const, label: 'Draft', icon: Pause },
    active: { variant: 'default' as const, label: 'Live', icon: Play },
    extended: { variant: 'secondary' as const, label: 'Extended', icon: Clock },
    ended: { variant: 'outline' as const, label: 'Ended', icon: CheckCircle },
    cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle }
  }

  const config = statusConfig[status] || statusConfig.draft
  const StatusIcon = config.icon

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      <StatusIcon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

// Hook for auction status
export function useAuctionStatus(auctionId: string, initialStatus: AuctionStatus) {
  const [status, setStatus] = useState<AuctionStatus>(initialStatus)
  const ws = useAuctionWebSocket(auctionId)

  useEffect(() => {
    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          currentBid: data.bid.newCurrentBid,
          bidCount: data.bid.newBidCount
        }))
      }
    }

    const handleAuctionExtended = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          state: 'extended',
          endTime: data.newEndTime,
          extensionCount: data.extensionCount
        }))
      }
    }

    const handleAuctionEnded = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus(prev => ({
          ...prev,
          state: 'ended'
        }))
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
  }, [auctionId, ws])

  return status
}