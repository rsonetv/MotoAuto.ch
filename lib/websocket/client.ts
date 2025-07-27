import { io, Socket } from 'socket.io-client'

export interface WebSocketEvents {
  // Connection events
  connection_established: (data: { socketId: string; userId?: string; timestamp: number }) => void
  error: (data: { message: string }) => void
  
  // Auction room events
  auction_joined: (data: {
    auctionId: string
    listingId: string
    title: string
    currentBid: number
    bidCount: number
    endTime: string
    participantCount: number
  }) => void
  participant_joined: (data: { participantCount: number }) => void
  participant_left: (data: { participantCount: number }) => void
  
  // Bidding events
  bid_placed: (data: {
    auctionId: string
    bid: {
      id: string
      amount: number
      userId: string
      userName: string
      isAutomatic: boolean
      timestamp: string
      newCurrentBid: number
      newBidCount: number
      nextMinBid: number
    }
    timestamp: number
  }) => void
  
  // Auction lifecycle events
  auction_extended: (data: {
    auctionId: string
    newEndTime: string
    extensionMinutes: number
    extensionCount: number
    reason: string
    timestamp: number
  }) => void
  
  auction_ended: (data: {
    auctionId: string
    winnerId?: string
    winningBid?: number
    totalBids: number
    endReason: string
    timestamp: number
  }) => void
  
  auction_status_changed: (data: {
    auctionId: string
    newStatus: string
    reason?: string
    timestamp: number
  }) => void
  
  // User notifications
  user_outbid: (data: {
    auctionId: string
    listingTitle: string
    previousBid: number
    newHighestBid: number
    timeRemaining: number
    timestamp: number
  }) => void
  
  // Connection health
  pong: (data: { timestamp: number }) => void
}

export interface WebSocketClientOptions {
  url?: string
  token?: string
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

export class AuctionWebSocketClient {
  private socket: Socket | null = null
  private token: string | null = null
  private url: string
  private options: WebSocketClientOptions
  private eventListeners: Map<keyof WebSocketEvents, Set<Function>> = new Map()
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null

  constructor(options: WebSocketClientOptions = {}) {
    this.url = options.url || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    this.token = options.token || null
    this.options = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...options
    }
    
    this.maxReconnectAttempts = this.options.reconnectionAttempts || 5
    this.reconnectDelay = this.options.reconnectionDelay || 1000

    if (this.options.autoConnect && typeof window !== 'undefined') {
      this.connect()
    }
  }

  public connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      if (token) {
        this.token = token
      }

      if (!this.token) {
        reject(new Error('Authentication token required'))
        return
      }

      this.connectionState = 'connecting'
      this.emit('connectionStateChanged', this.connectionState)

      this.socket = io(this.url, {
        auth: {
          token: this.token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      this.setupEventHandlers()

      this.socket.on('connect', () => {
        console.log('WebSocket connected')
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
        this.emit('connectionStateChanged', this.connectionState)
        this.startPingInterval()
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        this.connectionState = 'error'
        this.emit('connectionStateChanged', this.connectionState)
        this.handleReconnection()
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        this.connectionState = 'disconnected'
        this.emit('connectionStateChanged', this.connectionState)
        this.stopPingInterval()
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          return
        }
        
        this.handleReconnection()
      })
    })
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.stopPingInterval()
    this.connectionState = 'disconnected'
    this.emit('connectionStateChanged', this.connectionState)
  }

  public isConnected(): boolean {
    return this.socket?.connected || false
  }

  public getConnectionState(): string {
    return this.connectionState
  }

  // Auction room management
  public joinAuction(auctionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }
    
    this.socket.emit('join_auction', { auctionId })
  }

  public leaveAuction(auctionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }
    
    this.socket.emit('leave_auction', { auctionId })
  }

  // Event handling
  public on<K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)

    // Also register with socket if connected
    if (this.socket) {
      this.socket.on(event as string, listener as any)
    }
  }

  public off<K extends keyof WebSocketEvents>(event: K, listener?: WebSocketEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      if (listener) {
        listeners.delete(listener)
        if (this.socket) {
          this.socket.off(event as string, listener as any)
        }
      } else {
        listeners.clear()
        if (this.socket) {
          this.socket.removeAllListeners(event as string)
        }
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event as keyof WebSocketEvents)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error)
        }
      })
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    // Register all stored event listeners with the new socket
    for (const [event, listeners] of this.eventListeners.entries()) {
      listeners.forEach(listener => {
        this.socket!.on(event as string, listener as any)
      })
    }

    // Handle built-in events
    this.socket.on('connection_established', (data) => {
      console.log('WebSocket connection established:', data)
      this.emit('connection_established', data)
    })

    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data)
      this.emit('error', data)
    })
  }

  private handleReconnection(): void {
    if (!this.options.reconnection || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached or reconnection disabled')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (this.connectionState !== 'connected') {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error)
        })
      }
    }, delay)
  }

  private startPingInterval(): void {
    this.stopPingInterval()
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping')
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // Utility methods
  public updateToken(token: string): void {
    this.token = token
    if (this.socket?.connected) {
      // Reconnect with new token
      this.disconnect()
      this.connect(token)
    }
  }

  public getStats(): {
    connected: boolean
    connectionState: string
    reconnectAttempts: number
    eventListeners: number
  } {
    return {
      connected: this.isConnected(),
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      eventListeners: Array.from(this.eventListeners.values()).reduce((sum, set) => sum + set.size, 0)
    }
  }
}

// Global client instance
let wsClient: AuctionWebSocketClient | null = null

export function getWebSocketClient(options?: WebSocketClientOptions): AuctionWebSocketClient {
  if (!wsClient) {
    wsClient = new AuctionWebSocketClient(options)
  }
  return wsClient
}

export function createWebSocketClient(options?: WebSocketClientOptions): AuctionWebSocketClient {
  return new AuctionWebSocketClient(options)
}