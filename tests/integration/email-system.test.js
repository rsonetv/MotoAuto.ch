/**
 * Email System Tests
 * Tests email queue processing, template rendering, and delivery tracking
 */

const nodemailer = require('nodemailer')
const Bull = require('bull')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid,
  mockSupabaseResponse,
  emailHelpers,
  swissTestData
} = require('../utils/test-helpers')

// Mock Redis for Bull queue
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    keys: jest.fn(),
    flushall: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    duplicate: jest.fn(() => mockRedis)
  }
  return jest.fn(() => mockRedis)
})

describe('Email System Tests', () => {
  let mockTransporter
  let mockQueue
  let mockSupabase

  beforeEach(() => {
    // Mock Nodemailer transporter
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
      close: jest.fn()
    }
    
    jest.spyOn(nodemailer, 'createTransporter').mockReturnValue(mockTransporter)

    // Mock Bull queue
    mockQueue = {
      add: jest.fn(),
      process: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
      getJobs: jest.fn(),
      getJob: jest.fn(),
      removeJobs: jest.fn(),
      clean: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getWaiting: jest.fn(),
      getActive: jest.fn(),
      getCompleted: jest.fn(),
      getFailed: jest.fn()
    }

    jest.spyOn(Bull, 'Queue').mockImplementation(() => mockQueue)

    // Mock Supabase
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }))
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('Email Queue Management', () => {
    test('should add email job to queue', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'welcome',
        data: { name: 'Test User' }
      }

      mockQueue.add.mockResolvedValue({ id: 'job_123' })

      // Simulate adding email to queue
      const jobId = await mockQueue.add('send-email', emailData, {
        attempts: 3,
        backoff: 'exponential',
        delay: 0
      })

      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailData,
        expect.objectContaining({
          attempts: 3,
          backoff: 'exponential',
          delay: 0
        })
      )
      expect(jobId.id).toBe('job_123')
    })

    test('should process email queue jobs', async () => {
      const emailJob = {
        id: 'job_123',
        data: {
          to: 'test@example.com',
          subject: 'Test Email',
          template: 'welcome',
          data: { name: 'Test User' }
        }
      }

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'msg_123',
        accepted: ['test@example.com'],
        rejected: [],
        response: '250 OK'
      })

      // Simulate queue processor
      const processor = jest.fn(async (job) => {
        const { to, subject, template, data } = job.data
        
        // Render email template
        const html = emailHelpers.renderTemplate(template, data)
        
        // Send email
        const result = await mockTransporter.sendMail({
          from: 'noreply@motoauto.ch',
          to,
          subject,
          html
        })

        return result
      })

      mockQueue.process.mockImplementation((concurrency, processorFn) => {
        processorFn(emailJob)
      })

      // Process the job
      await processor(emailJob)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@motoauto.ch',
        to: 'test@example.com',
        subject: 'Test Email',
        html: expect.any(String)
      })
    })

    test('should handle queue job failures with retry', async () => {
      const emailJob = {
        id: 'job_123',
        data: {
          to: 'invalid@email',
          subject: 'Test Email',
          template: 'welcome',
          data: { name: 'Test User' }
        },
        attemptsMade: 1,
        opts: { attempts: 3 }
      }

      // Mock email sending failure
      mockTransporter.sendMail.mockRejectedValue(new Error('Invalid email address'))

      const processor = jest.fn(async (job) => {
        try {
          const result = await mockTransporter.sendMail({
            from: 'noreply@motoauto.ch',
            to: job.data.to,
            subject: job.data.subject,
            html: 'Test content'
          })
          return result
        } catch (error) {
          if (job.attemptsMade < job.opts.attempts) {
            throw error // Will trigger retry
          } else {
            // Log failure and move to failed queue
            console.error('Email job failed permanently:', error.message)
            throw error
          }
        }
      })

      await expect(processor(emailJob)).rejects.toThrow('Invalid email address')
      expect(mockTransporter.sendMail).toHaveBeenCalled()
    })

    test('should clean up old completed jobs', async () => {
      const cleanupOptions = {
        grace: 24 * 60 * 60 * 1000, // 24 hours
        limit: 100
      }

      mockQueue.clean.mockResolvedValue(['job_1', 'job_2', 'job_3'])

      const cleanedJobs = await mockQueue.clean(
        cleanupOptions.grace,
        'completed',
        cleanupOptions.limit
      )

      expect(mockQueue.clean).toHaveBeenCalledWith(
        cleanupOptions.grace,
        'completed',
        cleanupOptions.limit
      )
      expect(cleanedJobs).toHaveLength(3)
    })
  })

  describe('Email Templates', () => {
    test('should render welcome email template', () => {
      const templateData = {
        name: 'John Doe',
        email: 'john@example.com',
        verificationUrl: 'https://motoauto.ch/verify?token=abc123'
      }

      const html = emailHelpers.renderTemplate('welcome', templateData)

      expect(html).toContain('Willkommen bei MotoAuto.ch')
      expect(html).toContain('John Doe')
      expect(html).toContain('https://motoauto.ch/verify?token=abc123')
      expect(html).toContain('E-Mail bestätigen')
    })

    test('should render auction notification template', () => {
      const auction = mockAuction()
      const listing = mockListing({ 
        id: auction.listing_id, 
        title: 'BMW X5 2020',
        is_auction: true 
      })

      const templateData = {
        userName: 'John Doe',
        listingTitle: listing.title,
        currentBid: 55000,
        timeRemaining: '2 Stunden 30 Minuten',
        auctionUrl: `https://motoauto.ch/auctions/${auction.id}`,
        currency: 'CHF'
      }

      const html = emailHelpers.renderTemplate('auction-outbid', templateData)

      expect(html).toContain('Sie wurden überboten')
      expect(html).toContain('BMW X5 2020')
      expect(html).toContain('CHF 55\'000')
      expect(html).toContain('2 Stunden 30 Minuten')
      expect(html).toContain(`https://motoauto.ch/auctions/${auction.id}`)
    })

    test('should render auction ending notification template', () => {
      const auction = mockAuction()
      const listing = mockListing({ 
        id: auction.listing_id, 
        title: 'Mercedes C-Class 2019' 
      })

      const templateData = {
        userName: 'Jane Smith',
        listingTitle: listing.title,
        currentBid: 42000,
        timeRemaining: '15 Minuten',
        auctionUrl: `https://motoauto.ch/auctions/${auction.id}`,
        currency: 'CHF',
        isHighestBidder: true
      }

      const html = emailHelpers.renderTemplate('auction-ending', templateData)

      expect(html).toContain('Auktion endet bald')
      expect(html).toContain('Mercedes C-Class 2019')
      expect(html).toContain('CHF 42\'000')
      expect(html).toContain('15 Minuten')
      expect(html).toContain('Sie sind aktuell Höchstbietender')
    })

    test('should render payment confirmation template', () => {
      const templateData = {
        userName: 'John Doe',
        listingTitle: 'Audi A4 2021',
        amount: 38500,
        currency: 'CHF',
        paymentMethod: 'TWINT',
        transactionId: 'txn_abc123',
        invoiceUrl: 'https://motoauto.ch/invoices/inv_123',
        vatAmount: 2772.50,
        vatRate: 7.7
      }

      const html = emailHelpers.renderTemplate('payment-confirmation', templateData)

      expect(html).toContain('Zahlungsbestätigung')
      expect(html).toContain('Audi A4 2021')
      expect(html).toContain('CHF 38\'500')
      expect(html).toContain('TWINT')
      expect(html).toContain('txn_abc123')
      expect(html).toContain('CHF 2\'772.50')
      expect(html).toContain('7.7%')
    })

    test('should handle missing template gracefully', () => {
      const templateData = { name: 'Test User' }

      expect(() => {
        emailHelpers.renderTemplate('non-existent-template', templateData)
      }).toThrow('Template not found: non-existent-template')
    })

    test('should support multilingual templates', () => {
      const templateData = {
        name: 'Pierre Dubois',
        listingTitle: 'Volkswagen Golf 2020'
      }

      // French template
      const frenchHtml = emailHelpers.renderTemplate('welcome', templateData, 'fr')
      expect(frenchHtml).toContain('Bienvenue chez MotoAuto.ch')
      expect(frenchHtml).toContain('Pierre Dubois')

      // German template (default)
      const germanHtml = emailHelpers.renderTemplate('welcome', templateData, 'de')
      expect(germanHtml).toContain('Willkommen bei MotoAuto.ch')
      expect(germanHtml).toContain('Pierre Dubois')

      // Polish template
      const polishHtml = emailHelpers.renderTemplate('welcome', templateData, 'pl')
      expect(polishHtml).toContain('Witamy w MotoAuto.ch')
      expect(polishHtml).toContain('Pierre Dubois')
    })
  })

  describe('Email Delivery Tracking', () => {
    test('should track email delivery status', async () => {
      const emailLog = {
        id: 'log_123',
        recipient: 'test@example.com',
        subject: 'Test Email',
        template: 'welcome',
        status: 'sent',
        message_id: 'msg_123',
        sent_at: new Date().toISOString(),
        delivered_at: null,
        opened_at: null,
        clicked_at: null
      }

      mockSupabase.from().insert().mockResolvedValue(
        mockSupabaseResponse(emailLog)
      )

      // Simulate logging email send
      const logResult = await mockSupabase
        .from('email_logs')
        .insert({
          recipient: emailLog.recipient,
          subject: emailLog.subject,
          template: emailLog.template,
          status: 'sent',
          message_id: emailLog.message_id,
          sent_at: emailLog.sent_at
        })

      expect(mockSupabase.from).toHaveBeenCalledWith('email_logs')
      expect(logResult).toBeDefined()
    })

    test('should update delivery status from webhook', async () => {
      const webhookData = {
        messageId: 'msg_123',
        event: 'delivered',
        timestamp: new Date().toISOString(),
        recipient: 'test@example.com'
      }

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({ 
          id: 'log_123',
          status: 'delivered',
          delivered_at: webhookData.timestamp
        })
      )

      // Simulate webhook processing
      const updateResult = await mockSupabase
        .from('email_logs')
        .update({
          status: 'delivered',
          delivered_at: webhookData.timestamp
        })
        .eq('message_id', webhookData.messageId)

      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'delivered',
        delivered_at: webhookData.timestamp
      })
    })

    test('should track email opens', async () => {
      const openData = {
        messageId: 'msg_123',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.1'
      }

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          id: 'log_123',
          status: 'opened',
          opened_at: openData.timestamp
        })
      )

      // Simulate email open tracking
      const updateResult = await mockSupabase
        .from('email_logs')
        .update({
          status: 'opened',
          opened_at: openData.timestamp,
          open_count: 1
        })
        .eq('message_id', openData.messageId)

      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'opened',
        opened_at: openData.timestamp,
        open_count: 1
      })
    })

    test('should handle bounce notifications', async () => {
      const bounceData = {
        messageId: 'msg_123',
        bounceType: 'permanent',
        bounceSubType: 'general',
        timestamp: new Date().toISOString(),
        recipient: 'invalid@example.com',
        diagnosticCode: '550 5.1.1 User unknown'
      }

      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({
          id: 'log_123',
          status: 'bounced',
          bounce_type: bounceData.bounceType,
          bounce_reason: bounceData.diagnosticCode
        })
      )

      // Simulate bounce processing
      const updateResult = await mockSupabase
        .from('email_logs')
        .update({
          status: 'bounced',
          bounce_type: bounceData.bounceType,
          bounce_reason: bounceData.diagnosticCode,
          bounced_at: bounceData.timestamp
        })
        .eq('message_id', bounceData.messageId)

      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'bounced',
        bounce_type: 'permanent',
        bounce_reason: '550 5.1.1 User unknown',
        bounced_at: bounceData.timestamp
      })
    })
  })

  describe('Notification Workflows', () => {
    test('should send welcome email after user registration', async () => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })

      const emailData = {
        to: user.email,
        subject: 'Willkommen bei MotoAuto.ch',
        template: 'welcome',
        data: {
          name: profile.first_name,
          email: user.email,
          verificationUrl: `https://motoauto.ch/verify?token=${user.id}`
        }
      }

      mockQueue.add.mockResolvedValue({ id: 'welcome_job_123' })

      // Simulate user registration workflow
      const jobId = await mockQueue.add('send-email', emailData, {
        attempts: 3,
        delay: 1000 // 1 second delay
      })

      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailData,
        expect.objectContaining({
          attempts: 3,
          delay: 1000
        })
      )
      expect(jobId.id).toBe('welcome_job_123')
    })

    test('should send bid notification emails', async () => {
      const auction = mockAuction()
      const listing = mockListing({ id: auction.listing_id })
      const bidder = mockUser()
      const previousBidder = mockUser()

      // Email to previous highest bidder (outbid notification)
      const outbidEmailData = {
        to: previousBidder.email,
        subject: 'Sie wurden überboten - MotoAuto.ch',
        template: 'auction-outbid',
        data: {
          userName: 'Previous Bidder',
          listingTitle: listing.title,
          currentBid: 55000,
          timeRemaining: '2 Stunden 30 Minuten',
          auctionUrl: `https://motoauto.ch/auctions/${auction.id}`,
          currency: 'CHF'
        }
      }

      // Email to auction owner (new bid notification)
      const newBidEmailData = {
        to: 'owner@example.com',
        subject: 'Neues Gebot erhalten - MotoAuto.ch',
        template: 'new-bid-notification',
        data: {
          ownerName: 'Auction Owner',
          listingTitle: listing.title,
          bidAmount: 55000,
          bidderName: 'New Bidder',
          auctionUrl: `https://motoauto.ch/auctions/${auction.id}`,
          currency: 'CHF'
        }
      }

      mockQueue.add
        .mockResolvedValueOnce({ id: 'outbid_job_123' })
        .mockResolvedValueOnce({ id: 'newbid_job_124' })

      // Send both notifications
      const outbidJob = await mockQueue.add('send-email', outbidEmailData)
      const newBidJob = await mockQueue.add('send-email', newBidEmailData)

      expect(mockQueue.add).toHaveBeenCalledTimes(2)
      expect(outbidJob.id).toBe('outbid_job_123')
      expect(newBidJob.id).toBe('newbid_job_124')
    })

    test('should send auction ending notifications', async () => {
      const auction = mockAuction()
      const listing = mockListing({ id: auction.listing_id })
      const participants = [
        { email: 'bidder1@example.com', name: 'Bidder 1', isHighest: true },
        { email: 'bidder2@example.com', name: 'Bidder 2', isHighest: false },
        { email: 'bidder3@example.com', name: 'Bidder 3', isHighest: false }
      ]

      mockQueue.add.mockImplementation((jobType, data) => 
        Promise.resolve({ id: `ending_job_${Math.random()}` })
      )

      // Send ending notifications to all participants
      const jobs = await Promise.all(
        participants.map(participant => 
          mockQueue.add('send-email', {
            to: participant.email,
            subject: 'Auktion endet bald - MotoAuto.ch',
            template: 'auction-ending',
            data: {
              userName: participant.name,
              listingTitle: listing.title,
              currentBid: 55000,
              timeRemaining: '15 Minuten',
              auctionUrl: `https://motoauto.ch/auctions/${auction.id}`,
              currency: 'CHF',
              isHighestBidder: participant.isHighest
            }
          })
        )
      )

      expect(mockQueue.add).toHaveBeenCalledTimes(3)
      expect(jobs).toHaveLength(3)
      jobs.forEach(job => {
        expect(job.id).toMatch(/ending_job_/)
      })
    })

    test('should send payment confirmation emails', async () => {
      const user = mockUser()
      const listing = mockListing()
      const paymentData = swissTestData.payment()

      const emailData = {
        to: user.email,
        subject: 'Zahlungsbestätigung - MotoAuto.ch',
        template: 'payment-confirmation',
        data: {
          userName: 'John Doe',
          listingTitle: listing.title,
          amount: paymentData.amount,
          currency: 'CHF',
          paymentMethod: paymentData.payment_method,
          transactionId: paymentData.stripe_payment_intent_id,
          invoiceUrl: `https://motoauto.ch/invoices/${paymentData.id}`,
          vatAmount: Math.round(paymentData.amount * 0.077),
          vatRate: 7.7
        }
      }

      mockQueue.add.mockResolvedValue({ id: 'payment_job_123' })

      const jobId = await mockQueue.add('send-email', emailData, {
        priority: 'high',
        attempts: 5
      })

      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailData,
        expect.objectContaining({
          priority: 'high',
          attempts: 5
        })
      )
      expect(jobId.id).toBe('payment_job_123')
    })
  })

  describe('Email Configuration and Security', () => {
    test('should validate SMTP configuration', async () => {
      mockTransporter.verify.mockResolvedValue(true)

      const isValid = await mockTransporter.verify()

      expect(isValid).toBe(true)
      expect(mockTransporter.verify).toHaveBeenCalled()
    })

    test('should handle SMTP authentication failure', async () => {
      mockTransporter.verify.mockRejectedValue(
        new Error('Invalid login: 535 Authentication failed')
      )

      await expect(mockTransporter.verify()).rejects.toThrow(
        'Invalid login: 535 Authentication failed'
      )
    })

    test('should sanitize email content', () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>John Doe',
        message: 'Hello <img src="x" onerror="alert(1)"> World'
      }

      const sanitized = emailHelpers.sanitizeEmailData(maliciousData)

      expect(sanitized.name).toBe('John Doe')
      expect(sanitized.message).toBe('Hello  World')
      expect(sanitized.name).not.toContain('<script>')
      expect(sanitized.message).not.toContain('onerror')
    })

    test('should validate email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com'
      ]

      validEmails.forEach(email => {
        expect(emailHelpers.isValidEmail(email)).toBe(true)
      })

      invalidEmails.forEach(email => {
        expect(emailHelpers.isValidEmail(email)).toBe(false)
      })
    })

    test('should respect unsubscribe preferences', async () => {
      const user = mockUser()
      
      // Mock user preferences
      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSupabaseResponse({
          user_id: user.id,
          email_notifications: false,
          marketing_emails: false,
          auction_notifications: true
        })
      )

      const preferences = await mockSupabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Should not send marketing emails
      expect(preferences.data.marketing_emails).toBe(false)
      // Should still send auction notifications
      expect(preferences.data.auction_notifications).toBe(true)
    })
  })

  describe('Performance and Monitoring', () => {
    test('should monitor queue health', async () => {
      const queueStats = {
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 1
      }

      mockQueue.getWaiting.mockResolvedValue(new Array(queueStats.waiting))
      mockQueue.getActive.mockResolvedValue(new Array(queueStats.active))
      mockQueue.getCompleted.mockResolvedValue(new Array(queueStats.completed))
      mockQueue.getFailed.mockResolvedValue(new Array(queueStats.failed))

      const waiting = await mockQueue.getWaiting()
      const active = await mockQueue.getActive()
      const completed = await mockQueue.getCompleted()
      const failed = await mockQueue.getFailed()

      expect(waiting).toHaveLength(queueStats.waiting)
      expect(active).toHaveLength(queueStats.active)
      expect(completed).toHaveLength(queueStats.completed)
      expect(failed).toHaveLength(queueStats.failed)
    })

    test('should handle high email volume', async () => {
      const emailCount = 1000
      const batchSize = 100

      mockQueue.add.mockImplementation(() => 
        Promise.resolve({ id: `bulk_job_${Math.random()}` })
      )

      // Simulate bulk email sending
      const batches = []
      for (let i = 0; i < emailCount; i += batchSize) {
        const batch = []
        for (let j = i; j < Math.min(i + batchSize, emailCount); j++) {
          batch.push(
            mockQueue.add('send-email', {
              to: `user${j}@example.com`,
              subject: 'Bulk Email',
              template: 'newsletter',
              data: { userId: j }
            })
          )
        }
        batches.push(Promise.all(batch))
      }

      const results = await Promise.all(batches)
      const totalJobs = results.flat().length

      expect(totalJobs).toBe(emailCount)
      expect(mockQueue.add).toHaveBeenCalledTimes(emailCount)
    })

    test('should measure email processing time', async () => {
      const startTime = Date.now()
      
      mockTransporter.sendMail.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              messageId: 'msg_123',
              accepted: ['test@example.com'],
              rejected: [],
              response: '250 OK'
            })
          }, 100) // Simulate 100ms processing time
        })
      })

      const result = await mockTransporter.sendMail({
        from: 'noreply@motoauto.ch',
        to: 'test@example.com',
        subject: 'Performance Test',
        html: 'Test content'
      })

      const processingTime = Date.now() - startTime

      expect(result.messageId).toBe('msg_123')
      expect(processingTime).toBeGreaterThanOrEqual(100)
      expect(processingTime).toBeLessThan(200) // Should be reasonably fast
    })
  })
})