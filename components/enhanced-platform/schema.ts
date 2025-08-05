// Type definitions for enhanced platform features

// Props types (data passed to components)
export interface EnhancedGalleryProps {
  images: MediaItem[];
  title: string;
  hasVirtualTour: boolean;
  supportsPinchZoom: boolean;
  lazyLoadingEnabled: boolean;
  onImageChange?: (index: number) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | '360' | 'virtual_tour';
  caption?: string;
  duration?: number;
  thumbnail?: string;
}

export interface AuctionBiddingProps {
  auction: AuctionData;
  websocketStatus: WebSocketStatus;
  biometricAuth: BiometricAuthConfig;
  onBidPlaced?: (amount: number) => void;
  onAutoBidSetup?: (maxBid: number) => void;
}

export interface AuctionData {
  id: string;
  listingId: string;
  title: string;
  currentBid: number;
  nextMinBid: number;
  bidCount: number;
  minBidIncrement: number;
  currency: 'CHF' | 'EUR' | 'USD';
  auctionEndTime: string;
  reservePrice?: number;
  reserveMet: boolean;
  status: 'upcoming' | 'live' | 'ending_soon' | 'ended' | 'extended';
  isOwner: boolean;
  canBid: boolean;
  quickBidAmounts: number[];
  autoBidEnabled: boolean;
  maxAutoBid: number;
  participants: number;
}

export interface DashboardProps {
  widgets: DashboardWidget[];
  isDealerAccount: boolean;
  inventoryData?: InventoryData;
  onWidgetMove?: (widgetId: string, position: WidgetPosition) => void;
  onWidgetResize?: (widgetId: string, size: WidgetSize) => void;
}

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'recent_activity' | 'watchlist' | 'inventory' | 'notifications' | 'quick_actions' | 'revenue_chart' | 'performance';
  title: string;
  size: 'small' | 'medium' | 'large' | 'extra_large';
  position: WidgetPosition;
  data: any;
  isDraggable: boolean;
  isResizable: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AutoSwipeProps {
  recommendations: VehicleRecommendation[];
  userPreferences: UserPreferences;
  onSwipe?: (vehicleId: string, action: 'like' | 'dislike' | 'super_like') => void;
  onPreferencesUpdate?: (preferences: Partial<UserPreferences>) => void;
}

export interface VehicleRecommendation {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  images: string[];
  matchScore: number;
  reasons: string[];
  location: string;
}

export interface SocialSharingProps {
  platforms: SocialPlatform[];
  shareText: string;
  shareUrl: string;
  vehicleData: VehicleShareData;
  onShare?: (platform: string) => void;
}

export interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  amount: number;
  currency: string;
  onMethodSelect?: (methodId: string) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

// Store types (global state data)
export interface PlatformStoreState {
  websocketConnection: WebSocketStatus;
  userPreferences: UserPreferences;
  dashboardLayout: DashboardLayout;
  biometricSettings: BiometricAuthConfig;
  notificationSettings: NotificationConfig;
  inventoryData: InventoryData;
  auctionSubscriptions: string[];
}

export interface WebSocketStatus {
  isConnected: boolean;
  participants: number;
  lastHeartbeat: string;
  reconnectAttempts: number;
}

export interface BiometricAuthConfig {
  supported: boolean;
  methods: ('face_id' | 'touch_id')[];
  enabled: boolean;
  lastUsed: string | null;
}

export interface InventoryData {
  totalVehicles: number;
  lowStock: number;
  outOfStock: number;
  recentlyAdded: number;
  categories: InventoryCategory[];
}

export interface InventoryCategory {
  id: string;
  name: string;
  count: number;
  lowStockThreshold: number;
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  fees: number;
}

export interface VehicleShareData {
  id: string;
  title: string;
  price: number;
  image: string;
  url: string;
}

export interface UserPreferences {
  brands: string[];
  priceRange: [number, number];
  bodyTypes: string[];
  maxMileage: number;
  fuelTypes: string[];
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  rowHeight: number;
}

export interface NotificationConfig {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  auctionAlerts: boolean;
  priceDrops: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}