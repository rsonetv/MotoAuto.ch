import { sendNotificationEmail } from './email-service'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { EmailTemplateVariables } from '@/lib/database/email.types'

/**
 * Send outbid notification to user
 */
export async function sendOutbidNotification(
  outbidUserId: string,
  auctionId: string,
  listingId: string,
  newBidAmount: number
): Promise<void> {
  try {
    // Get auction and listing details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    // Get current highest bid count
    const { count: bidCount } = await supabaseAdmin
      .from('bids')
      .select('*', { count: 'exact', head: true })
      .eq('auction_id', auctionId)

    // Prepare template variables
    const templateVariables: EmailTemplateVariables = {
      user: {
        id: outbidUserId,
        name: '', // Will be filled by email service
        email: '', // Will be filled by email service
        language: 'de' // Default, will be overridden by user preferences
      },
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        currentBid: newBidAmount,
        bidCount: bidCount || 0,
        endTime: auction.ended_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '', // Will be calculated by template engine
        isExtended: auction.extended_count > 0
      }
    }

    // Send notification
    await sendNotificationEmail(
      outbidUserId,
      'auction_outbid',
      templateVariables,
      { priority: 7 } // High priority for outbid notifications
    )

    console.log(`✅ Outbid notification sent to user ${outbidUserId} for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send outbid notification:', error)
  }
}

/**
 * Send auction ending soon notifications to all bidders and watchers
 */
export async function sendAuctionEndingSoonNotifications(
  auctionId: string,
  hoursRemaining: number = 24
): Promise<void> {
  try {
    // Get auction and listing details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id, current_bid
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    // Get all unique bidders for this auction
    const { data: bidders, error: biddersError } = await supabaseAdmin
      .from('bids')
      .select('user_id')
      .eq('auction_id', auctionId)
      .neq('user_id', listing.user_id) // Don't notify the seller

    if (biddersError) {
      console.error('Failed to get bidders:', biddersError)
      return
    }

    // Get unique user IDs
    const uniqueBidders = [...new Set(bidders?.map(b => b.user_id) || [])]

    // Get auction watchers (users who have this auction in their watchlist)
    // This would require a watchlist table - for now we'll just use bidders

    // Get current highest bidder
    const { data: highestBid } = await supabaseAdmin
      .from('bids')
      .select('user_id, amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1)
      .single()

    const highestBidderId = highestBid?.user_id

    // Prepare template variables
    const baseTemplateVariables: EmailTemplateVariables = {
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        currentBid: listing.current_bid,
        startingPrice: auction.starting_price,
        bidCount: auction.total_bids || 0,
        endTime: auction.ended_at || new Date(Date.now() + hoursRemaining * 60 * 60 * 1000).toISOString(),
        timeRemaining: `${hoursRemaining}h`,
        isExtended: auction.extended_count > 0,
        highestBidderId
      }
    }

    // Send notifications to all bidders
    const notificationPromises = uniqueBidders.map(async (userId) => {
      const templateVariables = {
        ...baseTemplateVariables,
        user: {
          id: userId,
          name: '', // Will be filled by email service
          email: '', // Will be filled by email service
          language: 'de' // Default, will be overridden by user preferences
        }
      }

      return sendNotificationEmail(
        userId,
        'auction_ending_soon',
        templateVariables,
        { priority: 6 } // High priority for ending soon notifications
      )
    })

    await Promise.all(notificationPromises)

    console.log(`✅ Auction ending soon notifications sent to ${uniqueBidders.length} users for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send auction ending soon notifications:', error)
  }
}

/**
 * Send auction won notification to winner
 */
