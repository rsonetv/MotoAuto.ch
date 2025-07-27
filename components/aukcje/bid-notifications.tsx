"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  BellOff, 
  X, 
  TrendingUp, 
  Clock, 
  Gavel,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useBidNotifications } from '@/lib/providers/websocket-provider'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface BidNotification {
  id: number
  type: 'outbid' | 'auction_ending' | 'auction_extended' | 'auction_ended' | 'bid_placed'
  auctionId: string
  listingTitle: string
  message: string
  data: any
  timestamp: number
  read: boolean
  priority: 'low' | 'medium' | 'high'
}

interface BidNotificationsProps {
  className?: string
  maxNotifications?: number
  showSoundToggle?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

export function BidNotifications({ 
  className = '',
  maxNotifications = 10,
  showSoundToggle = true,
  autoHide = false,
  autoHideDelay = 5000
}: BidNotificationsProps) {
  const [notifications, setNotifications] = useState<BidNotification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const { notifications: wsNotifications, clearNotifications, removeNotification } = useBidNotifications()

  // Convert WebSocket notifications to our format
  useEffect(() => {
    const newNotifications = wsNotifications.map(wsNotif => ({
      id: wsNotif.id,
      type: wsNotif.type,
      auctionId: wsNotif.auctionId,
      listingTitle: wsNotif.listingTitle,
      message: formatNotificationMessage(wsNotif),
      data: wsNotif,
      timestamp: wsNotif.timestamp,
      read: false,
      priority: getNotificationPriority(wsNotif.type)
    }))

    setNotifications(prev => {
      const combined = [...newNotifications, ...prev]
      return combined.slice(0, maxNotifications)
    })

    // Update unread count
    setUnreadCount(newNotifications.filter(n => !n.read).length)

    // Play sound for new notifications
    if (newNotifications.length > 0 && soundEnabled) {
      playNotificationSound()
    }

    // Auto-hide notifications if enabled
    if (autoHide && newNotifications.length > 0) {
      setTimeout(() => {
        newNotifications.forEach(notif => {
          if (notif.priority === 'low') {
            markAsRead(notif.id)
          }
        })
      }, autoHideDelay)
    }
  }, [wsNotifications, maxNotifications, soundEnabled, autoHide, autoHideDelay])

  // Format notification message
  const formatNotificationMessage = (notification: any): string => {
    switch (notification.type) {
      case 'outbid':
        return `You've been outbid on "${notification.listingTitle}". New highest bid: CHF ${notification.newHighestBid?.toLocaleString()}`
      case 'auction_ending':
        return `Auction "${notification.listingTitle}" is ending soon!`
      case 'auction_extended':
        return `Auction "${notification.listingTitle}" has been extended`
      case 'auction_ended':
        return `Auction "${notification.listingTitle}" has ended`
      case 'bid_placed':
        return `New bid placed on "${notification.listingTitle}": CHF ${notification.amount?.toLocaleString()}`
      default:
        return `Update on "${notification.listingTitle}"`
    }
  }

  // Get notification priority
  const getNotificationPriority = (type: string): 'low' | 'medium' | 'high' => {
    switch (type) {
      case 'outbid':
        return 'high'
      case 'auction_ending':
        return 'high'
      case 'auction_extended':
        return 'medium'
      case 'auction_ended':
        return 'medium'
      case 'bid_placed':
        return 'low'
      default:
        return 'low'
    }
  }

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window !== 'undefined' && soundEnabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }, [soundEnabled])

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Remove notification
  const handleRemoveNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    removeNotification(id)
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([])
    clearNotifications()
    setUnreadCount(0)
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'outbid':
        return TrendingUp
      case 'auction_ending':
        return Clock
      case 'auction_extended':
        return Clock
      case 'auction_ended':
        return CheckCircle
      case 'bid_placed':
        return Gavel
      default:
        return Bell
    }
  }

  // Get notification styling
  const getNotificationStyling = (notification: BidNotification) => {
    const baseClasses = "p-3 rounded-lg border transition-all"
    
    if (!notification.read) {
      switch (notification.priority) {
        case 'high':
          return `${baseClasses} border-red-200 bg-red-50`
        case 'medium':
          return `${baseClasses} border-yellow-200 bg-yellow-50`
        default:
          return `${baseClasses} border-blue-200 bg-blue-50`
      }
    }
    
    return `${baseClasses} border-gray-200 bg-gray-50 opacity-75`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {isExpanded && (
        <Card className="absolute top-12 right-0 w-96 max-h-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {showSoundToggle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-sm">You'll be notified about auction updates here</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={getNotificationStyling(notification)}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${
                            notification.priority === 'high' ? 'bg-red-100' :
                            notification.priority === 'medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            <NotificationIcon className={`w-4 h-4 ${
                              notification.priority === 'high' ? 'text-red-600' :
                              notification.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Compact notification toast component
export function NotificationToast({ 
  notification, 
  onDismiss 
}: { 
  notification: any
  onDismiss: () => void 
}) {
  const iconMap: Record<string, any> = {
    outbid: TrendingUp,
    auction_ending: Clock,
    auction_extended: Clock,
    auction_ended: CheckCircle,
    bid_placed: Gavel
  }
  const NotificationIcon = iconMap[notification.type] || Bell

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <NotificationIcon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          {notification.message || `Update on "${notification.listingTitle}"`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 ml-2"
        >
          <X className="w-3 h-3" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// Browser notification permission helper
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        toast.success('Browser notifications enabled')
      } else {
        toast.info('Browser notifications disabled')
      }
    })
  }
}

// Show browser notification
export function showBrowserNotification(title: string, options: NotificationOptions = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })
  }
}