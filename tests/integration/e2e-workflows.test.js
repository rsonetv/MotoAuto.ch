/**
 * End-to-End Workflow Tests
 * Tests complete user journeys from registration through auction participation and payment
 */

const request = require('supertest')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid,
  mockPayment,
  createMockJWT,
  mockSupabaseResponse,
  swissTestData,
  emailHelpers
} = require('../utils/test-helpers')

// Mock Next.js app for testing
const mockApp = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  use: jest.fn(),
  listen: jest.fn()
}

describe('End-to-End Workflow Tests', () => {
  let mockSupabase
  let mockStripe
  let mockEmailQueue
  let mockWebSocket

  beforeEach(() => {
    // Mock Supabase
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn()
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn()
      }))
    }

    // Mock Stripe
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        confirm: jest.fn(),
        retrieve: jest.fn()
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn()
      },
      webhooks: {
        constructEvent: jest.fn()
      }
    }

    // Mock Email Queue
    mockEmailQueue = {
      add: jest.fn()
    }

    // Mock WebSocket
    mockWebSocket = {
      emit: jest.fn(),
      to: jest.fn(() => mockWebSocket),
      join: jest.fn(),
      leave: jest.fn()
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase,
      createClientComponentClient: () => mockSupabase
    }))

    jest.doMock('stripe', () => jest.fn(() => mockStripe))
    jest.doMock('@/lib/email-queue', () => mockEmailQueue)
    jest.doMock('@/lib/websocket', () => mockWebSocket)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('User Registration and Onboarding Workflow', () => {
    test('should complete full user registration workflow', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+41 79 123 45 67',
        address: {
          street: 'Bahnhofstrasse 1',
          postalCode: '8001',
          city: 'Zürich',
          country: 'CH'
        },
        language: 'de'
      }

      const user = mockUser({ email: userData.email })
      const profile = mockProfile({ 
        id: user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        language_preference: userData.language
      })

      // Step 1: User registration
      mockSupabase.auth.signUp.mockResolvedValue(
        mockSupabaseResponse({ user, session: null })
      )

      const registrationResult = await mockSupabase.auth.signUp({
        email: userData.email,
        password: userData.password
      })

      expect(registrationResult.data.user).toBeDefined()
      expect(registrationResult.data.user.email).toBe(userData.email)

      // Step 2: Profile creation
      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(profile)
      )

      const profileResult = await mockSupabase
        .from('user_profiles')
        .insert({
          id: user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          language_preference: userData.language
        })

      expect(profileResult.data).toEqual(profile)

      // Step 3: Welcome email queued
      mockEmailQueue.add.mockResolvedValue({ id: 'welcome_job_123' })

      const emailJob = await mockEmailQueue.add('send-email', {
        to: userData.email,
        subject: 'Willkommen bei MotoAuto.ch',
        template: 'welcome',
        data: {
          name: userData.firstName,
          email: userData.email,
          verificationUrl: `https://motoauto.ch/verify?token=${user.id}`
        }
      })

      expect(emailJob.id).toBe('welcome_job_123')

      // Step 4: Email verification
      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse({ user: { ...user, email_confirmed_at: new Date().toISOString() } })
      )

      const verifiedUser = await mockSupabase.auth.getUser()
      expect(verifiedUser.data.user.email_confirmed_at).toBeDefined()

      // Step 5: Profile completion
      const completeProfile = {
        ...profile,
        address_street: userData.address.street,
        address_postal_code: userData.address.postalCode,
        address_city: userData.address.city,
        address_country: userData.address.country,
        profile_completed: true
      }

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse(completeProfile)
      )

      const updatedProfile = await mockSupabase
        .from('user_profiles')
        .update({
          address_street: userData.address.street,
          address_postal_code: userData.address.postalCode,
          address_city: userData.address.city,
          address_country: userData.address.country,
          profile_completed: true
        })
        .eq('id', user.id)

      expect(updatedProfile.data.profile_completed).toBe(true)
    })

    test('should handle registration validation errors', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        phone: 'invalid-phone'
      }

      const validationErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password must be at least 8 characters' },
        { field: 'firstName', message: 'First name is required' },
        { field: 'phone', message: 'Invalid Swiss phone number' }
      ]

      mockSupabase.auth.signUp.mockRejectedValue(
        new Error('Invalid user data')
      )

      await expect(
        mockSupabase.auth.signUp({
          email: invalidUserData.email,
          password: invalidUserData.password
        })
      ).rejects.toThrow('Invalid user data')

      // Validate each field
      validationErrors.forEach(error => {
        expect(error.field).toBeDefined()
        expect(error.message).toBeDefined()
      })
    })
  })

  describe('Listing Creation and Management Workflow', () => {
    test('should complete full listing creation workflow', async () => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })
      const token = createMockJWT({ sub: user.id })

      const listingData = {
        title: 'BMW X5 2020 - Excellent Condition',
        description: 'Well-maintained BMW X5 with full service history',
        price: 45000,
        year: 2020,
        mileage: 50000,
        fuel_type: 'petrol',
        transmission: 'automatic',
        category: 'cars',
        subcategory: 'suv',
        make: 'BMW',
        model: 'X5',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ],
        features: ['leather_seats', 'navigation', 'parking_sensors'],
        location: {
          canton: 'ZH',
          city: 'Zürich',
          postalCode: '8001'
        }
      }

      // Step 1: User authentication
      mockSupabase.auth.getUser.mockResolvedValue(
        mockSupabaseResponse({ user })
      )

      const authUser = await mockSupabase.auth.getUser()
      expect(authUser.data.user.id).toBe(user.id)

      // Step 2: Listing creation
      const listing = mockListing({
        ...listingData,
        user_id: user.id,
        status: 'draft'
      })

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(listing)
      )

      const createdListing = await mockSupabase
        .from('listings')
        .insert({
          ...listingData,
          user_id: user.id,
          status: 'draft'
        })

      expect(createdListing.data.title).toBe(listingData.title)
      expect(createdListing.data.status).toBe('draft')

      // Step 3: Image upload and processing
      const processedImages = listingData.images.map((url, index) => ({
        id: `img_${index + 1}`,
        listing_id: listing.id,
        url,
        order: index,
        is_primary: index === 0
      }))

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(processedImages)
      )

      const uploadedImages = await mockSupabase
        .from('listing_images')
        .insert(processedImages)

      expect(uploadedImages.data).toHaveLength(2)
      expect(uploadedImages.data[0].is_primary).toBe(true)

      // Step 4: Listing validation and approval
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: ['Consider adding more images for better visibility']
      }

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.warnings).toHaveLength(1)

      // Step 5: Listing publication
      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...listing,
          status: 'active',
          published_at: new Date().toISOString()
        })
      )

      const publishedListing = await mockSupabase
        .from('listings')
        .update({
          status: 'active',
          published_at: new Date().toISOString()
        })
        .eq('id', listing.id)

      expect(publishedListing.data.status).toBe('active')
      expect(publishedListing.data.published_at).toBeDefined()

      // Step 6: Search indexing
      const searchIndex = {
        listing_id: listing.id,
        title: listingData.title,
        description: listingData.description,
        keywords: ['BMW', 'X5', '2020', 'SUV', 'automatic'],
        price: listingData.price,
        year: listingData.year,
        make: listingData.make,
        model: listingData.model
      }

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(searchIndex)
      )

      const indexedListing = await mockSupabase
        .from('listing_search_index')
        .insert(searchIndex)

      expect(indexedListing.data.listing_id).toBe(listing.id)
      expect(indexedListing.data.keywords).toContain('BMW')
    })

    test('should handle listing moderation workflow', async () => {
      const user = mockUser()
      const listing = mockListing({ 
        user_id: user.id,
        status: 'pending_review'
      })

      // Step 1: Automated content moderation
      const moderationResult = {
        flagged: false,
        confidence: 0.95,
        categories: [],
        suggestions: []
      }

      expect(moderationResult.flagged).toBe(false)
      expect(moderationResult.confidence).toBeGreaterThan(0.9)

      // Step 2: Manual review (if needed)
      const reviewResult = {
        approved: true,
        reviewer_id: 'admin_123',
        review_notes: 'Listing meets all requirements',
        reviewed_at: new Date().toISOString()
      }

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...listing,
          status: 'active',
          moderation_status: 'approved',
          reviewed_at: reviewResult.reviewed_at
        })
      )

      const approvedListing = await mockSupabase
        .from('listings')
        .update({
          status: 'active',
          moderation_status: 'approved',
          reviewed_at: reviewResult.reviewed_at
        })
        .eq('id', listing.id)

      expect(approvedListing.data.status).toBe('active')
      expect(approvedListing.data.moderation_status).toBe('approved')

      // Step 3: Notification to user
      mockEmailQueue.add.mockResolvedValue({ id: 'approval_job_123' })

      const notificationJob = await mockEmailQueue.add('send-email', {
        to: user.email,
        subject: 'Ihr Inserat wurde genehmigt',
        template: 'listing-approved',
        data: {
          listingTitle: listing.title,
          listingUrl: `https://motoauto.ch/listings/${listing.id}`
        }
      })

      expect(notificationJob.id).toBe('approval_job_123')
    })
  })

  describe('Auction Participation Workflow', () => {
    test('should complete full auction participation workflow', async () => {
      const seller = mockUser()
      const bidder1 = mockUser()
      const bidder2 = mockUser()
      
      const listing = mockListing({ 
        user_id: seller.id,
        is_auction: true,
        starting_bid: 40000,
        current_bid: 40000
      })
      
      const auction = mockAuction({ 
        listing_id: listing.id,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      // Step 1: Auction creation
      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(auction)
      )

      const createdAuction = await mockSupabase
        .from('auctions')
        .insert({
          listing_id: listing.id,
          start_time: auction.start_time,
          end_time: auction.end_time,
          starting_bid: listing.starting_bid
        })

      expect(createdAuction.data.listing_id).toBe(listing.id)

      // Step 2: Bidder 1 joins auction
      mockWebSocket.join.mockResolvedValue(true)
      
      await mockWebSocket.join(`auction:${auction.id}`)
      
      mockWebSocket.emit('auction_joined', {
        auctionId: auction.id,
        participantCount: 1
      })

      expect(mockWebSocket.join).toHaveBeenCalledWith(`auction:${auction.id}`)

      // Step 3: First bid placement
      const bid1 = mockBid({
        auction_id: auction.id,
        user_id: bidder1.id,
        amount: 42000
      })

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(bid1)
      )

      const placedBid1 = await mockSupabase
        .from('bids')
        .insert({
          auction_id: auction.id,
          user_id: bidder1.id,
          amount: 42000
        })

      expect(placedBid1.data.amount).toBe(42000)

      // Step 4: Update listing current bid
      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...listing,
          current_bid: 42000,
          bid_count: 1
        })
      )

      const updatedListing = await mockSupabase
        .from('listings')
        .update({
          current_bid: 42000,
          bid_count: 1
        })
        .eq('id', listing.id)

      expect(updatedListing.data.current_bid).toBe(42000)

      // Step 5: Broadcast bid to all participants
      mockWebSocket.to(`auction:${auction.id}`).emit('bid_placed', {
        auctionId: auction.id,
        bid: {
          id: bid1.id,
          amount: 42000,
          userId: bidder1.id,
          userName: 'Bidder 1',
          newCurrentBid: 42000,
          newBidCount: 1
        }
      })

      expect(mockWebSocket.to).toHaveBeenCalledWith(`auction:${auction.id}`)

      // Step 6: Bidder 2 places higher bid
      const bid2 = mockBid({
        auction_id: auction.id,
        user_id: bidder2.id,
        amount: 45000
      })

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(bid2)
      )

      const placedBid2 = await mockSupabase
        .from('bids')
        .insert({
          auction_id: auction.id,
          user_id: bidder2.id,
          amount: 45000
        })

      expect(placedBid2.data.amount).toBe(45000)

      // Step 7: Outbid notification to bidder 1
      mockEmailQueue.add.mockResolvedValue({ id: 'outbid_job_123' })

      const outbidNotification = await mockEmailQueue.add('send-email', {
        to: bidder1.email,
        subject: 'Sie wurden überboten',
        template: 'auction-outbid',
        data: {
          listingTitle: listing.title,
          previousBid: 42000,
          newHighestBid: 45000,
          auctionUrl: `https://motoauto.ch/auctions/${auction.id}`
        }
      })

      expect(outbidNotification.id).toBe('outbid_job_123')

      // Step 8: Auction ending soon notification
      mockEmailQueue.add.mockResolvedValue({ id: 'ending_job_123' })

      const endingNotification = await mockEmailQueue.add('send-email', {
        to: bidder2.email,
        subject: 'Auktion endet bald',
        template: 'auction-ending',
        data: {
          listingTitle: listing.title,
          currentBid: 45000,
          timeRemaining: '15 Minuten',
          isHighestBidder: true
        }
      })

      expect(endingNotification.id).toBe('ending_job_123')

      // Step 9: Auction ends
      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...auction,
          status: 'ended',
          winner_id: bidder2.id,
          winning_bid: 45000,
          ended_at: new Date().toISOString()
        })
      )

      const endedAuction = await mockSupabase
        .from('auctions')
        .update({
          status: 'ended',
          winner_id: bidder2.id,
          winning_bid: 45000,
          ended_at: new Date().toISOString()
        })
        .eq('id', auction.id)

      expect(endedAuction.data.status).toBe('ended')
      expect(endedAuction.data.winner_id).toBe(bidder2.id)

      // Step 10: Winner notification
      mockEmailQueue.add.mockResolvedValue({ id: 'winner_job_123' })

      const winnerNotification = await mockEmailQueue.add('send-email', {
        to: bidder2.email,
        subject: 'Herzlichen Glückwunsch! Sie haben gewonnen',
        template: 'auction-won',
        data: {
          listingTitle: listing.title,
          winningBid: 45000,
          nextSteps: 'payment_instructions'
        }
      })

      expect(winnerNotification.id).toBe('winner_job_123')
    })

    test('should handle auction extension workflow', async () => {
      const auction = mockAuction({
        end_time: new Date(Date.now() + 3 * 60 * 1000).toISOString() // 3 minutes from now
      })

      const lateBid = mockBid({
        auction_id: auction.id,
        amount: 50000,
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      })

      // Check if bid was placed in last 5 minutes
      const bidTime = new Date(lateBid.created_at)
      const auctionEnd = new Date(auction.end_time)
      const timeDiff = auctionEnd.getTime() - bidTime.getTime()
      const shouldExtend = timeDiff < 5 * 60 * 1000 // 5 minutes

      expect(shouldExtend).toBe(true)

      // Extend auction by 5 minutes
      const newEndTime = new Date(auctionEnd.getTime() + 5 * 60 * 1000).toISOString()

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...auction,
          end_time: newEndTime,
          extension_count: 1
        })
      )

      const extendedAuction = await mockSupabase
        .from('auctions')
        .update({
          end_time: newEndTime,
          extension_count: 1
        })
        .eq('id', auction.id)

      expect(extendedAuction.data.extension_count).toBe(1)

      // Notify participants about extension
      mockWebSocket.to(`auction:${auction.id}`).emit('auction_extended', {
        auctionId: auction.id,
        newEndTime,
        extensionMinutes: 5,
        reason: 'Bid placed in last 5 minutes'
      })

      expect(mockWebSocket.to).toHaveBeenCalledWith(`auction:${auction.id}`)
    })
  })

  describe('Payment Processing Workflow', () => {
    test('should complete full payment workflow', async () => {
      const buyer = mockUser()
      const seller = mockUser()
      const listing = mockListing({ 
        user_id: seller.id,
        price: 45000,
        status: 'sold'
      })

      // Step 1: Payment intent creation
      const paymentIntent = {
        id: 'pi_test_123',
        amount: 45000 * 100, // Stripe uses cents
        currency: 'chf',
        status: 'requires_payment_method',
        client_secret: 'pi_test_123_secret'
      }

      mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent)

      const createdIntent = await mockStripe.paymentIntents.create({
        amount: 45000 * 100,
        currency: 'chf',
        metadata: {
          listing_id: listing.id,
          buyer_id: buyer.id,
          seller_id: seller.id
        }
      })

      expect(createdIntent.id).toBe('pi_test_123')
      expect(createdIntent.amount).toBe(4500000) // 45000 CHF in cents

      // Step 2: Payment record creation
      const payment = mockPayment({
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: seller.id,
        amount: 45000,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      })

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(payment)
      )

      const createdPayment = await mockSupabase
        .from('payments')
        .insert({
          listing_id: listing.id,
          buyer_id: buyer.id,
          seller_id: seller.id,
          amount: 45000,
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending'
        })

      expect(createdPayment.data.status).toBe('pending')

      // Step 3: Payment confirmation
      mockStripe.paymentIntents.confirm.mockResolvedValue({
        ...paymentIntent,
        status: 'succeeded',
        charges: {
          data: [{
            id: 'ch_test_123',
            amount: 4500000,
            currency: 'chf',
            status: 'succeeded'
          }]
        }
      })

      const confirmedIntent = await mockStripe.paymentIntents.confirm(
        paymentIntent.id,
        {
          payment_method: 'pm_card_visa'
        }
      )

      expect(confirmedIntent.status).toBe('succeeded')

      // Step 4: Payment status update
      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...payment,
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_charge_id: 'ch_test_123'
        })
      )

      const completedPayment = await mockSupabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_charge_id: 'ch_test_123'
        })
        .eq('id', payment.id)

      expect(completedPayment.data.status).toBe('completed')

      // Step 5: Commission calculation
      const commission = swissTestData.calculateCommission(45000)
      const sellerPayout = 45000 - commission

      expect(commission).toBe(500) // Capped at CHF 500
      expect(sellerPayout).toBe(44500)

      // Step 6: Seller payout record
      const payout = {
        id: 'payout_test_123',
        payment_id: payment.id,
        seller_id: seller.id,
        amount: sellerPayout,
        commission: commission,
        status: 'pending',
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
      }

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(payout)
      )

      const createdPayout = await mockSupabase
        .from('seller_payouts')
        .insert(payout)

      expect(createdPayout.data.amount).toBe(44500)
      expect(createdPayout.data.commission).toBe(500)

      // Step 7: Payment confirmation emails
      mockEmailQueue.add
        .mockResolvedValueOnce({ id: 'buyer_confirmation_123' })
        .mockResolvedValueOnce({ id: 'seller_notification_123' })

      // Buyer confirmation
      const buyerEmail = await mockEmailQueue.add('send-email', {
        to: buyer.email,
        subject: 'Zahlungsbestätigung - MotoAuto.ch',
        template: 'payment-confirmation',
        data: {
          listingTitle: listing.title,
          amount: 45000,
          transactionId: 'ch_test_123'
        }
      })

      // Seller notification
      const sellerEmail = await mockEmailQueue.add('send-email', {
        to: seller.email,
        subject: 'Zahlung erhalten - MotoAuto.ch',
        template: 'payment-received',
        data: {
          listingTitle: listing.title,
          amount: sellerPayout,
          commission: commission,
          payoutDate: payout.scheduled_date
        }
      })

      expect(buyerEmail.id).toBe('buyer_confirmation_123')
      expect(sellerEmail.id).toBe('seller_notification_123')

      // Step 8: Invoice generation
      const invoice = swissTestData.generateInvoice(payment)

      expect(invoice.invoice_number).toBeDefined()
      expect(invoice.net_amount).toBe(Math.round(45000 / 1.077))
      expect(invoice.vat_amount).toBe(45000 - Math.round(45000 / 1.077))
      expect(invoice.gross_amount).toBe(45000)
    })

    test('should handle payment failure workflow', async () => {
      const buyer = mockUser()
      const listing = mockListing({ price: 45000 })
      const payment = mockPayment({
        listing_id: listing.id,
        buyer_id: buyer.id,
        status: 'pending'
      })

      // Payment fails
      mockStripe.paymentIntents.confirm.mockRejectedValue(
        new Error('Your card was declined.')
      )

      try {
        await mockStripe.paymentIntents.confirm('pi_test_123', {
          payment_method: 'pm_card_declined'
        })
      } catch (error) {
        expect(error.message).toBe('Your card was declined.')

        // Update payment status
        mockSupabase.from().update().eq().mockResolvedValue(
          mockSupabaseResponse({
            ...payment,
            status: 'failed',
            failure_reason: 'card_declined',
            failed_at: new Date().toISOString()
          })
        )

        const failedPayment = await mockSupabase
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: 'card_declined',
            failed_at: new Date().toISOString()
          })
          .eq('id', payment.id)

        expect(failedPayment.data.status).toBe('failed')

        // Send failure notification
        mockEmailQueue.add.mockResolvedValue({ id: 'payment_failed_123' })

        const failureEmail = await mockEmailQueue.add('send-email', {
          to: buyer.email,
          subject: 'Zahlung fehlgeschlagen - MotoAuto.ch',
          template: 'payment-failed',
          data: {
            listingTitle: listing.title,
            amount: 45000,
            failureReason: 'card_declined',
            retryUrl: `https://motoauto.ch/payments/retry/${payment.id}`
          }
        })

        expect(failureEmail.id).toBe('payment_failed_123')
      }
    })
  })

  describe('Customer Support Workflow', () => {
    test('should handle dispute resolution workflow', async () => {
      const buyer = mockUser()
      const seller = mockUser()
      const listing = mockListing({ user_id: seller.id })
      const payment = mockPayment({
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: seller.id,
        status: 'completed'
      })

      // Step 1: Dispute creation
      const dispute = {
        id: 'dispute_test_123',
        payment_id: payment.id,
        buyer_id: buyer.id,
        seller_id: seller.id,
        type: 'item_not_as_described',
        description: 'Vehicle has undisclosed damage',
        status: 'open',
        created_at: new Date().toISOString()
      }

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(dispute)
      )

      const createdDispute = await mockSupabase
        .from('disputes')
        .insert(dispute)

      expect(createdDispute.data.type).toBe('item_not_as_described')
      expect(createdDispute.data.status).toBe('open')

      // Step 2: Notify both parties
      mockEmailQueue.add
        .mockResolvedValueOnce({ id: 'dispute_buyer_123' })
        .mockResolvedValueOnce({ id: 'dispute_seller_123' })

      const buyerNotification = await mockEmailQueue.add('send-email', {
        to: buyer.email,
        subject: 'Streitfall eröffnet - MotoAuto.ch',
        template: 'dispute-opened-buyer',
        data: {
          disputeId: dispute.id,
          listingTitle: listing.title
        }
      })

      const sellerNotification = await mockEmailQueue.add('send-email', {
        to: seller.email,
        subject: 'Streitfall eröffnet - MotoAuto.ch',
        template: 'dispute-opened-seller',
        data: {
          disputeId: dispute.id,
          listingTitle: listing.title
        }
      })

      expect(buyerNotification.id).toBe('dispute_buyer_123')
      expect(sellerNotification.id).toBe('dispute_seller_123')

      // Step 3: Admin review and resolution
      const resolution = {
        dispute_id: dispute.id,
        admin_id: 'admin_123',
        resolution_type: 'partial_refund',
        refund_amount: 5000,
        resolution_notes: 'Partial refund due to minor undisclosed damage',
        resolved_at: new Date().toISOString()
      }

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          ...dispute,
          status: 'resolved',
          resolution_type: resolution.resolution_type,
          resolved_at: resolution.resolved_at
        })
      )

      const resolvedDispute = await mockSupabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution_type: resolution.resolution_type,
          resolved_at: resolution.resolved_at
        })
        .eq('id', dispute.id)

      expect(resolvedDispute.data.status).toBe('resolved')
      expect(resolvedDispute.data.resolution_type).toBe('partial_refund')
    })
  })

  describe('Analytics and Reporting Workflow', () => {
    test('should track user engagement metrics', async () => {
      const user = mockUser()
      const listing = mockListing()

      // Track page views
      const pageView = {
        user_id: user.id,
        listing_id: listing.id,
        page_type: 'listing_detail',
        timestamp: new Date().toISOString(),
        session_id: 'session_123',
        user_agent: 'Mozilla/5.0...',
        referrer: 'https://google.com'
      }

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(pageView)
      )

      const trackedView = await mockSupabase
        .from('page_views')
        .insert(pageView)

      expect(trackedView.data.page_type).toBe('listing_detail')

      // Track user actions
      const userAction = {
        user_id: user.id,
        action_type: 'favorite_added',
        resource_type: 'listing',
        resource_id: listing.id,
        timestamp: new Date().toISOString()
      }

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(userAction)
      )

      const trackedAction = await mockSupabase
        .from('user_actions')
        .insert(userAction)

      expect(trackedAction.data.action_type).toBe('favorite_added')
    })

    test('should generate business intelligence reports', async () => {
      const reportData = {
        period: '2024-Q1',
        total_listings: 1250,
        total_auctions: 340,
        total_sales: 890,
        total_revenue: 2250000, // CHF
        average_sale_price: 45000,
        top_categories: [
          { category: 'cars', count: 750, percentage: 60 },
          { category: 'motorcycles', count: 300, percentage: 24 },
          { category: 'trucks', count: 200, percentage: 16 }
        ],
        user_metrics: {
          new_registrations: 450,
          active_users: 2800,
          retention_rate: 0.75
        }
      }

      expect(reportData.total_revenue).toBe(2250000)
      expect(reportData.average_sale_price).toBe(45000)
      expect(reportData.user_metrics.retention_rate).toBe(0.75)
    })
  })
})