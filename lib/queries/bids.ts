import { db } from "@/lib/db"
import type { 
  Bid, 
  BidInsert, 
  BidUpdate, 
  Listing, 
  Auction, 
  Profile,
  BidWithDetails 
} from "@/lib/database.types"
import { BidStatus } from "@/lib/database.types"
import { calculateMinBidIncrement } from "@/lib/schemas/bids-api-schema"

// Place a new bid with comprehensive validation and auction updates
export async function placeBid(bidData: {
  listing_id: string
  auction_id: string
  user_id: string
  amount: number
  is_auto_bid?: boolean
  max_auto_bid?: number | null
  ip_address?: string | null
  user_agent?: string | null
}): Promise<{
  bid: Bid
  auction_updated: {
    current_bid: number
    bid_count: number
    next_min_bid: number
    auction_extended: boolean
    new_end_time?: string
  }
  outbid_notifications: Array<{
    user_id: string
    previous_bid_amount: number
  }>
}> {
  return await db.begin(async (tx: any) => {
    const now = new Date()
    
    const [validationResult] = await tx`
      WITH auction_data AS (
        SELECT 
          l.id as listing_id,
          l.current_bid,
          l.bid_count,
          l.min_bid_increment,
          l.auction_end_time,
          l.auto_extend_minutes,
          l.user_id as seller_id,
          l.status as listing_status,
          a.id as auction_id,
          a.extended_count,
          a.max_extensions,
          a.reserve_price,
          a.reserve_met,
          CASE WHEN EXISTS(
            SELECT 1 FROM bids 
            WHERE listing_id = l.id 
              AND user_id = ${bidData.user_id} 
              AND amount = ${bidData.amount}
              AND status != ${BidStatus.RETRACTED}
          ) THEN true ELSE false END as has_duplicate_bid
        FROM listings l
        JOIN auctions a ON l.id = a.listing_id
        WHERE l.id = ${bidData.listing_id} 
          AND a.id = ${bidData.auction_id}
          AND l.is_auction = true
      )
      SELECT * FROM auction_data
      FOR UPDATE
    `

    if (!validationResult) {
      throw new Error("Auction not found or not active")
    }

    // Validate auction state
    const endTime = new Date(validationResult.auction_end_time)
    
    if (validationResult.listing_status !== 'active') {
      throw new Error("Auction is not active")
    }
    
    if (endTime <= now) {
      throw new Error("Auction has ended")
    }

    if (validationResult.seller_id === bidData.user_id) {
      throw new Error("Cannot bid on your own auction")
    }

    if (validationResult.has_duplicate_bid) {
      throw new Error("You have already placed a bid for this amount")
    }

    // Validate bid amount meets minimum increment
    const minIncrement = validationResult.min_bid_increment || calculateMinBidIncrement(validationResult.current_bid)
    const nextMinBid = validationResult.current_bid + minIncrement
    
    if (bidData.amount < nextMinBid) {
      throw new Error(`Bid must be at least ${nextMinBid.toFixed(2)} CHF`)
    }

    const outbidUsers = await tx`
      UPDATE bids 
      SET status = ${BidStatus.OUTBID}
      WHERE listing_id = ${bidData.listing_id}
        AND status IN (${BidStatus.WINNING}, ${BidStatus.ACTIVE})
        AND user_id != ${bidData.user_id}
      RETURNING user_id, amount as previous_bid_amount
    `

    // Check if auction should be extended (bid placed in last 5 minutes)
    const timeUntilEnd = endTime.getTime() - now.getTime()
    const fiveMinutes = 5 * 60 * 1000
    const shouldExtend = timeUntilEnd <= fiveMinutes && 
                        validationResult.extended_count < validationResult.max_extensions

    let newEndTime: string | undefined
    let extendedCount = validationResult.extended_count

    if (shouldExtend) {
      const extensionMinutes = validationResult.auto_extend_minutes || 5
      newEndTime = new Date(endTime.getTime() + extensionMinutes * 60 * 1000).toISOString()
      extendedCount += 1
    }

    // Check if reserve price is met
    const reserveMet = !validationResult.reserve_price || bidData.amount >= validationResult.reserve_price
    const newBidCount = validationResult.bid_count + 1

    const [newBid] = await tx`
      WITH new_bid AS (
        INSERT INTO bids (
          listing_id,
          auction_id,
          user_id,
          amount,
          is_auto_bid,
          max_auto_bid,
          auto_bid_active,
          status,
          ip_address,
          user_agent,
          placed_at
        ) VALUES (
          ${bidData.listing_id},
          ${bidData.auction_id},
          ${bidData.user_id},
          ${bidData.amount},
          ${bidData.is_auto_bid || false},
          ${bidData.max_auto_bid},
          ${bidData.is_auto_bid || false},
          ${BidStatus.WINNING},
          ${bidData.ip_address},
          ${bidData.user_agent},
          ${now.toISOString()}
        )
        RETURNING *
      ),
      listing_update AS (
        UPDATE listings 
        SET 
          current_bid = ${bidData.amount},
          bid_count = ${newBidCount}
          ${shouldExtend ? tx`, auction_end_time = ${newEndTime}` : tx``}
        WHERE id = ${bidData.listing_id}
        RETURNING current_bid, bid_count
      ),
      auction_update AS (
        UPDATE auctions 
        SET 
          reserve_met = ${reserveMet},
          total_bids = ${newBidCount}
          ${shouldExtend ? tx`, extended_count = ${extendedCount}` : tx``}
        WHERE id = ${bidData.auction_id}
        RETURNING *
      )
      SELECT * FROM new_bid
    `

    return {
      bid: newBid,
      auction_updated: {
        current_bid: bidData.amount,
        bid_count: newBidCount,
        next_min_bid: bidData.amount + minIncrement,
        auction_extended: shouldExtend,
        new_end_time: newEndTime
      },
      outbid_notifications: outbidUsers.map((user: any) => ({
        user_id: user.user_id,
        previous_bid_amount: user.previous_bid_amount
      }))
    }
  })
}

