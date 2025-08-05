// Enhanced platform enums
export enum GalleryViewMode {
  STANDARD = 'standard',
  FULLSCREEN = 'fullscreen',
  PANORAMIC_360 = '360',
  VIDEO = 'video'
}

export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down'
}

export enum BidType {
  MANUAL = 'manual',
  AUTO = 'auto',
  QUICK = 'quick',
  EMERGENCY = 'emergency'
}

export enum AuctionStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  ENDING_SOON = 'ending_soon',
  ENDED = 'ended',
  EXTENDED = 'extended'
}

export enum NotificationType {
  BID_PLACED = 'bid_placed',
  OUTBID = 'outbid',
  AUCTION_ENDING = 'auction_ending',
  AUCTION_WON = 'auction_won',
  AUCTION_LOST = 'auction_lost',
  AUCTION_EXTENDED = 'auction_extended'
}

export enum DashboardWidgetType {
  STATS = 'stats',
  RECENT_ACTIVITY = 'recent_activity',
  WATCHLIST = 'watchlist',
  INVENTORY = 'inventory',
  NOTIFICATIONS = 'notifications',
  QUICK_ACTIONS = 'quick_actions',
  REVENUE_CHART = 'revenue_chart',
  PERFORMANCE = 'performance'
}

export enum WidgetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

export enum SwipeAction {
  LIKE = 'like',
  DISLIKE = 'dislike',
  SUPER_LIKE = 'super_like',
  SAVE = 'save'
}

export enum SocialPlatform {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  TELEGRAM = 'telegram'
}

export enum PaymentMethod {
  TWINT = 'twint',
  POSTFINANCE = 'postfinance',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal'
}

export enum AuthMethod {
  PASSWORD = 'password',
  BIOMETRIC = 'biometric',
  TWO_FACTOR = 'two_factor',
  FACE_ID = 'face_id',
  TOUCH_ID = 'touch_id'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  PANORAMIC = 'panoramic',
  VIRTUAL_TOUR = 'virtual_tour'
}