export async function sendAuctionWonNotification(
  winnerId: string,
  auctionId: string
): Promise<void> {
  try {
    // Get auction and listing details with seller info
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id,
          profiles!listings_user_id_fkey (
            full_name, email, phone
          )
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    const seller = listing.profiles

    // Calculate commission (5% with max 500 CHF)
    const commissionRate = 0.05
    const maxCommission = 500
    const commissionAmount = Math.min(auction.winning_bid * commissionRate, maxCommission)

    // Prepare template variables
    const templateVariables: EmailTemplateVariables = {
      user: {
        id: winnerId,
        name: '', // Will be filled by email service
        email: '', // Will be filled by email service
        language: 'de' // Default, will be overridden by user preferences
      },
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        currentBid: auction.winning_bid || 0,
        bidCount: auction.total_bids || 0,
        endTime: auction.ended_at || new Date().toISOString(),
        timeRemaining: '0',
        isExtended: auction.extended_count > 0,
        winningBid: auction.winning_bid || 0,
        totalBids: auction.total_bids || 0,
        endedAt: auction.ended_at || new Date().toISOString()
      },
      payment: {
        id: '', // Will be generated when payment is created
        amount: commissionAmount,
        currency: listing.currency,
        description: 'Auction Commission',
        method: '',
        status: 'pending',
        commissionAmount,
        commissionRate: commissionRate * 100 // Convert to percentage
      },
      seller: {
        name: seller?.full_name || 'Verkäufer',
        email: seller?.email || '',
        phone: seller?.phone || '',
        iban: '' // Would need to be stored in profile
      },
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment?auction=${auctionId}&type=commission`
    }

    // Send notification
    await sendNotificationEmail(
      winnerId,
      'auction_won',
      templateVariables,
      { priority: 9 } // Highest priority for won notifications
    )

    console.log(`✅ Auction won notification sent to user ${winnerId} for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send auction won notification:', error)
  }
}

/**
 * Send auction lost notifications to all losing bidders
 */
export async function sendAuctionLostNotifications(
  auctionId: string,
  winnerId: string
): Promise<void> {
  try {
    // Get auction and listing details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    // Get all losing bidders (exclude winner and seller)
    const { data: losingBidders, error: biddersError } = await supabaseAdmin
      .from('bids')
      .select('user_id, amount')
      .eq('auction_id', auctionId)
      .neq('user_id', winnerId)
      .neq('user_id', listing.user_id)

    if (biddersError) {
      console.error('Failed to get losing bidders:', biddersError)
      return
    }

    // Get unique losing bidders with their highest bid
    const uniqueLosingBidders = losingBidders?.reduce((acc, bid) => {
      const existing = acc.find(b => b.user_id === bid.user_id)
      if (!existing || bid.amount > existing.amount) {
        return [...acc.filter(b => b.user_id !== bid.user_id), bid]
      }
      return acc
    }, [] as typeof losingBidders) || []

    // Prepare base template variables
    const baseTemplateVariables = {
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        currentBid: auction.winning_bid || 0,
        bidCount: auction.total_bids || 0,
        endTime: auction.ended_at || new Date().toISOString(),
        timeRemaining: '0',
        isExtended: auction.extended_count > 0,
        winningBid: auction.winning_bid || 0,
        totalBids: auction.total_bids || 0,
        endedAt: auction.ended_at || new Date().toISOString()
      },
      searchUrl: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje?brand=${encodeURIComponent(listing.brand)}&model=${encodeURIComponent(listing.model)}`,
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motoauto.ch'
    }

    // Send notifications to all losing bidders
    const notificationPromises = uniqueLosingBidders.map(async (bidder) => {
      const templateVariables: EmailTemplateVariables = {
        ...baseTemplateVariables,
        user: {
          id: bidder.user_id,
          name: '', // Will be filled by email service
          email: '', // Will be filled by email service
          language: 'de' // Default, will be overridden by user preferences
        },
        userBid: {
          amount: bidder.amount
        }
      }

      return sendNotificationEmail(
        bidder.user_id,
        'auction_lost',
        templateVariables,
        { priority: 5 } // Medium priority for lost notifications
      )
    })

    await Promise.all(notificationPromises)

    console.log(`✅ Auction lost notifications sent to ${uniqueLosingBidders.length} users for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send auction lost notifications:', error)
  }
}

/**
 * Send auction extended notification to all bidders
 */
