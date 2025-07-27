/**
 * WebSocket and Real-time Features Tests
 * Tests WebSocket connections, live updates, and auction features
 */

const { Server } = require('socket.io')
const { createServer } = require('http')
const ioc = require('socket.io-client')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid,
  createMockJWT,
  websocketHelpers,
  mockSupabaseResponse
} = require('../utils/test-helpers')

describe('WebSocket and Real-time Features Tests', () => {
  let httpServer
  let io
  let clientSocket
  let mockSupabase

  beforeEach((done) => {
    // Create HTTP server and Socket.IO instance
    httpServer = createServer()
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    // Mock Supabase
    mockSupabase = {
      auth: {
        getUser: jest.fn()
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
      }))
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))

    // Start server
    httpServer.listen(() => {
      const port = httpServer.address().port
      clientSocket = ioc(`http://localhost:${port}`)
      clientSocket.on('connect', done)
    })
  })

  afterEach(() => {
    io.close()
    clientSocket.close()
    httpServer.close()
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('WebSocket Connection', () => {
    test('should establish WebSocket connection', (done) => {
      expect(clientSocket.connected).toBe(true)
      done()
    })

    test('should authenticate user with valid JWT', (done) => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })
      const token = createMockJWT({ sub: user.id })

      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse({ user })
      )
      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse(profile)
      )

      // Set up authentication middleware
      io.use(async (socket, next) => {
        const authToken = socket.handshake.auth.token
        if (authToken === token) {
          socket.userId = user.id
          socket.profile = profile
          next()
        } else {
          next(new Error('Authentication failed'))
        }
      })

      // Create authenticated client
      const authenticatedClient = ioc(`http://localhost:${httpServer.address().port}`, {
        auth: { token }
      })

      authenticatedClient.on('connect', () => {
        expect(authenticatedClient.connected).toBe(true)
        authenticatedClient.close()
        done()
      })

      authenticatedClient.on('connect_error', (error) => {
        done(error)
      })
    })

    test('should reject connection with invalid JWT', (done) => {
      const invalidToken = 'invalid.jwt.token'

      // Set up authentication middleware
      io.use(async (socket, next) => {
        const authToken = socket.handshake.auth.token
        if (authToken === invalidToken) {
          next(new Error('Invalid token'))
        } else {
          next()
        }
      })

      const unauthenticatedClient = ioc(`http://localhost:${httpServer.address().port}`, {
        auth: { token: invalidToken }
      })

      unauthenticatedClient.on('connect_error', (error) => {
        expect(error.message).toBe('Invalid token')
        unauthenticatedClient.close()
        done()
      })

      unauthenticatedClient.on('connect', () => {
        done(new Error('Should not connect with invalid token'))
      })
    })

    test('should handle connection timeout', (done) => {
      const slowClient = ioc(`http://localhost:${httpServer.address().port}`, {
        timeout: 100 // Very short timeout
      })

      slowClient.on('connect_error', (error) => {
        expect(error.type).toBe('TransportError')
        slowClient.close()
        done()
      })

      // Simulate slow connection by not responding
      setTimeout(() => {
        if (!slowClient.connected) {
          slowClient.close()
          done()
        }
      }, 200)
    })
  })

  describe('Auction Room Management', () => {
    test('should join auction room', (done) => {
      const auction = mockAuction()
      const listing = mockListing({ id: auction.listing_id, is_auction: true })

      // Mock auction validation
      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse({ ...auction, listings: listing })
      )

      io.on('connection', (socket) => {
        socket.on('join_auction', async (data) => {
          const { auctionId } = data
          
          // Validate auction exists
          if (auctionId === auction.id) {
            await socket.join(`auction:${auctionId}`)
            
            socket.emit('auction_joined', {
              auctionId,
              listingId: listing.id,
              title: listing.title,
              currentBid: listing.current_bid,
              bidCount: listing.bid_count,
              endTime: listing.auction_end_time,
              participantCount: 1
            })
          } else {
            socket.emit('error', { message: 'Auction not found' })
          }
        })
      })

      clientSocket.emit('join_auction', { auctionId: auction.id })

      clientSocket.on('auction_joined', (data) => {
        expect(data.auctionId).toBe(auction.id)
        expect(data.listingId).toBe(listing.id)
        expect(data.participantCount).toBe(1)
        done()
      })

      clientSocket.on('error', (error) => {
        done(new Error(error.message))
      })
    })

    test('should leave auction room', (done) => {
      const auction = mockAuction()

      io.on('connection', (socket) => {
        socket.on('join_auction', async (data) => {
          await socket.join(`auction:${data.auctionId}`)
          socket.emit('auction_joined', { auctionId: data.auctionId })
        })

        socket.on('leave_auction', async (data) => {
          await socket.leave(`auction:${data.auctionId}`)
          socket.emit('auction_left', { auctionId: data.auctionId })
        })
      })

      // First join the auction
      clientSocket.emit('join_auction', { auctionId: auction.id })

      clientSocket.on('auction_joined', () => {
        // Then leave the auction
        clientSocket.emit('leave_auction', { auctionId: auction.id })
      })

      clientSocket.on('auction_left', (data) => {
        expect(data.auctionId).toBe(auction.id)
        done()
      })
    })

    test('should track multiple participants in auction room', (done) => {
      const auction = mockAuction()
      const participants = new Set()

      // Create multiple clients
      const client1 = ioc(`http://localhost:${httpServer.address().port}`)
      const client2 = ioc(`http://localhost:${httpServer.address().port}`)

      io.on('connection', (socket) => {
        socket.on('join_auction', async (data) => {
          const { auctionId } = data
          participants.add(socket.id)
          await socket.join(`auction:${auctionId}`)
          
          // Notify all participants about new joiner
          io.to(`auction:${auctionId}`).emit('participant_joined', {
            participantCount: participants.size
          })
        })
      })

      let joinedCount = 0
      const checkCompletion = () => {
        joinedCount++
        if (joinedCount === 2) {
          expect(participants.size).toBe(3) // Including original clientSocket
          client1.close()
          client2.close()
          done()
        }
      }

      client1.on('connect', () => {
        client1.emit('join_auction', { auctionId: auction.id })
      })

      client2.on('connect', () => {
        client2.emit('join_auction', { auctionId: auction.id })
      })

      client1.on('participant_joined', checkCompletion)
      client2.on('participant_joined', checkCompletion)
    })
  })

  describe('Live Bidding', () => {
    test('should broadcast bid placement to auction participants', (done) => {
      const auction = mockAuction()
      const user = mockUser()
      const bid = mockBid({ 
        auction_id: auction.id, 
        user_id: user.id, 
        amount: 55000 
      })

      // Create second client to receive broadcast
      const bidderClient = ioc(`http://localhost:${httpServer.address().port}`)

      io.on('connection', (socket) => {
        socket.on('join_auction', async (data) => {
          await socket.join(`auction:${data.auctionId}`)
          socket.emit('auction_joined', { auctionId: data.auctionId })
        })

        // Simulate bid placement from API
        socket.on('simulate_bid_placed', (data) => {
          io.to(`auction:${data.auctionId}`).emit('bid_placed', {
            auctionId: data.auctionId,
            bid: {
              id: bid.id,
              amount: bid.amount,
              userId: bid.user_id,
              userName: 'Test User',
              isAutomatic: false,
              timestamp: new Date().toISOString(),
              newCurrentBid: bid.amount,
              newBidCount: 1,
              nextMinBid: bid.amount + 1000
            },
            timestamp: Date.now()
          })
        })
      })

      // Both clients join auction
      clientSocket.emit('join_auction', { auctionId: auction.id })
      bidderClient.emit('join_auction', { auctionId: auction.id })

      let joinedCount = 0
      const checkJoined = () => {
        joinedCount++
        if (joinedCount === 2) {
          // Simulate bid placement
          clientSocket.emit('simulate_bid_placed', { auctionId: auction.id })
        }
      }

      clientSocket.on('auction_joined', checkJoined)
      bidderClient.on('auction_joined', checkJoined)

      // Listen for bid broadcast
      bidderClient.on('bid_placed', (data) => {
        expect(data.auctionId).toBe(auction.id)
        expect(data.bid.amount).toBe(55000)
        expect(data.bid.newCurrentBid).toBe(55000)
        expect(data.bid.newBidCount).toBe(1)
        bidderClient.close()
        done()
      })
    })

    test('should handle auction extension broadcast', (done) => {
      const auction = mockAuction()
      const extensionData = {
        newEndTime: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes from now
        extensionMinutes: 5,
        extensionCount: 1,
        reason: 'Bid placed in last 5 minutes'
      }

      io.on('connection', (socket) => {
        socket.on('join_auction', async (data) => {
          await socket.join(`auction:${data.auctionId}`)
          socket.emit('auction_joined', { auctionId: data.auctionId })
        })

        socket.on('simulate_auction_extended', (data) => {
          io.to(`auction:${data.auctionId}`).emit('auction_extended', {
            auctionId: data.auctionId,
            ...extensionData,
            timestamp: Date.now()
          })
        })
      })

      clientSocket.emit('join_auction', { auctionId: auction.id })

      clientSocket.on('auction_joined', () => {
        clientSocket.emit('simulate_auction_extended', { auctionId: auction.id })
      })

      clientSocket.on('auction_extended', (data) => {
        expect(data.auctionId).toBe(auction.id)
        expect(data.extensionMinutes).toBe(5)
        expect(data.extensionCount).toBe(1)
        expect(data.reason).toBe('Bid placed in last 5 minutes')
        done()
      })
    })

    test('should broadcast auction end to participants', (done) => {
      const auction = mockAuction()
      const endData = {
        winnerId: 'user_winner_123',
        winningBid: 60000,
        totalBids: 5,
        endReason: 'Time expired'
      }

      io.on('connection', (socket) => {
        socket.on('join_auction', async (data) => {
          await socket.join(`auction:${data.auctionId}`)
          socket.emit('auction_joined', { auctionId: data.auctionId })
        })

        socket.on('simulate_auction_ended', (data) => {
          io.to(`auction:${data.auctionId}`).emit('auction_ended', {
            auctionId: data.auctionId,
            ...endData,
            timestamp: Date.now()
          })
        })
      })

      clientSocket.emit('join_auction', { auctionId: auction.id })

      clientSocket.on('auction_joined', () => {
        clientSocket.emit('simulate_auction_ended', { auctionId: auction.id })
      })

      clientSocket.on('auction_ended', (data) => {
        expect(data.auctionId).toBe(auction.id)
        expect(data.winnerId).toBe('user_winner_123')
        expect(data.winningBid).toBe(60000)
        expect(data.totalBids).toBe(5)
        expect(data.endReason).toBe('Time expired')
        done()
      })
    })
  })

  describe('User Notifications', () => {
    test('should send outbid notification to specific user', (done) => {
      const user = mockUser()
      const outbidData = {
        auctionId: 'auction_test_123',
        listingTitle: 'BMW X5 2020',
        previousBid: 50000,
        newHighestBid: 55000,
        timeRemaining: 3600000 // 1 hour
      }

      io.on('connection', (socket) => {
        socket.userId = user.id // Simulate authenticated user

        socket.on('simulate_user_outbid', (data) => {
          // Find socket by userId and send notification
          const userSockets = Array.from(io.sockets.sockets.values())
            .filter(s => s.userId === data.userId)
          
          userSockets.forEach(userSocket => {
            userSocket.emit('user_outbid', {
              ...outbidData,
              timestamp: Date.now()
            })
          })
        })
      })

      clientSocket.emit('simulate_user_outbid', { userId: user.id })

      clientSocket.on('user_outbid', (data) => {
        expect(data.auctionId).toBe('auction_test_123')
        expect(data.listingTitle).toBe('BMW X5 2020')
        expect(data.previousBid).toBe(50000)
        expect(data.newHighestBid).toBe(55000)
        expect(data.timeRemaining).toBe(3600000)
        done()
      })
    })

    test('should handle multiple notifications for same user', (done) => {
      const user = mockUser()
      let notificationCount = 0

      io.on('connection', (socket) => {
        socket.userId = user.id

        socket.on('simulate_multiple_notifications', () => {
          // Send multiple notifications
          const notifications = [
            { type: 'outbid', message: 'You have been outbid on BMW X5' },
            { type: 'auction_ending', message: 'Auction ending in 5 minutes' },
            { type: 'auction_won', message: 'Congratulations! You won the auction' }
          ]

          notifications.forEach((notification, index) => {
            setTimeout(() => {
              socket.emit('notification', {
                ...notification,
                timestamp: Date.now()
              })
            }, index * 100) // Stagger notifications
          })
        })
      })

      clientSocket.emit('simulate_multiple_notifications')

      clientSocket.on('notification', (data) => {
        notificationCount++
        expect(data.type).toBeDefined()
        expect(data.message).toBeDefined()
        expect(data.timestamp).toBeDefined()

        if (notificationCount === 3) {
          done()
        }
      })
    })
  })

  describe('Connection Management', () => {
    test('should handle client disconnection gracefully', (done) => {
      const auction = mockAuction()
      let participantCount = 0

      io.on('connection', (socket) => {
        participantCount++

        socket.on('join_auction', async (data) => {
          await socket.join(`auction:${data.auctionId}`)
          socket.emit('auction_joined', { 
            auctionId: data.auctionId,
            participantCount 
          })
        })

        socket.on('disconnect', () => {
          participantCount--
          // Notify remaining participants
          socket.to(`auction:${auction.id}`).emit('participant_left', {
            participantCount
          })
        })
      })

      // Create additional client
      const tempClient = ioc(`http://localhost:${httpServer.address().port}`)

      tempClient.on('connect', () => {
        tempClient.emit('join_auction', { auctionId: auction.id })
      })

      tempClient.on('auction_joined', (data) => {
        expect(data.participantCount).toBeGreaterThan(0)
        // Disconnect the temporary client
        tempClient.close()
      })

      clientSocket.on('participant_left', (data) => {
        expect(data.participantCount).toBeLessThan(2)
        done()
      })
    })

    test('should handle server restart gracefully', (done) => {
      const originalPort = httpServer.address().port

      // Simulate server restart
      io.close()
      httpServer.close()

      // Create new server
      const newHttpServer = createServer()
      const newIo = new Server(newHttpServer)

      newHttpServer.listen(originalPort, () => {
        // Client should attempt to reconnect
        const reconnectClient = ioc(`http://localhost:${originalPort}`, {
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 100
        })

        reconnectClient.on('connect', () => {
          expect(reconnectClient.connected).toBe(true)
          reconnectClient.close()
          newIo.close()
          newHttpServer.close()
          done()
        })

        reconnectClient.on('connect_error', (error) => {
          done(error)
        })
      })
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent connections', (done) => {
      const connectionCount = 10
      const clients = []
      let connectedCount = 0

      // Create multiple clients
      for (let i = 0; i < connectionCount; i++) {
        const client = ioc(`http://localhost:${httpServer.address().port}`)
        clients.push(client)

        client.on('connect', () => {
          connectedCount++
          if (connectedCount === connectionCount) {
            // All clients connected
            expect(connectedCount).toBe(connectionCount)
            
            // Close all clients
            clients.forEach(c => c.close())
            done()
          }
        })

        client.on('connect_error', (error) => {
          done(error)
        })
      }
    })

    test('should handle high-frequency message broadcasting', (done) => {
      const messageCount = 100
      let receivedCount = 0

      io.on('connection', (socket) => {
        socket.on('start_broadcast_test', () => {
          // Send many messages rapidly
          for (let i = 0; i < messageCount; i++) {
            socket.emit('test_message', { 
              id: i, 
              timestamp: Date.now() 
            })
          }
        })
      })

      clientSocket.on('test_message', (data) => {
        receivedCount++
        expect(data.id).toBeDefined()
        expect(data.timestamp).toBeDefined()

        if (receivedCount === messageCount) {
          expect(receivedCount).toBe(messageCount)
          done()
        }
      })

      clientSocket.emit('start_broadcast_test')
    })

    test('should measure message latency', (done) => {
      const startTime = Date.now()

      io.on('connection', (socket) => {
        socket.on('ping', (data) => {
          socket.emit('pong', {
            ...data,
            serverTime: Date.now()
          })
        })
      })

      clientSocket.emit('ping', { clientTime: startTime })

      clientSocket.on('pong', (data) => {
        const endTime = Date.now()
        const roundTripTime = endTime - data.clientTime
        const serverProcessingTime = data.serverTime - data.clientTime

        expect(roundTripTime).toBeLessThan(1000) // Should be under 1 second
        expect(serverProcessingTime).toBeLessThan(100) // Server processing should be fast
        done()
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed messages', (done) => {
      io.on('connection', (socket) => {
        socket.on('malformed_message', (data) => {
          try {
            // Attempt to process malformed data
            const processed = JSON.parse(data.invalidJson)
            socket.emit('message_processed', processed)
          } catch (error) {
            socket.emit('message_error', { 
              error: 'Invalid message format' 
            })
          }
        })
      })

      clientSocket.emit('malformed_message', { 
        invalidJson: '{ invalid json }' 
      })

      clientSocket.on('message_error', (data) => {
        expect(data.error).toBe('Invalid message format')
        done()
      })

      clientSocket.on('message_processed', () => {
        done(new Error('Should not process malformed message'))
      })
    })

    test('should handle rate limiting', (done) => {
      let messageCount = 0
      const rateLimit = 5 // 5 messages per test

      io.on('connection', (socket) => {
        socket.on('rate_limited_message', () => {
          messageCount++
          
          if (messageCount <= rateLimit) {
            socket.emit('message_accepted', { count: messageCount })
          } else {
            socket.emit('rate_limit_exceeded', { 
              message: 'Too many messages' 
            })
          }
        })
      })

      // Send more messages than the rate limit
      for (let i = 0; i < rateLimit + 3; i++) {
        clientSocket.emit('rate_limited_message')
      }

      let acceptedCount = 0
      let rateLimitHit = false

      clientSocket.on('message_accepted', () => {
        acceptedCount++
      })

      clientSocket.on('rate_limit_exceeded', () => {
        rateLimitHit = true
        expect(acceptedCount).toBe(rateLimit)
        expect(rateLimitHit).toBe(true)
        done()
      })
    })
  })
})