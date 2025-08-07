import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { withAuth, validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware"
import { getWebSocketServer } from "@/lib/websocket/server"
import { placeBidSchema, validateSwissUser, checkBidRateLimit, calculateMinBidIncrement, BidStatus } from "@/lib/schemas/bids-api-schema"
import type { PlaceBid } from "@/lib/schemas/bids-api-schema"

/**
 * POST /api/bids - Place a new bid on an auction
 * 
 * Features:
 * - Comprehensive bid validation (amount, increment, auction status)
 * - Swiss market compliance (user verification, CHF currency)
 * - Auto-bidding support with maximum bid limits
 * - Auction extension logic for last-minute bids
 * - Rate limiting and fraud prevention
import { sendOutbidNotification } from "@/lib/email/auction-notifications";
 * - Real-time notification preparation
 * - Automatic outbid handling and proxy bidding
 */
async function handleProxyBidding(supabase: any, listingId: string, auctionId: string, newBidderId: string, newBidAmount: number) {
  let currentBid = newBidAmount;
  let winningBidderId = newBidderId;
  let outbidUserId: string | null = null;


  while (true) {
    const { data: otherProxyBids, error: proxyError } = await supabase
      .from('bids')
      .select('id, user_id, max_bid')
      .eq('listing_id', listingId)
      .eq('is_auto_bid', true)
      .eq('auto_bid_active', true)
      .neq('user_id', winningBidderId)
      .gt('max_bid', currentBid)
      .order('max_bid', { ascending: false })
      .order('placed_at', { ascending: true });

    if (proxyError || !otherProxyBids || otherProxyBids.length === 0) {
      break; // No competing proxy bids
    }

    const competingProxy = otherProxyBids[0];
    const minIncrement = calculateMinBidIncrement(currentBid);
    const autoBidAmount = currentBid + minIncrement;

    outbidUserId = winningBidderId;

    if (autoBidAmount > competingProxy.max_bid) {
      // Competing proxy is outbid, but we need to place one more bid from them at their max
      const finalAutoBidAmount = competingProxy.max_bid;
      await supabase.from('bids').insert({
        listing_id: listingId,
        auction_id: auctionId,
        user_id: competingProxy.user_id,
        amount: finalAutoBidAmount,
        is_auto_bid: true,
        status: BidStatus.WINNING,
      });
      currentBid = finalAutoBidAmount;
      winningBidderId = competingProxy.user_id;
      
      if (outbidUserId) {
        await sendOutbidNotification(outbidUserId, auctionId, listingId, currentBid);
      }
      // Now the original new bidder might need to bid again if their proxy allows
      continue;
    }

    // Place auto bid for the competing proxy
    await supabase.from('bids').insert({
      listing_id: listingId,
      auction_id: auctionId,
      user_id: competingProxy.user_id,
      amount: autoBidAmount,
      is_auto_bid: true,
      status: BidStatus.WINNING,
    });

    await supabase.from('bids').update({ status: BidStatus.OUTBID }).eq('listing_id', listingId).neq('user_id', competingProxy.user_id);

    currentBid = autoBidAmount;
    winningBidderId = competingProxy.user_id;

    if (outbidUserId) {
      await sendOutbidNotification(outbidUserId, auctionId, listingId, currentBid);
    }

    // Check if the initial bidder's proxy can counter-bid
    const { data: initialBidderProxy } = await supabase
      .from('bids')
      .select('max_bid')
      .eq('listing_id', listingId)
      .eq('user_id', newBidderId)
      .eq('is_auto_bid', true)
      .single();

    if (initialBidderProxy && initialBidderProxy.max_bid > currentBid) {
      const counterBidAmount = currentBid + calculateMinBidIncrement(currentBid);
      if (counterBidAmount <= initialBidderProxy.max_bid) {
        outbidUserId = winningBidderId;
        await supabase.from('bids').insert({
          listing_id: listingId,
          auction_id: auctionId,
          user_id: newBidderId,
          amount: counterBidAmount,
          is_auto_bid: true,
          status: BidStatus.WINNING,
        });
        await supabase.from('bids').update({ status: BidStatus.OUTBID }).eq('listing_id', listingId).neq('user_id', newBidderId);
        currentBid = counterBidAmount;
        winningBidderId = newBidderId;
        if (outbidUserId) {
          await sendOutbidNotification(outbidUserId, auctionId, listingId, currentBid);
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Final update of the listing
  await supabase
    .from('listings')
    .update({ current_bid: currentBid })
    .eq('id', listingId);
}


export async function POST(request: NextRequest) {
  return withAuth(request, async (request, { user, profile }) => {
    try {
      const body = await request.json();
      const validation = validateRequestBody(body, placeBidSchema);
      if (!validation.success) {
        return createErrorResponse(validation.error, 400);
      }

      const bidData = validation.data as PlaceBid;
      const supabase = await createServerComponentClient();

      const userValidation = validateSwissUser(profile);
      if (!userValidation.valid) {
        return createErrorResponse(userValidation.error!, 403);
      }

      // Rate limiting logic...
      const { data: recentBids } = await supabase
        .from('bids')
        .select('placed_at')
        .eq('user_id', user.id)
        .gte('placed_at', new Date(Date.now() - 60 * 1000).toISOString());
      
      if (recentBids && recentBids.length >= 5) {
        return createErrorResponse("Rate limit exceeded.", 429);
      }

      const { data: auctionData, error: auctionError } = await supabase
        .from('listings')
        .select(`
          id, current_bid, bid_count, min_bid_increment, auction_end_time,
          auto_extend_minutes, user_id, status,
          auctions!inner(id, extended_count, max_extensions, reserve_price, reserve_met)
        `)
        .eq('id', bidData.listing_id)
        .eq('is_auction', true)
        .single();

      if (auctionError || !auctionData) {
        return createErrorResponse('Auction not found or not active', 404);
      }

      const now = new Date();
      const endTime = new Date(auctionData.auction_end_time);

      if (auctionData.status !== 'active' || endTime <= now) {
        return createErrorResponse('Auction is not active or has ended', 400);
      }

      if (auctionData.user_id === user.id) {
        return createErrorResponse('Cannot bid on your own auction', 403);
      }

      const minIncrement = auctionData.min_bid_increment || calculateMinBidIncrement(auctionData.current_bid);
      const nextMinBid = auctionData.current_bid + minIncrement;

      if (bidData.amount < nextMinBid) {
        return createErrorResponse(`Bid must be at least ${nextMinBid.toFixed(2)} CHF`, 400);
      }

      // Insert the initial manual bid
      const { data: newBid, error: bidError } = await supabase
        .from('bids')
        .insert({
          listing_id: bidData.listing_id,
          auction_id: bidData.auction_id,
          user_id: user.id,
          amount: bidData.amount,
          is_auto_bid: bidData.is_auto_bid || false,
          max_bid: bidData.max_bid,
          auto_bid_active: bidData.is_auto_bid || false,
          status: BidStatus.WINNING,
          placed_at: now.toISOString()
        })
        .select()
        .single();

      if (bidError || !newBid) {
        return createErrorResponse('Failed to place bid', 500);
      }

      // Award "Aktywny Licytant" badge
      const { data: userBidsCount, error: countError } = await supabase
        .from('bids')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!countError && userBidsCount && userBidsCount >= 20) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('badges')
          .eq('id', user.id)
          .single();

        if (profileData && !profileData.badges.includes('Aktywny Licytant')) {
          const updatedBadges = [...profileData.badges, 'Aktywny Licytant'];
          await supabase
            .from('profiles')
            .update({ badges: updatedBadges })
            .eq('id', user.id);
        }
      }
      
      await supabase
        .from('bids')
        .update({ status: BidStatus.OUTBID })
        .eq('listing_id', bidData.listing_id)
        .neq('id', newBid.id);


      await handleProxyBidding(supabase, bidData.listing_id, bidData.auction_id, user.id, bidData.amount);

      // Suspicious activity detection
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: userBids, error: userBidsError } = await supabase
        .from('bids')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('listing_id', bidData.listing_id)
        .gte('placed_at', fiveMinutesAgo);

      if (userBidsError) {
        console.error('Error checking for suspicious activity:', userBidsError);
      } else if (userBids && userBids.length > 5) {
        await supabase
          .from('listings')
          .update({ suspicious_activity_detected: true })
          .eq('id', bidData.listing_id);
      }

      // Anti-sniping: Extend auction if bid is in the last minute
      const auctionInfo = Array.isArray(auctionData.auctions) ? auctionData.auctions[0] : auctionData.auctions;
      if (auctionInfo) {
        const now = new Date();
        const endTime = new Date(auctionData.auction_end_time);
        
        const timeLeft = endTime.getTime() - now.getTime();
        const maxExtensions = auctionInfo.max_extensions ?? 10;
        let extendedCount = auctionInfo.extended_count ?? 0;

        // Check if the bid was placed in the last 60 seconds of the original end time
        if (timeLeft > 0 && timeLeft < 60000 && extendedCount < maxExtensions) {
          const newEndTime = new Date(endTime.getTime() + 3 * 60 * 1000); // Extend by 3 minutes

          const { error: updateError } = await supabase
            .from('listings')
            .update({ auction_end_time: newEndTime.toISOString() })
            .eq('id', bidData.listing_id);

          if (!updateError) {
            extendedCount++;
            await supabase
              .from('auctions')
              .update({ extended_count: extendedCount })
              .eq('id', auctionInfo.id);
            
            // Update in-memory data for subsequent operations if any
            auctionData.auction_end_time = newEndTime.toISOString();

            const wsServer = getWebSocketServer();
            if (wsServer) {
              wsServer.broadcastAuctionExtended(bidData.auction_id, {
                newEndTime: newEndTime.toISOString(),
                extensionMinutes: 3,
                extensionCount: extendedCount,
                reason: 'Last-minute bid'
              });
            }
          } else {
            console.error('Failed to extend auction time:', updateError);
          }
        }
      }

      // Fetch the final state of the auction
      const { data: finalAuctionData } = await supabase
        .from('listings')
        .select('current_bid, bid_count')
        .eq('id', bidData.listing_id)
        .single();

      // Broadcast WebSocket event, etc.
      const wsServer = getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastBidPlaced(bidData.auction_id, {
          id: newBid.id,
          amount: finalAuctionData!.current_bid,
          userId: user.id,
          userName: profile.full_name || 'Anonymous',
          isAutomatic: newBid.is_auto_bid,
          timestamp: newBid.placed_at,
          newCurrentBid: finalAuctionData!.current_bid,
          newBidCount: finalAuctionData!.bid_count,
          nextMinBid: finalAuctionData!.current_bid + minIncrement
        });
      }

      return createSuccessResponse({ success: true, bid: newBid }, 201);

    } catch (error: any) {
      console.error('Bid placement error:', error);
      return createErrorResponse('Failed to place bid. Please try again.', 500, { details: error.message });
    }
  });
}