export async function sendAuctionExtendedNotification(
  auctionId: string,
  newEndTime: string
): Promise<void> {
  try {
    // Get auction and listing details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id, current_bid
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    // Get all bidders for this auction
    const { data: bidders, error: biddersError } = await supabaseAdmin
      .from('bids')
      .select('user_id')
      .eq('auction_id', auctionId)
      .neq('user_id', listing.user_id) // Don't notify the seller

    if (biddersError) {
      console.error('Failed to get bidders:', biddersError)
      return
    }

    const uniqueBidders = [...new Set(bidders?.map(b => b.user_id) || [])]

    // Get current highest bidder
    const { data: highestBid } = await supabaseAdmin
      .from('bids')
      .select('user_id')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1)
      .single()

    const highestBidderId = highestBid?.user_id

    // Prepare template variables
    const baseTemplateVariables: EmailTemplateVariables = {
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        currentBid: listing.current_bid,
        bidCount: auction.total_bids || 0,
        endTime: newEndTime,
        timeRemaining: '', // Will be calculated by template engine
        isExtended: true,
        newEndTime,
        extensionCount: auction.extended_count + 1,
        maxExtensions: auction.max_extensions || 3,
        highestBidderId
      }
    }

    // Send notifications to all bidders
    const notificationPromises = uniqueBidders.map(async (userId) => {
      const templateVariables = {
        ...baseTemplateVariables,
        user: {
          id: userId,
          name: '', // Will be filled by email service
          email: '', // Will be filled by email service
          language: 'de' // Default, will be overridden by user preferences
        }
      }

      return sendNotificationEmail(
        userId,
        'auction_extended',
        templateVariables,
        { priority: 7 } // High priority for extension notifications
      )
    })

    await Promise.all(notificationPromises)

    console.log(`✅ Auction extended notifications sent to ${uniqueBidders.length} users for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send auction extended notifications:', error)
  }
}

/**
 * Helper function to schedule auction ending notifications
 * This should be called by a cron job or scheduled task
 */
export async function scheduleAuctionEndingNotifications(): Promise<void> {
  try {
    // Find auctions ending in 24 hours
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const dayAfter = new Date(Date.now() + 25 * 60 * 60 * 1000)

    const { data: endingSoonAuctions, error } = await supabaseAdmin
      .from('auctions')
      .select('id, ended_at')
      .is('ended_at', null) // Only active auctions
      .gte('ended_at', tomorrow.toISOString())
      .lt('ended_at', dayAfter.toISOString())

    if (error) {
      console.error('Failed to get ending soon auctions:', error)
      return
    }

    // Send notifications for each auction
    const notificationPromises = endingSoonAuctions?.map(auction => 
      sendAuctionEndingSoonNotifications(auction.id, 24)
    ) || []

    await Promise.all(notificationPromises)

    console.log(`✅ Scheduled ending notifications for ${endingSoonAuctions?.length || 0} auctions`)

  } catch (error) {
    console.error('Failed to schedule auction ending notifications:', error)
  }
}

/**
 * Send new question notification to the seller
 */
export async function sendNewQuestionNotification(
  auctionId: number,
  questionId: number
): Promise<void> {
  try {
    // Get auction, listing, and question details
    const { data: question, error: questionError } = await supabaseAdmin
      .from('auction_questions')
      .select(`
        *,
        auctions (
          id,
          user_id,
          listings (
            id, title, brand, model, year, currency, images
          )
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Failed to get question details:', questionError);
      return;
    }

    const auction = question.auctions;
    if (!auction) {
      console.error('No auction found for question:', questionId);
      return;
    }

    const listing = auction.listings;
    if (!listing) {
      console.error('No listing found for auction:', auction.id);
      return;
    }
    
    const questioner = question.profiles;

    // Prepare template variables
    const templateVariables: EmailTemplateVariables = {
      user: {
        id: auction.user_id, // Seller's ID
        name: '', // Will be filled by email service
        email: '', // Will be filled by email service
        language: 'de' // Default, will be overridden
      },
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auction.id.toString(),
      },
      question: {
        id: question.id,
        text: question.question,
        author: questioner?.full_name || 'Użytkownik',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}#question-${question.id}`
      }
    };

    // Send notification
    await sendNotificationEmail(
      auction.user_id,
      'new_question_posted',
      templateVariables,
      { priority: 6 }
    );

    console.log(`✅ New question notification sent to seller ${auction.user_id} for auction ${auction.id}`);

  } catch (error) {
    console.error('Failed to send new question notification:', error);
  }
}

/**
 * Send notification to user when their question is answered
 */
