"use client"

import type React from "react"
import { useState, useRef } from "react"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const threshold = 80
  const maxPull = 120

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0 || isRefreshing) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, Math.min(maxPull, currentY - startY))
    setPullDistance(distance)

    if (distance > 0) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
    setStartY(0)
  }

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const shouldShowRefresh = pullDistance > threshold || isRefreshing

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-teal-50 transition-all duration-200 overflow-hidden"
        style={{
          height: pullDistance,
          transform: `translateY(-${Math.max(0, pullDistance - 50)}px)`,
        }}
      >
        {pullDistance > 20 && (
          <div className="flex items-center space-x-2 text-teal-600">
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? "Odświeżanie..." : shouldShowRefresh ? "Puść aby odświeżyć" : "Pociągnij aby odświeżyć"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? "transform 0.2s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}
