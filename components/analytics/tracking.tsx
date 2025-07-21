"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

class Analytics {
  private static instance: Analytics
  private events: AnalyticsEvent[] = []

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    }

    this.events.push(analyticsEvent)

    // In a real implementation, you would send this to your analytics service
    console.log("Analytics Event:", analyticsEvent)

    // Send to backend
    this.sendToBackend(analyticsEvent)
  }

  private async sendToBackend(event: AnalyticsEvent) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error("Failed to send analytics event:", error)
    }
  }

  // Vehicle-specific tracking
  trackVehicleView(vehicleId: string, vehicleData: any) {
    this.track("vehicle_viewed", {
      vehicle_id: vehicleId,
      brand: vehicleData.brand,
      model: vehicleData.model,
      price: vehicleData.price,
      category: vehicleData.category,
    })
  }

  trackSearch(query: string, filters: any, resultCount: number) {
    this.track("search_performed", {
      query,
      filters,
      result_count: resultCount,
    })
  }

  trackBid(auctionId: string, bidAmount: number) {
    this.track("bid_placed", {
      auction_id: auctionId,
      bid_amount: bidAmount,
    })
  }

  trackFavorite(vehicleId: string, action: "add" | "remove") {
    this.track("favorite_toggled", {
      vehicle_id: vehicleId,
      action,
    })
  }

  trackContact(vehicleId: string, contactMethod: string) {
    this.track("contact_initiated", {
      vehicle_id: vehicleId,
      contact_method: contactMethod,
    })
  }
}

export const analytics = Analytics.getInstance()

// Page view tracking component
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    analytics.track("page_viewed", {
      path: pathname,
      search_params: searchParams.toString(),
    })
  }, [pathname, searchParams])

  return null
}

// Hook for easy analytics usage
export function useAnalytics() {
  return {
    trackVehicleView: analytics.trackVehicleView.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackBid: analytics.trackBid.bind(analytics),
    trackFavorite: analytics.trackFavorite.bind(analytics),
    trackContact: analytics.trackContact.bind(analytics),
    track: analytics.track.bind(analytics),
  }
}
