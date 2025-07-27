"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuctionWebSocket } from '@/lib/providers/websocket-provider'

interface LiveCountdownTimerProps {
  auctionId: string
  endTime: string
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'compact' | 'large'
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function LiveCountdownTimer({ 
  auctionId, 
  endTime, 
  className = '',
  showIcon = true,
  variant = 'default'
}: LiveCountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
  const [isExpired, setIsExpired] = useState(false)
  const [isLastMinute, setIsLastMinute] = useState(false)
  const [currentEndTime, setCurrentEndTime] = useState(endTime)
  
  const ws = useAuctionWebSocket(auctionId)

  // Calculate time remaining
  const calculateTimeRemaining = useCallback((targetTime: string): TimeRemaining => {
    const now = new Date().getTime()
    const target = new Date(targetTime).getTime()
    const difference = target - now

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, total: difference }
  }, [])

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(currentEndTime)
      setTimeRemaining(remaining)
      setIsExpired(remaining.total <= 0)
      setIsLastMinute(remaining.total <= 60000 && remaining.total > 0) // Last minute
    }

    updateCountdown() // Initial calculation
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [currentEndTime, calculateTimeRemaining])

  // Listen for auction extensions
  useEffect(() => {
    const handleAuctionExtended = (data: any) => {
      if (data.auctionId === auctionId) {
        setCurrentEndTime(data.newEndTime)
        console.log(`Auction ${auctionId} extended to ${data.newEndTime}`)
      }
    }

    ws.on('auction_extended', handleAuctionExtended)

    return () => {
      ws.off('auction_extended', handleAuctionExtended)
    }
  }, [auctionId, ws])

  // Format time display
  const formatTime = (time: TimeRemaining) => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`
    } else {
      return `${time.seconds}s`
    }
  }

  // Get badge variant based on time remaining
  const getBadgeVariant = () => {
    if (isExpired) return 'destructive'
    if (isLastMinute) return 'destructive'
    if (timeRemaining.total <= 300000) return 'secondary' // Last 5 minutes
    if (timeRemaining.total <= 3600000) return 'secondary' // Last hour
    return 'outline'
  }

  // Get display text
  const getDisplayText = () => {
    if (isExpired) return 'Auction Ended'
    return formatTime(timeRemaining)
  }

  // Render based on variant
  const renderTimer = () => {
    const badgeVariant = getBadgeVariant()
    const displayText = getDisplayText()

    switch (variant) {
      case 'compact':
        return (
          <Badge variant={badgeVariant} className={`${className} ${isLastMinute ? 'animate-pulse' : ''}`}>
            {showIcon && <Clock className="w-3 h-3 mr-1" />}
            {displayText}
          </Badge>
        )

      case 'large':
        return (
          <div className={`flex items-center space-x-2 p-4 rounded-lg border ${
            isExpired ? 'border-red-200 bg-red-50' : 
            isLastMinute ? 'border-red-200 bg-red-50 animate-pulse' :
            timeRemaining.total <= 300000 ? 'border-yellow-200 bg-yellow-50' :
            'border-gray-200 bg-gray-50'
          } ${className}`}>
            {showIcon && (
              <div className={`p-2 rounded-full ${
                isExpired ? 'bg-red-100' :
                isLastMinute ? 'bg-red-100' :
                timeRemaining.total <= 300000 ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {isLastMinute ? (
                  <AlertTriangle className={`w-5 h-5 ${
                    isExpired ? 'text-red-600' : 'text-red-500'
                  }`} />
                ) : (
                  <Clock className={`w-5 h-5 ${
                    isExpired ? 'text-red-600' :
                    timeRemaining.total <= 300000 ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                )}
              </div>
            )}
            <div>
              <div className={`text-lg font-semibold ${
                isExpired ? 'text-red-600' :
                isLastMinute ? 'text-red-600' :
                timeRemaining.total <= 300000 ? 'text-yellow-600' :
                'text-gray-900'
              }`}>
                {displayText}
              </div>
              {!isExpired && (
                <div className="text-sm text-gray-500">
                  {isLastMinute ? 'Auction ending soon!' :
                   timeRemaining.total <= 300000 ? 'Less than 5 minutes remaining' :
                   'Time remaining'}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className={`flex items-center space-x-2 ${className}`}>
            {showIcon && (
              <div className={`p-1 rounded ${
                isExpired ? 'bg-red-100' :
                isLastMinute ? 'bg-red-100' :
                timeRemaining.total <= 300000 ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {isLastMinute ? (
                  <AlertTriangle className={`w-4 h-4 ${
                    isExpired ? 'text-red-600' : 'text-red-500'
                  }`} />
                ) : (
                  <Clock className={`w-4 h-4 ${
                    isExpired ? 'text-red-600' :
                    timeRemaining.total <= 300000 ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                )}
              </div>
            )}
            <Badge variant={badgeVariant} className={isLastMinute ? 'animate-pulse' : ''}>
              {displayText}
            </Badge>
          </div>
        )
    }
  }

  return renderTimer()
}

// Hook for countdown functionality
export function useCountdown(endTime: string) {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date().getTime()
      const target = new Date(endTime).getTime()
      const difference = target - now

      setTimeRemaining(Math.max(0, difference))
      setIsExpired(difference <= 0)
    }

    calculateRemaining()
    const interval = setInterval(calculateRemaining, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'Expired'

    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  return {
    timeRemaining,
    isExpired,
    isLastMinute: timeRemaining <= 60000 && timeRemaining > 0,
    isLastFiveMinutes: timeRemaining <= 300000 && timeRemaining > 0,
    formatted: formatTimeRemaining(timeRemaining)
  }
}