// Get bid history for a specific auction
export async function getAuctionBids(
  auctionId: string,
  options: {
    page?: number
    limit?: number
    include_retracted?: boolean
    sort_order?: 'asc' | 'desc'
  } = {}
): Promise<{
  data: BidWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}> {
  const { page = 1, limit = 50, include_retracted = false, sort_order = 'desc' } = options
  const offset = (page - 1) * limit

  // Build status filter
  const statusFilter = include_retracted 
    ? db`` 
    : db`AND b.status != ${BidStatus.RETRACTED}`

  // Get total count
  const [{ count }] = await db`
    SELECT COUNT(*) as count
    FROM bids b
    WHERE b.auction_id = ${auctionId}
    ${statusFilter}
  `

  const total = parseInt(count)
  const totalPages = Math.ceil(total / limit)

  // Get bids with user details
  const bids = await db`
    SELECT 
      b.*,
      p.full_name,
      p.avatar_url,
      p.is_dealer,
      p.dealer_name,
      p.rating,
      p.rating_count,
      l.id as listing_id,
      l.title,
      l.brand,
      l.model,
      l.year,
      l.images,
      l.auction_end_time,
      l.current_bid,
      l.bid_count,
      l.min_bid_increment,
      l.reserve_price,
      l.status as listing_status,
      l.location,
      l.postal_code,
      l.canton
    FROM bids b
    JOIN profiles p ON b.user_id = p.id
    JOIN listings l ON b.listing_id = l.id
    WHERE b.auction_id = ${auctionId}
    ${statusFilter}
    ORDER BY b.placed_at ${sort_order === 'desc' ? db`DESC` : db`ASC`}
    LIMIT ${limit}
    OFFSET ${offset}
  `

  return {
    data: bids as unknown as BidWithDetails[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// Get user's bidding history
export async function getUserBids(
  userId: string,
  options: {
    page?: number
    limit?: number
    status?: string
    auction_status?: 'active' | 'ended' | 'all'
    include_auto_bids?: boolean
    sort_by?: 'placed_at' | 'amount' | 'auction_end_time'
    sort_order?: 'asc' | 'desc'
  } = {}
): Promise<{
  data: BidWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}> {
  const { 
    page = 1, 
    limit = 20, 
    status,
    auction_status = 'all',
    include_auto_bids = true,
    sort_by = 'placed_at',
    sort_order = 'desc'
  } = options
  const offset = (page - 1) * limit

  // Build filters
  let filters = db`WHERE b.user_id = ${userId}`
  
  if (status) {
    filters = db`${filters} AND b.status = ${status}`
  }
  
  if (!include_auto_bids) {
    filters = db`${filters} AND b.is_auto_bid = false`
  }
  
  if (auction_status === 'active') {
    filters = db`${filters} AND l.auction_end_time > NOW() AND l.status = 'active'`
  } else if (auction_status === 'ended') {
    filters = db`${filters} AND (l.auction_end_time <= NOW() OR l.status != 'active')`
  }

  // Build sort clause
  let sortClause
  switch (sort_by) {
    case 'amount':
      sortClause = db`ORDER BY b.amount ${sort_order === 'desc' ? db`DESC` : db`ASC`}`
      break
    case 'auction_end_time':
      sortClause = db`ORDER BY l.auction_end_time ${sort_order === 'desc' ? db`DESC` : db`ASC`}`
      break
    default:
      sortClause = db`ORDER BY b.placed_at ${sort_order === 'desc' ? db`DESC` : db`ASC`}`
  }

  // Get total count
  const [{ count }] = await db`
    SELECT COUNT(*) as count
    FROM bids b
    JOIN listings l ON b.listing_id = l.id
    ${filters}
  `

  const total = parseInt(count)
  const totalPages = Math.ceil(total / limit)

  // Get bids with listing details
  const bids = await db`
    SELECT 
      b.*,
      l.id as listing_id,
      l.title,
      l.description,
      l.brand,
      l.model,
      l.year,
      l.images,
      l.auction_end_time,
      l.current_bid,
      l.bid_count,
      l.min_bid_increment,
      l.reserve_price,
      l.status as listing_status,
      l.location,
      l.postal_code,
      l.canton
    FROM bids b
    JOIN listings l ON b.listing_id = l.id
    ${filters}
    ${sortClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `

  return {
    data: bids as unknown as BidWithDetails[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// Get specific bid details
export async function getBidById(bidId: string, userId?: string): Promise<BidWithDetails | null> {
  const bids = await db`
    SELECT 
      b.*,
      p.full_name,
      p.avatar_url,
      p.is_dealer,
      p.dealer_name,
      p.rating,
      p.rating_count,
      l.id as listing_id,
      l.title,
      l.description,
      l.brand,
      l.model,
      l.year,
      l.images,
      l.auction_end_time,
      l.current_bid,
      l.bid_count,
      l.min_bid_increment,
      l.reserve_price,
      l.status as listing_status,
      l.location,
      l.postal_code,
      l.canton,
      l.user_id as seller_id
    FROM bids b
    JOIN profiles p ON b.user_id = p.id
    JOIN listings l ON b.listing_id = l.id
    WHERE b.id = ${bidId}
    ${userId ? db`AND (b.user_id = ${userId} OR l.user_id = ${userId})` : db``}
  `

  return bids[0] as BidWithDetails || null
}

// Retract a bid
export async function retractBid(
  bidId: string, 
  userId: string, 
  reason?: string
): Promise<{
  success: boolean
  bid_id: string
  retracted_at: string
  reason?: string
  auction_updated: {
    current_bid: number
    bid_count: number
    new_winning_bidder?: string
  }
}> {
  return await db.begin(async (tx: any) => {
    // Get bid details with lock
    const [bid] = await tx`
      SELECT 
        b.*,
        l.auction_end_time,
        l.current_bid,
        l.bid_count
      FROM bids b
      JOIN listings l ON b.listing_id = l.id
      WHERE b.id = ${bidId} 
        AND b.user_id = ${userId}
        AND b.status != ${BidStatus.RETRACTED}
      FOR UPDATE
    `

    if (!bid) {
      throw new Error("Bid not found or already retracted")
    }

    // Check if retraction is allowed (within 5 minutes and auction still active)
    const now = new Date()
    const bidTime = new Date(bid.placed_at)
    const endTime = new Date(bid.auction_end_time)
    const timeSinceBid = now.getTime() - bidTime.getTime()
    const fiveMinutes = 5 * 60 * 1000

    if (endTime <= now) {
      throw new Error("Cannot retract bids after auction has ended")
    }

    if (timeSinceBid > fiveMinutes) {
      throw new Error("Bids can only be retracted within 5 minutes of placement")
    }

    if (bid.status === BidStatus.WON) {
      throw new Error("Cannot retract winning bids")
    }

    // Mark bid as retracted
    await tx`
      UPDATE bids 
      SET 
        status = ${BidStatus.RETRACTED},
        updated_at = ${now.toISOString()}
      WHERE id = ${bidId}
    `

    // Find new highest bid if this was the winning bid
    let newCurrentBid = 0
    let newWinningBidder: string | undefined

    if (bid.status === BidStatus.WINNING) {
      const [highestBid] = await tx`
        SELECT user_id, amount
        FROM bids 
        WHERE listing_id = ${bid.listing_id}
          AND status != ${BidStatus.RETRACTED}
          AND id != ${bidId}
        ORDER BY amount DESC, placed_at ASC
        LIMIT 1
      `

      if (highestBid) {
        newCurrentBid = highestBid.amount
        newWinningBidder = highestBid.user_id

        // Update the new winning bid status
        await tx`
          UPDATE bids 
          SET status = ${BidStatus.WINNING}
          WHERE listing_id = ${bid.listing_id}
            AND user_id = ${highestBid.user_id}
            AND amount = ${highestBid.amount}
            AND status != ${BidStatus.RETRACTED}
        `
      }

      // Update listing current bid
      await tx`
        UPDATE listings 
        SET current_bid = ${newCurrentBid}
        WHERE id = ${bid.listing_id}
      `
    }

    return {
      success: true,
      bid_id: bidId,
      retracted_at: now.toISOString(),
      reason,
      auction_updated: {
        current_bid: bid.status === BidStatus.WINNING ? newCurrentBid : bid.current_bid,
        bid_count: bid.bid_count,
        new_winning_bidder: newWinningBidder
      }
    }
  })
}

// Set up auto-bidding
export async function setupAutoBid(data: {
  listing_id: string
  auction_id: string
  user_id: string
  max_amount: number
  initial_bid?: number
}): Promise<Bid> {
  return await db.begin(async (tx: any) => {
    // Check if user already has an active auto-bid for this auction
    const [existingAutoBid] = await tx`
      SELECT id FROM bids 
      WHERE listing_id = ${data.listing_id}
        AND user_id = ${data.user_id}
        AND is_auto_bid = true
        AND auto_bid_active = true
        AND status != ${BidStatus.RETRACTED}
    `

    if (existingAutoBid) {
      throw new Error("You already have an active auto-bid for this auction")
    }

    // Get current auction state
    const [auctionData] = await tx`
      SELECT 
        l.current_bid,
        l.min_bid_increment,
        l.auction_end_time,
        l.status,
        l.user_id as seller_id
      FROM listings l
      WHERE l.id = ${data.listing_id}
        AND l.is_auction = true
    `

    if (!auctionData) {
      throw new Error("Auction not found")
    }

    if (auctionData.seller_id === data.user_id) {
      throw new Error("Cannot set up auto-bid on your own auction")
    }

    if (auctionData.status !== 'active') {
      throw new Error("Auction is not active")
    }

    const now = new Date()
    const endTime = new Date(auctionData.auction_end_time)
    
    if (endTime <= now) {
      throw new Error("Auction has ended")
    }

    // Determine initial bid amount
    const minIncrement = auctionData.min_bid_increment || calculateMinBidIncrement(auctionData.current_bid)
    const nextMinBid = auctionData.current_bid + minIncrement
    const initialBidAmount = data.initial_bid || nextMinBid

    if (initialBidAmount > data.max_amount) {
      throw new Error("Initial bid amount cannot exceed maximum auto-bid amount")
    }

    if (initialBidAmount < nextMinBid) {
      throw new Error(`Initial bid must be at least ${nextMinBid.toFixed(2)} CHF`)
    }

    // Create auto-bid record
    const [autoBid] = await tx`
      INSERT INTO bids (
        listing_id,
        auction_id,
        user_id,
        amount,
        is_auto_bid,
        max_auto_bid,
        auto_bid_active,
        status,
        placed_at
      ) VALUES (
        ${data.listing_id},
        ${data.auction_id},
        ${data.user_id},
        ${initialBidAmount},
        true,
        ${data.max_amount},
        true,
        ${BidStatus.ACTIVE},
        ${now.toISOString()}
      )
      RETURNING *
    `

    return autoBid
  })
}

// Cancel auto-bidding
export async function cancelAutoBid(
  auctionId: string, 
  userId: string
): Promise<{ success: boolean; cancelled_at: string }> {
  const now = new Date()
  
  const result = await db`
    UPDATE bids 
    SET 
      auto_bid_active = false,
      updated_at = ${now.toISOString()}
    WHERE auction_id = ${auctionId}
      AND user_id = ${userId}
      AND is_auto_bid = true
      AND auto_bid_active = true
      AND status != ${BidStatus.RETRACTED}
    RETURNING id
  `

  if (result.length === 0) {
    throw new Error("No active auto-bid found for this auction")
  }

  return {
    success: true,
    cancelled_at: now.toISOString()
  }
}

// Get user's recent bids for rate limiting
export async function getUserRecentBids(
  userId: string, 
  minutesBack: number = 1
): Promise<Array<{ placed_at: string }>> {
  const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000)
  
  return await db`
    SELECT placed_at
    FROM bids 
    WHERE user_id = ${userId}
      AND placed_at > ${timeThreshold.toISOString()}
    ORDER BY placed_at DESC
  `
}

// Process auto-bids when a new bid is placed
export async function processAutoBids(
  listingId: string,
  currentHighestBid: number,
  excludeUserId: string
): Promise<void> {
  // Get all active auto-bids for this listing
  const autoBids = await db`
    SELECT 
      b.id,
      b.user_id,
      b.max_auto_bid,
      b.amount as current_bid_amount,
      l.min_bid_increment,
      l.current_bid
    FROM bids b
    JOIN listings l ON b.listing_id = l.id
    WHERE b.listing_id = ${listingId}
      AND b.is_auto_bid = true
      AND b.auto_bid_active = true
      AND b.status != ${BidStatus.RETRACTED}
      AND b.user_id != ${excludeUserId}
      AND b.max_auto_bid > ${currentHighestBid}
    ORDER BY b.max_auto_bid DESC, b.placed_at ASC
  `

  // Process auto-bids in order of maximum bid amount
  for (const autoBid of autoBids) {
    const minIncrement = autoBid.min_bid_increment || calculateMinBidIncrement(currentHighestBid)
    const nextBidAmount = currentHighestBid + minIncrement

    if (nextBidAmount <= autoBid.max_auto_bid) {
      // Place automatic bid
      await placeBid({
        listing_id: listingId,
        auction_id: autoBid.auction_id,
        user_id: autoBid.user_id,
        amount: nextBidAmount,
        is_auto_bid: true,
        max_auto_bid: autoBid.max_auto_bid
      })

      // Update current highest bid for next iteration
      currentHighestBid = nextBidAmount
    }
  }
}
