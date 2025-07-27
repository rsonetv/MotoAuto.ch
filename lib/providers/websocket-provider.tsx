"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { AuctionWebSocketClient, getWebSocketClient, type WebSocketEvents } from '@/lib/websocket/client'
import { useAuth } from '@/lib/providers/auth-provider'

interface WebSocketContextType {
  client: AuctionWebSocketClient | null
  isConnected: boolean
  connectionState: string
  joinAuction: (auctionId: string) => void
  leaveAuction: (auctionId: string) => void
  on: <K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]) => void
  off: <K extends keyof WebSocketEvents>(event: K, listener?: WebSocketEvents[K]) => void
  reconnect: () => Promise<void>
  stats: {
    connected: boolean
    connectionState: string
    reconnectAttempts: number
    eventListeners: number
  }
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
  autoConnect?: boolean
}

export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  const { user } = useAuth()
  const [client, setClient] = useState<AuctionWebSocketClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [stats, setStats] = useState({
    connected: false,
    connectionState: 'disconnected',
    reconnectAttempts: 0,
    eventListeners: 0
  })
  
  const clientRef = useRef<AuctionWebSocketClient | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket client
  useEffect(() => {
    const initializeWebSocket = async () => {
      if (!user) {
        // Clean up existing connection if user logs out
        if (clientRef.current) {
          clientRef.current.disconnect()
          clientRef.current = null
          setClient(null)
          setIsConnected(false)
          setConnectionState('disconnected')
        }
        return
      }

      // Get current session token
      const { createClientComponentClient } = await import('@/lib/supabase')
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.warn('No access token available for WebSocket connection')
        return
      }

      // Create new client if needed
      if (!clientRef.current) {
        const wsClient = getWebSocketClient({
          token: session.access_token,
          autoConnect: false, // We'll connect manually
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        })

        clientRef.current = wsClient
        setClient(wsClient)

        // Set up connection state listeners
        wsClient.on('connectionStateChanged' as any, (state: string) => {
          setConnectionState(state)
          setIsConnected(state === 'connected')
          updateStats()
        })

        // Set up error handling
        wsClient.on('error', (data) => {
          console.error('WebSocket error:', data)
          // Could show toast notification here
        })

        // Set up connection established handler
        wsClient.on('connection_established', (data) => {
          console.log('WebSocket connection established:', data)
          updateStats()
        })

        // Auto-connect if enabled
        if (autoConnect) {
          wsClient.connect(session.access_token).catch(error => {
            console.error('Failed to connect WebSocket:', error)
          })
        }
      } else {
        // Update token if it changed
        clientRef.current.updateToken(session.access_token)
      }
    }

    initializeWebSocket()

    return () => {
      // Clean up reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [user, autoConnect])

  // Update stats periodically
  const updateStats = useCallback(() => {
    if (clientRef.current) {
      setStats(clientRef.current.getStats())
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(updateStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [updateStats])

  // Auction room management
  const joinAuction = useCallback((auctionId: string) => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.joinAuction(auctionId)
    } else {
      console.warn('Cannot join auction: WebSocket not connected')
    }
  }, [])

  const leaveAuction = useCallback((auctionId: string) => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.leaveAuction(auctionId)
    }
  }, [])

  // Event handling
  const on = useCallback(<K extends keyof WebSocketEvents>(
    event: K, 
    listener: WebSocketEvents[K]
  ) => {
    if (clientRef.current) {
      clientRef.current.on(event, listener)
      updateStats()
    }
  }, [updateStats])

  const off = useCallback(<K extends keyof WebSocketEvents>(
    event: K, 
    listener?: WebSocketEvents[K]
  ) => {
    if (clientRef.current) {
      clientRef.current.off(event, listener)
      updateStats()
    }
  }, [updateStats])

  // Manual reconnection
  const reconnect = useCallback(async () => {
    if (clientRef.current && user) {
      try {
        // Get fresh session token
        const { createClientComponentClient } = await import('@/lib/supabase')
        const supabase = createClientComponentClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          throw new Error('No access token available')
        }
        
        await clientRef.current.connect(session.access_token)
      } catch (error) {
        console.error('Manual reconnection failed:', error)
        throw error
      }
    } else {
      throw new Error('Cannot reconnect: No client or user')
    }
  }, [user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  const contextValue: WebSocketContextType = {
    client,
    isConnected,
    connectionState,
    joinAuction,
    leaveAuction,
    on,
    off,
    reconnect,
    stats
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook to use WebSocket context
export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Hook for auction-specific WebSocket functionality
export function useAuctionWebSocket(auctionId?: string) {
  const ws = useWebSocket()
  const [participants, setParticipants] = useState(0)
  const [auctionData, setAuctionData] = useState<any>(null)
  const joinedRef = useRef(false)

  // Join auction when component mounts and auctionId is available
  useEffect(() => {
    if (auctionId && ws.isConnected && !joinedRef.current) {
      ws.joinAuction(auctionId)
      joinedRef.current = true
    }

    return () => {
      if (auctionId && joinedRef.current) {
        ws.leaveAuction(auctionId)
        joinedRef.current = false
      }
    }
  }, [auctionId, ws.isConnected, ws])

  // Set up auction-specific event listeners
  useEffect(() => {
    if (!auctionId) return

    const handleAuctionJoined = (data: any) => {
      if (data.auctionId === auctionId) {
        setAuctionData(data)
        setParticipants(data.participantCount)
      }
    }

    const handleParticipantJoined = (data: any) => {
      setParticipants(data.participantCount)
    }

    const handleParticipantLeft = (data: any) => {
      setParticipants(data.participantCount)
    }

    const handleBidPlaced = (data: any) => {
      if (data.auctionId === auctionId) {
        setAuctionData((prev: any) => prev ? {
          ...prev,
          currentBid: data.bid.newCurrentBid,
          bidCount: data.bid.newBidCount
        } : null)
      }
    }

    const handleAuctionExtended = (data: any) => {
      if (data.auctionId === auctionId) {
        setAuctionData((prev: any) => prev ? {
          ...prev,
          endTime: data.newEndTime
        } : null)
      }
    }

    // Register event listeners
    ws.on('auction_joined', handleAuctionJoined)
    ws.on('participant_joined', handleParticipantJoined)
    ws.on('participant_left', handleParticipantLeft)
    ws.on('bid_placed', handleBidPlaced)
    ws.on('auction_extended', handleAuctionExtended)

    return () => {
      // Clean up event listeners
      ws.off('auction_joined', handleAuctionJoined)
      ws.off('participant_joined', handleParticipantJoined)
      ws.off('participant_left', handleParticipantLeft)
      ws.off('bid_placed', handleBidPlaced)
      ws.off('auction_extended', handleAuctionExtended)
    }
  }, [auctionId, ws])

  return {
    ...ws,
    participants,
    auctionData,
    isJoined: joinedRef.current
  }
}

// Hook for bid notifications
export function useBidNotifications() {
  const ws = useWebSocket()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const handleUserOutbid = (data: any) => {
      const notification = {
        id: Date.now(),
        type: 'outbid',
        ...data,
        timestamp: Date.now()
      }
      
      setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
      
      // Could trigger browser notification here
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('You have been outbid!', {
          body: `Your bid of CHF ${data.previousBid} on "${data.listingTitle}" has been outbid.`,
          icon: '/favicon.ico'
        })
      }
    }

    ws.on('user_outbid', handleUserOutbid)

    return () => {
      ws.off('user_outbid', handleUserOutbid)
    }
  }, [ws])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notifications,
    clearNotifications,
    removeNotification
  }
}