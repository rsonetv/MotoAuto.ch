import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendAuctionEndedWinnerEmail, sendAuctionEndedSellerEmail, sendAuctionReserveNotMetEmail } from "@/lib/email";
import { Listing, Bid, Profile, TransactionInsert } from "@/types/database.types";

export async function GET(req: NextRequest) {
  // This is a protected endpoint, so we need to check for a secret key
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // 1. Get all ended auctions that are still active
    const endedAuctions: Listing[] = await db`
      SELECT * FROM listings 
      WHERE auction_end_time <= ${now} AND status = 'active' AND is_auction = true
    `;

    for (const auction of endedAuctions) {
      // 2. Check if reserve price is met
      if (auction.current_bid >= (auction.reserve_price || 0)) {
        // 3. Find the winner
        const [winningBid]: Bid[] = await db`
          SELECT * FROM bids 
          WHERE listing_id = ${auction.id} 
          ORDER BY amount DESC, placed_at ASC 
          LIMIT 1
        `;

        if (winningBid) {
          const winnerId = winningBid.user_id;

          // 4. Update auction status
          await db`
            UPDATE listings 
            SET status = 'ENDED_SUCCESS' 
            WHERE id = ${auction.id}
          `;

          // 5. Get winner and seller profiles
          const [winner]: Profile[] = await db`SELECT * FROM profiles WHERE id = ${winnerId}`;
          const [seller]: Profile[] = await db`SELECT * FROM profiles WHERE id = ${auction.user_id}`;

          if (winner && seller) {
            // 6. Send emails
            await sendAuctionEndedWinnerEmail(winner, seller, auction);
            await sendAuctionEndedSellerEmail(seller, winner, auction);
          }

          // 7. Create transaction
          const transaction: TransactionInsert = {
            listing_id: auction.id,
            seller_id: auction.user_id,
            buyer_id: winnerId,
            amount: auction.current_bid,
            currency: auction.currency || 'CHF',
            status: 'completed',
          };
          await db`INSERT INTO transactions ${db(transaction)}`;
        } else {
            // No bids, mark as ended without success
            await db`
                UPDATE listings 
                SET status = 'ENDED_UNSOLD' 
                WHERE id = ${auction.id}
            `;
        }
     } else {
       // Reserve not met, but check for bids
       const [highestBid]: Bid[] = await db`
         SELECT * FROM bids
         WHERE listing_id = ${auction.id}
         ORDER BY amount DESC, placed_at ASC
         LIMIT 1
       `;

       if (highestBid) {
         // There was at least one bid
         const decisionDeadline = new Date();
         decisionDeadline.setHours(decisionDeadline.getHours() + 48);

         await db`
           UPDATE listings
           SET status = 'ENDED_RESERVE_NOT_MET',
               decision_deadline = ${decisionDeadline.toISOString()}
           WHERE id = ${auction.id}
         `;

         // Notify seller
         const [seller]: Profile[] = await db`SELECT * FROM profiles WHERE id = ${auction.user_id}`;
         if (seller) {
           await sendAuctionReserveNotMetEmail(seller.id, auction.id);
         }
       } else {
         // No bids, just mark as unsold
         await db`
           UPDATE listings
           SET status = 'ENDED_UNSOLD'
           WHERE id = ${auction.id}
         `;
       }
     }
    }

    return NextResponse.json({
      ok: true,
      message: `Processed ${endedAuctions.length} auctions.`,
    });
  } catch (error) {
    console.error("Error processing auctions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}