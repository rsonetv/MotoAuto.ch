"use client"

import { useEffect, useRef, useState } from 'react'

interface SwipeGestureOptions {
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
  trackMouse?: boolean
}

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchZoom?: (scale: number) => void
}

export function useSwipeGestures(
  callbacks: SwipeCallbacks,
  options: SwipeGestureOptions = {}
) {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [isPinching, setIsPinching] = useState(false)
  const [initialDistance, setInitialDistance] = useState(0)

  const getDistance = (touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      setIsPinching(true)
      setInitialDistance(getDistance(e.touches[0], e.touches[1]))
    } else if (e.touches.length === 1) {
      // Single touch
      setTouchEnd(null)
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }

    if (isPinching && e.touches.length === 2) {
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / initialDistance
      callbacks.onPinchZoom?.(scale)
    } else if (e.touches.length === 1) {
      setTouchEnd({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })
    }
  }

  const handleTouchEnd = () => {
    if (isPinching) {
      setIsPinching(false)
      setInitialDistance(0)
      return
    }

    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe) {
        callbacks.onSwipeLeft?.()
      } else if (isRightSwipe) {
        callbacks.onSwipeRight?.()
      }
    } else {
      // Vertical swipe
      if (isUpSwipe) {
        callbacks.onSwipeUp?.()
      } else if (isDownSwipe) {
        callbacks.onSwipeDown?.()
      }
    }
  }

  // Mouse events for desktop testing
  const handleMouseDown = (e: MouseEvent) => {
    if (!trackMouse) return
    setTouchStart({ x: e.clientX, y: e.clientY })
    setTouchEnd(null)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!trackMouse || !touchStart) return
    setTouchEnd({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    if (!trackMouse) return
    handleTouchEnd()
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown)
      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)

      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown)
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [touchStart, touchEnd, isPinching, initialDistance, callbacks, threshold, preventDefaultTouchmoveEvent, trackMouse])

  return elementRef
}