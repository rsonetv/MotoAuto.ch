"use client"

import { EnhancedPlatform } from "@/components/enhanced-platform"
import { mockRootProps } from "@/components/enhanced-platform/enhancedPlatformMockData"

export default function EnhancedPlatformPreview() {
  return (
    <EnhancedPlatform
      galleryData={mockRootProps.galleryData}
      auctionData={mockRootProps.auctionData}
      dashboardWidgets={mockRootProps.dashboardWidgets}
      autoSwipeData={mockRootProps.autoSwipeData}
      socialSharingData={mockRootProps.socialSharingData}
      paymentMethods={mockRootProps.paymentMethods}
      websocketStatus={mockRootProps.websocketStatus}
      biometricAuth={mockRootProps.biometricAuth}
    />
  )
}