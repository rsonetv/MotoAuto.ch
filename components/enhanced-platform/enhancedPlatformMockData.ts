// Mock data for enhanced platform features
export const mockRootProps = {
  // Enhanced Gallery Data
  galleryData: {
    images: [
      { 
        url: 'https://images.unsplash.com/photo-1706117948313-032944e7716d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw2fHxsdXh1cnklMjBjYXIlMjB2ZWhpY2xlJTIwYXV0b21vYmlsZXxlbnwwfDB8fHwxNzU0NDA4ODQ1fDA&ixlib=rb-4.1.0&q=85', 
        type: 'image' as const, 
        caption: 'Widok z przodu' 
      },
      { 
        url: 'https://images.unsplash.com/photo-1608412977534-c235d8c31b14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw3fHxsdXh1cnklMjBjYXIlMjB2ZWhpY2xlJTIwYXV0b21vYmlsZXxlbnwwfDB8fHwxNzU0NDA4ODQ1fDA&ixlib=rb-4.1.0&q=85', 
        type: 'image' as const, 
        caption: 'Widok z boku' 
      },
      { 
        url: 'https://images.unsplash.com/photo-1706421971546-c3f67ffd607d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjB2ZWhpY2xlJTIwYXV0b21vYmlsZXxlbnwwfDB8fHwxNzU0NDA4ODQ1fDA&ixlib=rb-4.1.0&q=85', 
        type: '360' as const, 
        caption: 'Panorama 360°' 
      },
      { 
        url: '/api/placeholder/800/600', 
        type: 'video' as const, 
        caption: 'Prezentacja video', 
        duration: 120 
      }
    ],
    title: 'BMW X5 2023',
    hasVirtualTour: true,
    supportsPinchZoom: true,
    lazyLoadingEnabled: true
  },

  // Auction Data
  auctionData: {
    id: 'auction-123',
    listingId: 'listing-456',
    title: 'BMW X5 xDrive40i M Sport',
    currentBid: 75000,
    nextMinBid: 76000,
    bidCount: 23,
    minBidIncrement: 1000,
    currency: 'CHF' as const,
    auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    reservePrice: 70000,
    reserveMet: true,
    status: 'live' as const,
    isOwner: false,
    canBid: true,
    quickBidAmounts: [76000, 77000, 80000, 85000],
    autoBidEnabled: false,
    maxAutoBid: 0,
    participants: 15
  },

  // Dashboard Widgets
  dashboardWidgets: [
    {
      id: 'stats-1',
      type: 'stats' as const,
      title: 'Statystyki sprzedaży',
      size: 'medium' as const,
      position: { x: 0, y: 0, w: 2, h: 1 },
      data: {
        totalSales: 125000,
        monthlyGrowth: 12.5,
        activeListing: 8,
        totalViews: 2340
      },
      isDraggable: true,
      isResizable: true
    },
    {
      id: 'inventory-1',
      type: 'inventory' as const,
      title: 'Stan magazynowy',
      size: 'large' as const,
      position: { x: 2, y: 0, w: 2, h: 2 },
      data: {
        totalVehicles: 45,
        lowStock: 3,
        outOfStock: 1,
        recentlyAdded: 5
      },
      isDraggable: true,
      isResizable: true
    },
    {
      id: 'activity-1',
      type: 'recent_activity' as const,
      title: 'Ostatnia aktywność',
      size: 'medium' as const,
      position: { x: 0, y: 1, w: 2, h: 1 },
      data: {
        activities: [
          { type: 'bid_placed', message: 'Nowa oferta na BMW X5', time: '5 min temu' },
          { type: 'listing_viewed', message: 'Wyświetlono Audi A4', time: '12 min temu' },
          { type: 'inquiry_received', message: 'Zapytanie o Mercedes C-Class', time: '1h temu' }
        ]
      },
      isDraggable: true,
      isResizable: true
    }
  ],

  // Auto Swipe Recommendations
  autoSwipeData: {
    recommendations: [
      {
        id: 'rec-1',
        title: 'BMW X3 xDrive30i',
        price: 65000,
        year: 2022,
        mileage: 25000,
        images: ['https://images.unsplash.com/photo-1642242413103-271e4dfc52f7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw5fHxjYXIlMjB2ZWhpY2xlJTIwYXV0b21vYmlsZXxlbnwwfDB8fHwxNzU0NDA4ODQ2fDA&ixlib=rb-4.1.0&q=85'],
        matchScore: 95,
        reasons: ['Podobna marka', 'Zakres cenowy', 'Typ nadwozia'],
        location: 'Zürich'
      },
      {
        id: 'rec-2',
        title: 'Audi Q5 45 TFSI',
        price: 68000,
        year: 2023,
        mileage: 15000,
        images: ['https://images.unsplash.com/photo-1642242413480-f503e1fa64bb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8Y2FyJTIwdmVoaWNsZSUyMGF1dG9tb2JpbGV8ZW58MHwwfHx8MTc1NDQwODg0Nnww&ixlib=rb-4.1.0&q=85'],
        matchScore: 88,
        reasons: ['Premium segment', 'SUV', 'Automatyczna skrzynia'],
        location: 'Geneva'
      }
    ],
    userPreferences: {
      brands: ['BMW', 'Audi', 'Mercedes-Benz'],
      priceRange: [50000, 80000] as [number, number],
      bodyTypes: ['SUV', 'Sedan'],
      maxMileage: 50000,
      fuelTypes: ['gasoline', 'hybrid']
    }
  },

  // Social Sharing
  socialSharingData: {
    platforms: [
      { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
      { name: 'Twitter', icon: 'twitter', color: '#1DA1F2' },
      { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366' },
      { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
      { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' }
    ],
    shareText: 'Sprawdź ten niesamowity pojazd na MotoAuto.ch!',
    shareUrl: 'https://motoauto.ch/ogloszenia/123',
    vehicleData: {
      id: '123',
      title: 'BMW X5 xDrive40i M Sport',
      price: 75000,
      image: 'https://images.unsplash.com/photo-1706117948313-032944e7716d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw2fHxsdXh1cnklMjBjYXIlMjB2ZWhpY2xlJTIwYXV0b21vYmlsZXxlbnwwfDB8fHwxNzU0NDA4ODQ1fDA&ixlib=rb-4.1.0&q=85',
      url: 'https://motoauto.ch/ogloszenia/123'
    }
  },

  // Payment Methods
  paymentMethods: [
    {
      id: 'twint',
      name: 'TWINT',
      icon: '/icons/twint.svg',
      description: 'Szybka płatność mobilna',
      enabled: true,
      fees: 0
    },
    {
      id: 'postfinance',
      name: 'PostFinance',
      icon: '/icons/postfinance.svg',
      description: 'Bezpieczne płatności online',
      enabled: true,
      fees: 1.5
    },
    {
      id: 'credit_card',
      name: 'Karta kredytowa',
      icon: '/icons/credit-card.svg',
      description: 'Visa, Mastercard, American Express',
      enabled: true,
      fees: 2.9
    }
  ],

  // WebSocket Status
  websocketStatus: {
    isConnected: true,
    participants: 15,
    lastHeartbeat: new Date().toISOString(),
    reconnectAttempts: 0
  },

  // Biometric Authentication
  biometricAuth: {
    supported: true,
    methods: ['face_id', 'touch_id'] as const,
    enabled: false,
    lastUsed: null
  }
};