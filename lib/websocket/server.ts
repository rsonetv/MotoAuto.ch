import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { createServerComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

// JWT verification function
async function verifyJWT(token: string): Promise<{ sub: string } | null> {
  try {
    const supabase = createServerComponentClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }
    
    return { sub: user.id }
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

export interface AuthenticatedSocket extends Socket {
  userId?: string
  profile?: Database['public']['Tables']['profiles']['Row']
}

export interface AuctionRoom {
  auctionId: string
  listingId: string
  participants: Set<string>
  lastActivity: Date
}

export class AuctionWebSocketServer {
  private io: SocketIOServer
  private rooms: Map<string, AuctionRoom> = new Map()
  private userSockets: Map<string, Set<string>> = new Map()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://motoauto.ch', 'https://www.motoauto.ch']
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    this.startCleanupInterval()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication token required'))
        }

        // Verify JWT token
        const payload = await verifyJWT(token)
        if (!payload || !payload.sub) {
          return next(new Error('Invalid authentication token'))
        }

        // Get user profile from database
        const supabase = createServerComponentClient()
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.sub)
          .single()

        if (error || !profile) {
          return next(new Error('User profile not found'))
        }

        // Attach user data to socket
        socket.userId = payload.sub
        socket.profile = profile
        
        console.log(`WebSocket authenticated: ${profile.full_name || profile.email} (${payload.sub})`)
        next()
      } catch (error) {
        console.error('WebSocket authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })

    // Rate limiting middleware
    this.io.use((socket, next) => {
      const rateLimiter = new Map<string, { count: number; resetTime: number }>()
      const now = Date.now()
      const windowMs = 60000 // 1 minute
      const maxRequests = 100 // Max 100 events per minute per socket

      const key = socket.id
      const current = rateLimiter.get(key)

      if (!current || now > current.resetTime) {
        rateLimiter.set(key, { count: 1, resetTime: now + windowMs })
        next()
      } else if (current.count < maxRequests) {
        current.count++
        next()
      } else {
        next(new Error('Rate limit exceeded'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`WebSocket connected: ${socket.id} (User: ${socket.userId})`)

      // Track user sockets
      if (socket.userId) {
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, new Set())
        }
        this.userSockets.get(socket.userId)!.add(socket.id)
      }

      // Join auction room
      socket.on('join_auction', async (data: { auctionId: string }) => {
        try {
          await this.handleJoinAuction(socket, data.auctionId)
        } catch (error) {
          console.error('Error joining auction:', error)
          socket.emit('error', { message: 'Failed to join auction' })
        }
      })

      // Leave auction room
      socket.on('leave_auction', (data: { auctionId: string }) => {
        this.handleLeaveAuction(socket, data.auctionId)
      })

      // Handle bid placement (this will be called from API, not directly from client)
      socket.on('place_bid', async (data: { auctionId: string; amount: number }) => {
        socket.emit('error', { message: 'Bids must be placed through the API endpoint' })
      })

      // Handle connection status requests
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() })
      })

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`WebSocket disconnected: ${socket.id} (${reason})`)
        this.handleDisconnect(socket)
      })

      // Send connection confirmation
      socket.emit('connection_established', {
        socketId: socket.id,
        userId: socket.userId,
        timestamp: Date.now()
      })
    })
  }

  private async handleJoinAuction(socket: AuthenticatedSocket, auctionId: string) {
    if (!socket.userId) {
      throw new Error('User not authenticated')
    }

    // Validate auction exists and is active
    const supabase = createServerComponentClient()
    const { data: auction, error } = await supabase
      .from('auctions')
      .select(`
        id,
        listing_id,
        listings!inner (
          id,
          title,
          auction_end_time,
          current_bid,
          bid_count,
          status
        )
      `)
      .eq('id', auctionId)
      .single()

    if (error || !auction) {
      throw new Error('Auction not found')
    }

    const listing = Array.isArray(auction.listings) ? auction.listings[0] : auction.listings
    if (listing.status !== 'active') {
      throw new Error('Auction is not active')
    }

    // Join the auction room
    const roomName = `auction:${auctionId}`
    await socket.join(roomName)

    // Track room participants
    if (!this.rooms.has(auctionId)) {
      this.rooms.set(auctionId, {
        auctionId,
        listingId: listing.id,
        participants: new Set(),
        lastActivity: new Date()
      })
    }

    const room = this.rooms.get(auctionId)!
    room.participants.add(socket.userId)
    room.lastActivity = new Date()

    // Send current auction state to the joining user
    socket.emit('auction_joined', {
      auctionId,
      listingId: listing.id,
      title: listing.title,
      currentBid: listing.current_bid,
      bidCount: listing.bid_count,
      endTime: listing.auction_end_time,
      participantCount: room.participants.size
    })

    // Notify other participants about new watcher
    socket.to(roomName).emit('participant_joined', {
      participantCount: room.participants.size
    })

    console.log(`User ${socket.userId} joined auction ${auctionId}`)
  }

  private handleLeaveAuction(socket: AuthenticatedSocket, auctionId: string) {
    if (!socket.userId) return

    const roomName = `auction:${auctionId}`
    socket.leave(roomName)

    const room = this.rooms.get(auctionId)
    if (room) {
      room.participants.delete(socket.userId)
      
      // Notify remaining participants
      socket.to(roomName).emit('participant_left', {
        participantCount: room.participants.size
      })

      // Clean up empty rooms
      if (room.participants.size === 0) {
        this.rooms.delete(auctionId)
      }
    }

    console.log(`User ${socket.userId} left auction ${auctionId}`)
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.userId) return

    // Remove from user sockets tracking
    const userSockets = this.userSockets.get(socket.userId)
    if (userSockets) {
      userSockets.delete(socket.id)
      if (userSockets.size === 0) {
        this.userSockets.delete(socket.userId)
      }
    }

    // Remove from all auction rooms
    for (const [auctionId, room] of this.rooms.entries()) {
      if (room.participants.has(socket.userId)) {
        room.participants.delete(socket.userId)
        
        // Notify remaining participants
        this.io.to(`auction:${auctionId}`).emit('participant_left', {
          participantCount: room.participants.size
        })

        // Clean up empty rooms
        if (room.participants.size === 0) {
          this.rooms.delete(auctionId)
        }
      }
    }
  }

  // Public methods for broadcasting events from API endpoints
  public broadcastBidPlaced(auctionId: string, bidData: {
    id: string
    amount: number
    userId: string
    userName: string
    isAutomatic: boolean
    timestamp: string
    newCurrentBid: number
    newBidCount: number
    nextMinBid: number
  }) {
    const roomName = `auction:${auctionId}`
    this.io.to(roomName).emit('bid_placed', {
      auctionId,
      bid: bidData,
      timestamp: Date.now()
    })

    // Update room activity
    const room = this.rooms.get(auctionId)
    if (room) {
      room.lastActivity = new Date()
    }
  }

  public broadcastAuctionExtended(auctionId: string, extensionData: {
    newEndTime: string
    extensionMinutes: number
    extensionCount: number
    reason: string
  }) {
    const roomName = `auction:${auctionId}`
    this.io.to(roomName).emit('auction_extended', {
      auctionId,
      ...extensionData,
      timestamp: Date.now()
    })
  }

  public broadcastAuctionEnded(auctionId: string, endData: {
    winnerId?: string
    winningBid?: number
    totalBids: number
    endReason: string
  }) {
    const roomName = `auction:${auctionId}`
    this.io.to(roomName).emit('auction_ended', {
      auctionId,
      ...endData,
      timestamp: Date.now()
    })

    // Clean up the room
    this.rooms.delete(auctionId)
  }

  public notifyUserOutbid(userId: string, data: {
    auctionId: string
    listingTitle: string
    previousBid: number
    newHighestBid: number
    timeRemaining: number
  }) {
    const userSockets = this.userSockets.get(userId)
    if (userSockets) {
      for (const socketId of userSockets) {
        this.io.to(socketId).emit('user_outbid', {
          ...data,
          timestamp: Date.now()
        })
      }
    }
  }

  public broadcastAuctionStatusChange(auctionId: string, statusData: {
    newStatus: string
    reason?: string
  }) {
    const roomName = `auction:${auctionId}`
    this.io.to(roomName).emit('auction_status_changed', {
      auctionId,
      ...statusData,
      timestamp: Date.now()
    })
  }

  // Cleanup inactive rooms periodically
  private startCleanupInterval() {
    setInterval(() => {
      const now = new Date()
      const maxInactiveTime = 30 * 60 * 1000 // 30 minutes

      for (const [auctionId, room] of this.rooms.entries()) {
        if (now.getTime() - room.lastActivity.getTime() > maxInactiveTime) {
          console.log(`Cleaning up inactive auction room: ${auctionId}`)
          this.rooms.delete(auctionId)
        }
      }
    }, 5 * 60 * 1000) // Run every 5 minutes
  }

  public getStats() {
    return {
      connectedSockets: this.io.sockets.sockets.size,
      activeRooms: this.rooms.size,
      totalParticipants: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.participants.size, 0),
      rooms: Array.from(this.rooms.entries()).map(([auctionId, room]) => ({
        auctionId,
        participants: room.participants.size,
        lastActivity: room.lastActivity
      }))
    }
  }
}

// Global instance
let wsServer: AuctionWebSocketServer | null = null

export function initializeWebSocketServer(httpServer: HTTPServer): AuctionWebSocketServer {
  if (!wsServer) {
    wsServer = new AuctionWebSocketServer(httpServer)
    console.log('WebSocket server initialized')
  }
  return wsServer
}

export function getWebSocketServer(): AuctionWebSocketServer | null {
  return wsServer
}