export async function sendQuestionAnsweredNotification(
  questionId: number
): Promise<void> {
  try {
    // Get question, answer, and user details
    const { data: question, error: questionError } = await supabaseAdmin
      .from('auction_questions')
      .select(`
        *,
        auctions (
          id,
          listings (
            id, title, brand, model, year, currency, images
          )
        )
      `)
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Failed to get question details for answer notification:', questionError);
      return;
    }

    const auction = question.auctions;
    if (!auction) {
      console.error('No auction found for question:', questionId);
      return;
    }

    const listing = auction.listings;
    if (!listing) {
      console.error('No listing found for auction:', auction.id);
      return;
    }

    // Prepare template variables
    const templateVariables: EmailTemplateVariables = {
      user: {
        id: question.user_id, // Questioner's ID
        name: '', // Will be filled by email service
        email: '', // Will be filled by email service
        language: 'de' // Default, will be overridden
      },
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auction.id.toString(),
      },
      question: {
        id: question.id,
        text: question.question,
        answer: question.answer || '',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}#question-${question.id}`
      }
    };

    // Send notification
    await sendNotificationEmail(
      question.user_id,
      'question_answered',
      templateVariables,
      { priority: 6 }
    );

    console.log(`✅ Question answered notification sent to user ${question.user_id} for question ${question.id}`);

  } catch (error) {
    console.error('Failed to send question answered notification:', error);
  }
}
/**
 * Send notification to seller when auction ends with reserve not met
 */
export async function sendAuctionReserveNotMetEmail(
  sellerId: string,
  auctionId: string
): Promise<void> {
  try {
    // Get auction and listing details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id, current_bid, reserve_price
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    // Prepare template variables
    const templateVariables: EmailTemplateVariables = {
      user: {
        id: sellerId,
        name: '', // Will be filled by email service
        email: '', // Will be filled by email service
        language: 'de' // Default, will be overridden by user preferences
      },
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        currentBid: listing.current_bid || 0,
        reservePrice: listing.reserve_price || 0,
        decisionDeadline: auction.decision_deadline || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      },
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings`
    }

    // Send notification
    await sendNotificationEmail(
      sellerId,
      'auction_reserve_not_met',
      templateVariables,
      { priority: 8 } // High priority for decision required
    )

    console.log(`✅ Reserve not met notification sent to seller ${sellerId} for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send reserve not met notification:', error)
  }
}
/**
 * Send notification to bidders when an auction is relisted
 */
export async function sendAuctionRelistedEmail(
  auctionId: string
): Promise<void> {
  try {
    // Get auction and listing details
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from('auctions')
      .select(`
        *,
        listings (
          id, title, brand, model, year, mileage, currency,
          fuel_type, images, user_id
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      console.error('Failed to get auction details:', auctionError)
      return
    }

    const listing = auction.listings
    if (!listing) {
      console.error('No listing found for auction:', auctionId)
      return
    }

    // Get all unique bidders for this auction
    const { data: bidders, error: biddersError } = await supabaseAdmin
      .from('bids')
      .select('user_id')
      .eq('auction_id', auctionId)
      .neq('user_id', listing.user_id) // Don't notify the seller

    if (biddersError) {
      console.error('Failed to get bidders:', biddersError)
      return
    }

    const uniqueBidders = [...new Set(bidders?.map(b => b.user_id) || [])]

    // Prepare base template variables
    const baseTemplateVariables = {
      listing: {
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year || 0,
        mileage: listing.mileage || 0,
        currency: listing.currency,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/aukcje/${listing.id}`,
        images: listing.images || []
      },
      auction: {
        id: auctionId,
        endTime: auction.ended_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motoauto.ch'
    }

    // Send notifications to all bidders
    const notificationPromises = uniqueBidders.map(async (userId) => {
      const templateVariables: EmailTemplateVariables = {
        ...baseTemplateVariables,
        user: {
          id: userId,
          name: '', // Will be filled by email service
          email: '', // Will be filled by email service
          language: 'de' // Default, will be overridden by user preferences
        }
      }

      return sendNotificationEmail(
        userId,
        'auction_relisted',
        templateVariables,
        { priority: 5 }
      )
    })

    await Promise.all(notificationPromises)

    console.log(`✅ Auction relisted notifications sent to ${uniqueBidders.length} users for auction ${auctionId}`)

  } catch (error) {
    console.error('Failed to send auction relisted notifications:', error)
  }
}