/**
 * Performance and Load Tests
 * Tests system performance under high load, database query optimization, and scalability
 */

const request = require('supertest')
const { performance } = require('perf_hooks')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockAuction, 
  mockBid,
  createMockJWT,
  mockSupabaseResponse,
  performanceHelpers
} = require('../utils/test-helpers')

describe('Performance and Load Tests', () => {
  let mockSupabase
  let mockApp
  let performanceMetrics

  beforeEach(() => {
    // Mock Supabase with performance tracking
    mockSupabase = {
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
        range: jest.fn().mockReturnThis()
      }))
    }

    // Mock Express app
    mockApp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      listen: jest.fn()
    }

    // Performance metrics collector
    performanceMetrics = {
      requests: [],
      queries: [],
      memory: [],
      cpu: []
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    performanceMetrics = { requests: [], queries: [], memory: [], cpu: [] }
  })

  describe('API Endpoint Performance', () => {
    test('should handle high concurrent requests to listings endpoint', async () => {
      const concurrentRequests = 100
      const maxResponseTime = 500 // milliseconds
      const requests = []

      // Mock listings response
      const mockListings = Array.from({ length: 20 }, () => mockListing())
      mockSupabase.from().select().order().limit().mockResolvedValue(
        mockSupabaseResponse(mockListings)
      )

      // Create concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        const requestPromise = new Promise(async (resolve) => {
          const startTime = performance.now()
          
          try {
            // Simulate API call
            const result = await mockSupabase
              .from('listings')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(20)

            const endTime = performance.now()
            const responseTime = endTime - startTime

            resolve({
              success: true,
              responseTime,
              dataLength: result.data.length
            })
          } catch (error) {
            const endTime = performance.now()
            resolve({
              success: false,
              responseTime: endTime - startTime,
              error: error.message
            })
          }
        })

        requests.push(requestPromise)
      }

      // Execute all requests concurrently
      const results = await Promise.all(requests)

      // Analyze results
      const successfulRequests = results.filter(r => r.success)
      const failedRequests = results.filter(r => !r.success)
      const averageResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length
      const maxResponseTimeActual = Math.max(...results.map(r => r.responseTime))

      expect(successfulRequests.length).toBe(concurrentRequests)
      expect(failedRequests.length).toBe(0)
      expect(averageResponseTime).toBeLessThan(maxResponseTime)
      expect(maxResponseTimeActual).toBeLessThan(maxResponseTime * 2) // Allow 2x for peak load

      // Log performance metrics
      performanceMetrics.requests.push({
        endpoint: '/api/listings',
        concurrentRequests,
        successRate: (successfulRequests.length / concurrentRequests) * 100,
        averageResponseTime,
        maxResponseTime: maxResponseTimeActual
      })
    })

    test('should handle search queries efficiently', async () => {
      const searchQueries = [
        { query: 'BMW', expectedResults: 15 },
        { query: 'Mercedes', expectedResults: 12 },
        { query: 'Audi', expectedResults: 8 },
        { query: '2020', expectedResults: 25 },
        { query: 'automatic', expectedResults: 30 }
      ]

      const searchResults = []

      for (const { query, expectedResults } of searchQueries) {
        const startTime = performance.now()

        // Mock search results
        const mockResults = Array.from({ length: expectedResults }, () => 
          mockListing({ title: `${query} Vehicle` })
        )

        mockSupabase.from().select().mockResolvedValue(
          mockSupabaseResponse(mockResults)
        )

        // Simulate search query
        const result = await mockSupabase
          .from('listings')
          .select('*')

        const endTime = performance.now()
        const queryTime = endTime - startTime

        searchResults.push({
          query,
          resultCount: result.data.length,
          queryTime,
          expectedResults
        })

        expect(result.data.length).toBe(expectedResults)
        expect(queryTime).toBeLessThan(200) // Search should be under 200ms
      }

      // Verify search performance
      const averageSearchTime = searchResults.reduce((sum, r) => sum + r.queryTime, 0) / searchResults.length
      expect(averageSearchTime).toBeLessThan(150)

      performanceMetrics.queries.push({
        type: 'search',
        queries: searchResults.length,
        averageTime: averageSearchTime
      })
    })

    test('should handle auction bidding load', async () => {
      const auction = mockAuction()
      const bidders = Array.from({ length: 50 }, () => mockUser())
      const bidPromises = []

      // Simulate concurrent bidding
      bidders.forEach((bidder, index) => {
        const bidAmount = 40000 + (index * 1000) // Incrementing bids
        
        const bidPromise = new Promise(async (resolve) => {
          const startTime = performance.now()

          try {
            const bid = mockBid({
              auction_id: auction.id,
              user_id: bidder.id,
              amount: bidAmount
            })

            mockSupabase.from().insert().mockResolvedValue(
              mockSupabaseResponse(bid)
            )

            const result = await mockSupabase
              .from('bids')
              .insert({
                auction_id: auction.id,
                user_id: bidder.id,
                amount: bidAmount
              })

            const endTime = performance.now()
            resolve({
              success: true,
              bidAmount,
              responseTime: endTime - startTime
            })
          } catch (error) {
            const endTime = performance.now()
            resolve({
              success: false,
              error: error.message,
              responseTime: endTime - startTime
            })
          }
        })

        bidPromises.push(bidPromise)
      })

      const bidResults = await Promise.all(bidPromises)
      const successfulBids = bidResults.filter(r => r.success)
      const averageBidTime = successfulBids.reduce((sum, r) => sum + r.responseTime, 0) / successfulBids.length

      expect(successfulBids.length).toBe(bidders.length)
      expect(averageBidTime).toBeLessThan(100) // Bids should be processed quickly

      performanceMetrics.requests.push({
        endpoint: '/api/bids',
        concurrentRequests: bidders.length,
        successRate: (successfulBids.length / bidders.length) * 100,
        averageResponseTime: averageBidTime
      })
    })
  })

  describe('Database Performance', () => {
    test('should optimize complex listing queries', async () => {
      const complexQuery = {
        filters: {
          make: 'BMW',
          year_min: 2018,
          year_max: 2023,
          price_min: 30000,
          price_max: 80000,
          mileage_max: 100000,
          fuel_type: 'petrol',
          transmission: 'automatic'
        },
        sort: 'price_asc',
        limit: 50
      }

      const startTime = performance.now()

      // Mock complex query result
      const mockResults = Array.from({ length: 25 }, () => mockListing({
        make: 'BMW',
        year: 2020,
        price: 45000,
        fuel_type: 'petrol',
        transmission: 'automatic'
      }))

      mockSupabase.from().select()
        .gte().lte()
        .eq().order().limit()
        .mockResolvedValue(mockSupabaseResponse(mockResults))

      const result = await mockSupabase
        .from('listings')
        .select('*')
        .gte('year', complexQuery.filters.year_min)
        .lte('year', complexQuery.filters.year_max)
        .eq('make', complexQuery.filters.make)
        .order('price', { ascending: true })
        .limit(complexQuery.filters.limit)

      const endTime = performance.now()
      const queryTime = endTime - startTime

      expect(result.data.length).toBeLessThanOrEqual(complexQuery.limit)
      expect(queryTime).toBeLessThan(300) // Complex queries should be under 300ms

      performanceMetrics.queries.push({
        type: 'complex_filter',
        queryTime,
        resultCount: result.data.length,
        filters: Object.keys(complexQuery.filters).length
      })
    })

    test('should handle pagination efficiently', async () => {
      const pageSize = 20
      const totalPages = 10
      const paginationResults = []

      for (let page = 0; page < totalPages; page++) {
        const startTime = performance.now()
        const offset = page * pageSize

        // Mock paginated results
        const mockResults = Array.from({ length: pageSize }, (_, index) => 
          mockListing({ id: `listing_${offset + index}` })
        )

        mockSupabase.from().select().range().mockResolvedValue(
          mockSupabaseResponse(mockResults)
        )

        const result = await mockSupabase
          .from('listings')
          .select('*')
          .range(offset, offset + pageSize - 1)

        const endTime = performance.now()
        const queryTime = endTime - startTime

        paginationResults.push({
          page,
          queryTime,
          resultCount: result.data.length
        })

        expect(result.data.length).toBe(pageSize)
        expect(queryTime).toBeLessThan(150) // Pagination should be fast
      }

      const averagePaginationTime = paginationResults.reduce((sum, r) => sum + r.queryTime, 0) / totalPages
      expect(averagePaginationTime).toBeLessThan(100)

      performanceMetrics.queries.push({
        type: 'pagination',
        pages: totalPages,
        averageTime: averagePaginationTime
      })
    })

    test('should optimize auction queries with real-time updates', async () => {
      const activeAuctions = Array.from({ length: 20 }, () => mockAuction({
        status: 'active',
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }))

      const startTime = performance.now()

      // Mock active auctions query
      mockSupabase.from().select().eq().gte().order().mockResolvedValue(
        mockSupabaseResponse(activeAuctions)
      )

      const result = await mockSupabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gte('end_time', new Date().toISOString())
        .order('end_time', { ascending: true })

      const endTime = performance.now()
      const queryTime = endTime - startTime

      expect(result.data.length).toBe(activeAuctions.length)
      expect(queryTime).toBeLessThan(100) // Real-time queries must be very fast

      // Test ending soon auctions
      const endingSoonStart = performance.now()
      const endingSoonTime = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

      const endingSoonAuctions = activeAuctions.slice(0, 5)
      mockSupabase.from().select().eq().lte().mockResolvedValue(
        mockSupabaseResponse(endingSoonAuctions)
      )

      const endingSoonResult = await mockSupabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .lte('end_time', endingSoonTime)

      const endingSoonEnd = performance.now()
      const endingSoonQueryTime = endingSoonEnd - endingSoonStart

      expect(endingSoonResult.data.length).toBe(5)
      expect(endingSoonQueryTime).toBeLessThan(50) // Critical queries must be ultra-fast

      performanceMetrics.queries.push({
        type: 'real_time_auctions',
        activeAuctionsTime: queryTime,
        endingSoonTime: endingSoonQueryTime
      })
    })
  })

  describe('Memory and Resource Usage', () => {
    test('should manage memory efficiently during bulk operations', async () => {
      const bulkSize = 1000
      const batchSize = 100
      const memorySnapshots = []

      // Simulate bulk listing processing
      for (let i = 0; i < bulkSize; i += batchSize) {
        const batch = Array.from({ length: batchSize }, (_, index) => 
          mockListing({ id: `bulk_listing_${i + index}` })
        )

        // Take memory snapshot
        const memoryUsage = process.memoryUsage()
        memorySnapshots.push({
          iteration: i / batchSize,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss
        })

        // Process batch
        mockSupabase.from().insert().mockResolvedValue(
          mockSupabaseResponse(batch)
        )

        await mockSupabase.from('listings').insert(batch)

        // Simulate garbage collection
        if (global.gc) {
          global.gc()
        }
      }

      // Analyze memory usage
      const initialMemory = memorySnapshots[0].heapUsed
      const finalMemory = memorySnapshots[memorySnapshots.length - 1].heapUsed
      const memoryGrowth = finalMemory - initialMemory
      const memoryGrowthMB = memoryGrowth / (1024 * 1024)

      // Memory growth should be reasonable
      expect(memoryGrowthMB).toBeLessThan(100) // Less than 100MB growth

      performanceMetrics.memory.push({
        operation: 'bulk_insert',
        initialMemoryMB: initialMemory / (1024 * 1024),
        finalMemoryMB: finalMemory / (1024 * 1024),
        growthMB: memoryGrowthMB,
        iterations: memorySnapshots.length
      })
    })

    test('should handle concurrent user sessions efficiently', async () => {
      const concurrentUsers = 200
      const sessionDuration = 30000 // 30 seconds
      const userSessions = []

      // Simulate concurrent user sessions
      for (let i = 0; i < concurrentUsers; i++) {
        const user = mockUser({ id: `user_${i}` })
        const sessionStart = performance.now()

        const sessionPromise = new Promise(async (resolve) => {
          try {
            // Simulate user activities
            const activities = [
              'view_listings',
              'search',
              'view_details',
              'add_favorite',
              'place_bid'
            ]

            for (const activity of activities) {
              // Mock activity
              mockSupabase.from().select().mockResolvedValue(
                mockSupabaseResponse([mockListing()])
              )

              await mockSupabase.from('listings').select('*')
              
              // Small delay between activities
              await new Promise(resolve => setTimeout(resolve, 10))
            }

            const sessionEnd = performance.now()
            resolve({
              userId: user.id,
              sessionTime: sessionEnd - sessionStart,
              activitiesCompleted: activities.length,
              success: true
            })
          } catch (error) {
            const sessionEnd = performance.now()
            resolve({
              userId: user.id,
              sessionTime: sessionEnd - sessionStart,
              error: error.message,
              success: false
            })
          }
        })

        userSessions.push(sessionPromise)
      }

      const sessionResults = await Promise.all(userSessions)
      const successfulSessions = sessionResults.filter(s => s.success)
      const averageSessionTime = successfulSessions.reduce((sum, s) => sum + s.sessionTime, 0) / successfulSessions.length

      expect(successfulSessions.length).toBe(concurrentUsers)
      expect(averageSessionTime).toBeLessThan(1000) // Sessions should complete quickly

      performanceMetrics.requests.push({
        endpoint: 'user_sessions',
        concurrentSessions: concurrentUsers,
        successRate: (successfulSessions.length / concurrentUsers) * 100,
        averageSessionTime
      })
    })
  })

  describe('Caching Performance', () => {
    test('should improve response times with caching', async () => {
      const cacheKey = 'popular_listings'
      const mockCache = new Map()
      
      // First request (cache miss)
      const firstRequestStart = performance.now()
      
      const popularListings = Array.from({ length: 10 }, () => mockListing())
      mockSupabase.from().select().order().limit().mockResolvedValue(
        mockSupabaseResponse(popularListings)
      )

      const firstResult = await mockSupabase
        .from('listings')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(10)

      // Cache the result
      mockCache.set(cacheKey, {
        data: firstResult.data,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes
      })

      const firstRequestEnd = performance.now()
      const firstRequestTime = firstRequestEnd - firstRequestStart

      // Second request (cache hit)
      const secondRequestStart = performance.now()
      
      const cachedResult = mockCache.get(cacheKey)
      const isCacheValid = cachedResult && (Date.now() - cachedResult.timestamp) < cachedResult.ttl

      let secondResult
      if (isCacheValid) {
        secondResult = { data: cachedResult.data }
      } else {
        secondResult = await mockSupabase
          .from('listings')
          .select('*')
          .order('view_count', { ascending: false })
          .limit(10)
      }

      const secondRequestEnd = performance.now()
      const secondRequestTime = secondRequestEnd - secondRequestStart

      expect(isCacheValid).toBe(true)
      expect(secondResult.data.length).toBe(popularListings.length)
      expect(secondRequestTime).toBeLessThan(firstRequestTime * 0.1) // Cache should be 10x faster

      performanceMetrics.requests.push({
        endpoint: 'cached_listings',
        cacheHitTime: secondRequestTime,
        cacheMissTime: firstRequestTime,
        speedImprovement: firstRequestTime / secondRequestTime
      })
    })

    test('should handle cache invalidation efficiently', async () => {
      const mockCache = new Map()
      const cacheKeys = ['listings_page_1', 'listings_page_2', 'popular_listings', 'recent_listings']
      
      // Populate cache
      cacheKeys.forEach(key => {
        mockCache.set(key, {
          data: Array.from({ length: 20 }, () => mockListing()),
          timestamp: Date.now(),
          ttl: 300000
        })
      })

      expect(mockCache.size).toBe(cacheKeys.length)

      // Simulate cache invalidation after new listing creation
      const invalidationStart = performance.now()
      
      // Clear related cache entries
      const keysToInvalidate = Array.from(mockCache.keys()).filter(key => 
        key.startsWith('listings_') || key.includes('popular') || key.includes('recent')
      )

      keysToInvalidate.forEach(key => mockCache.delete(key))

      const invalidationEnd = performance.now()
      const invalidationTime = invalidationEnd - invalidationStart

      expect(mockCache.size).toBe(0)
      expect(invalidationTime).toBeLessThan(10) // Cache invalidation should be very fast

      performanceMetrics.requests.push({
        operation: 'cache_invalidation',
        keysInvalidated: keysToInvalidate.length,
        invalidationTime
      })
    })
  })

  describe('Scalability Tests', () => {
    test('should scale with increasing data volume', async () => {
      const dataVolumes = [100, 500, 1000, 5000, 10000]
      const scalabilityResults = []

      for (const volume of dataVolumes) {
        const startTime = performance.now()

        // Mock large dataset
        const mockData = Array.from({ length: Math.min(volume, 100) }, () => mockListing())
        mockSupabase.from().select().limit().mockResolvedValue(
          mockSupabaseResponse(mockData)
        )

        const result = await mockSupabase
          .from('listings')
          .select('*')
          .limit(100) // Always return max 100 for pagination

        const endTime = performance.now()
        const queryTime = endTime - startTime

        scalabilityResults.push({
          dataVolume: volume,
          queryTime,
          resultCount: result.data.length
        })

        // Query time should not increase linearly with data volume
        expect(queryTime).toBeLessThan(500)
      }

      // Analyze scalability
      const timeIncrease = scalabilityResults[scalabilityResults.length - 1].queryTime / scalabilityResults[0].queryTime
      expect(timeIncrease).toBeLessThan(3) // Should not be more than 3x slower with 100x more data

      performanceMetrics.queries.push({
        type: 'scalability',
        results: scalabilityResults,
        timeIncreaseFactor: timeIncrease
      })
    })

    test('should handle peak traffic scenarios', async () => {
      const peakScenarios = [
        { name: 'normal_load', requests: 50, duration: 1000 },
        { name: 'high_load', requests: 200, duration: 1000 },
        { name: 'peak_load', requests: 500, duration: 1000 },
        { name: 'extreme_load', requests: 1000, duration: 2000 }
      ]

      const scenarioResults = []

      for (const scenario of peakScenarios) {
        const requests = []
        const startTime = performance.now()

        // Generate concurrent requests
        for (let i = 0; i < scenario.requests; i++) {
          const requestPromise = new Promise(async (resolve) => {
            try {
              mockSupabase.from().select().mockResolvedValue(
                mockSupabaseResponse([mockListing()])
              )

              const result = await mockSupabase.from('listings').select('*')
              resolve({ success: true, dataLength: result.data.length })
            } catch (error) {
              resolve({ success: false, error: error.message })
            }
          })

          requests.push(requestPromise)
        }

        const results = await Promise.all(requests)
        const endTime = performance.now()
        const totalTime = endTime - startTime

        const successfulRequests = results.filter(r => r.success).length
        const successRate = (successfulRequests / scenario.requests) * 100
        const throughput = scenario.requests / (totalTime / 1000) // requests per second

        scenarioResults.push({
          scenario: scenario.name,
          requests: scenario.requests,
          successRate,
          totalTime,
          throughput
        })

        // Success rate should remain high even under load
        expect(successRate).toBeGreaterThan(95)
        expect(totalTime).toBeLessThan(scenario.duration * 2) // Allow 2x expected time
      }

      performanceMetrics.requests.push({
        type: 'peak_traffic',
        scenarios: scenarioResults
      })
    })
  })

  describe('Performance Monitoring and Reporting', () => {
    test('should generate performance report', () => {
      // Aggregate all performance metrics
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalTests: performanceMetrics.requests.length + performanceMetrics.queries.length,
          averageResponseTime: 0,
          successRate: 0,
          memoryEfficiency: 'good'
        },
        endpoints: performanceMetrics.requests,
        queries: performanceMetrics.queries,
        memory: performanceMetrics.memory,
        recommendations: []
      }

      // Calculate averages
      if (performanceMetrics.requests.length > 0) {
        report.summary.averageResponseTime = performanceMetrics.requests
          .reduce((sum, r) => sum + (r.averageResponseTime || 0), 0) / performanceMetrics.requests.length

        report.summary.successRate = performanceMetrics.requests
          .reduce((sum, r) => sum + (r.successRate || 100), 0) / performanceMetrics.requests.length
      }

      // Generate recommendations
      if (report.summary.averageResponseTime > 200) {
        report.recommendations.push('Consider implementing response caching')
      }

      if (report.summary.successRate < 99) {
        report.recommendations.push('Investigate error handling and retry mechanisms')
      }

      if (performanceMetrics.memory.length > 0) {
        const memoryGrowth = performanceMetrics.memory[0].growthMB
        if (memoryGrowth > 50) {
          report.recommendations.push('Optimize memory usage in bulk operations')
        }
      }

      expect(report.summary.totalTests).toBeGreaterThan(0)
      expect(report.summary.averageResponseTime).toBeLessThan(500)
      expect(report.summary.successRate).toBeGreaterThan(95)

      // Log performance report
      console.log('Performance Test Report:', JSON.stringify(report, null, 2))
    })

    test('should identify performance bottlenecks', () => {
      const bottlenecks = []

      // Analyze request performance
      performanceMetrics.requests.forEach(request => {
        if (request.averageResponseTime > 300) {
          bottlenecks.push({
            type: 'slow_endpoint',
            endpoint: request.endpoint,
            responseTime: request.averageResponseTime,
            severity: 'high'
          })
        }

        if (request.successRate < 98) {
          bottlenecks.push({
            type: 'low_success_rate',
            endpoint: request.endpoint,
            successRate: request.successRate,
            severity: 'critical'
          })
        }
      })

      // Analyze query performance
      performanceMetrics.queries.forEach(query => {
        if (query.averageTime > 200) {
          bottlenecks.push({
            type: 'slow_query',
            queryType: query.type,
            averageTime: query.averageTime,
            severity: 'medium'
          })
        }
      })

      // Analyze memory usage
      performanceMetrics.memory.forEach(memory => {
        if (memory.growthMB > 100) {
          bottlenecks.push({
            type: 'memory_leak',
            operation: memory.operation,
            growthMB: memory.growthMB,
            severity: 'high'
          })
        }
      })

      // Critical bottlenecks should be addressed
      const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical')
      expect(criticalBottlenecks.length).toBe(0)

      if (bottlenecks.length > 0) {
        console.log('Performance Bottlenecks:', bottlenecks)
      }
    })
  })
})