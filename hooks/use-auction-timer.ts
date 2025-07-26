import { useState, useEffect, useCallback } from "react"
import { timeUntil } from "@/lib/utils"

interface UseAuctionTimerProps {
  endsAt: string
  softClose?: boolean
  extensionSec?: number
  onTimeUpdate?: (timeLeft: ReturnType<typeof timeUntil>) => void
  onAuctionEnd?: () => void
  onSoftCloseExtension?: (newEndTime: string) => void
}

export function useAuctionTimer({
  endsAt,
  softClose = true,
  extensionSec = 300, // 5 minutes
  onTimeUpdate,
  onAuctionEnd,
  onSoftCloseExtension,
}: UseAuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => timeUntil(endsAt))
  const [lastBidTime, setLastBidTime] = useState<string | null>(null)

  const updateTimer = useCallback(() => {
    const newTimeLeft = timeUntil(endsAt)
    setTimeLeft(newTimeLeft)
    onTimeUpdate?.(newTimeLeft)

    if (newTimeLeft.isExpired) {
      onAuctionEnd?.()
    }
  }, [endsAt, onTimeUpdate, onAuctionEnd])

  // Extend auction if bid placed in last 5 minutes (soft close)
  const handleNewBid = useCallback((bidTime: string) => {
    if (!softClose) return

    const bidTimestamp = new Date(bidTime).getTime()
    const auctionEndTimestamp = new Date(endsAt).getTime()
    const timeToEnd = auctionEndTimestamp - bidTimestamp

    // If bid is placed within extension window, extend auction
    if (timeToEnd <= extensionSec * 1000) {
      const newEndTime = new Date(bidTimestamp + extensionSec * 1000).toISOString()
      onSoftCloseExtension?.(newEndTime)
      setLastBidTime(bidTime)
    }
  }, [endsAt, softClose, extensionSec, onSoftCloseExtension])

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [updateTimer])

  const formatTimeLeft = useCallback(() => {
    if (timeLeft.isExpired) {
      return "Aukcja zakończona"
    }

    const { days, hours, minutes, seconds } = timeLeft

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }, [timeLeft])

  const isEndingSoon = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 10

  return {
    timeLeft,
    formatTimeLeft,
    isEndingSoon,
    isExpired: timeLeft.isExpired,
    handleNewBid,
    lastBidTime,
  }
}