import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendAuctionEndedWinnerEmail, sendAuctionEndedSellerEmail, sendAuctionLostNotifications } from "@/lib/email";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type Listing = Database['public']['Tables']['listings']['Row'];
type Bid = Database['public']['Tables']['bids']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const auctionId = params.id;

  try {
    const [auction]: Listing[] = await db`
      SELECT * FROM listings 
      WHERE id = ${auctionId} AND status = 'ENDED_RESERVE_NOT_MET'
    `;

    if (!auction || auction.user_id !== user.id) {
      return new NextResponse("Auction not found or not owned by user", {
        status: 404,
      });
    }

    const [winningBid]: Bid[] = await db`
      SELECT * FROM bids 
      WHERE listing_id = ${auction.id} 
      ORDER BY amount DESC, placed_at ASC 
      LIMIT 1
    `;

    if (winningBid) {
      const winnerId = winningBid.user_id;

      await db`
        UPDATE listings 
        SET status = 'ENDED_SUCCESS' 
        WHERE id = ${auction.id}
      `;

      const [winner]: Profile[] = await db`SELECT * FROM profiles WHERE id = ${winnerId}`;
      const [seller]: Profile[] = await db`SELECT * FROM profiles WHERE id = ${auction.user_id}`;

      if (winner && seller) {
        await sendAuctionEndedWinnerEmail(winner, seller, auction);
        await sendAuctionEndedSellerEmail(seller, winner, auction);
      }

      const transaction: TransactionInsert = {
        listing_id: auction.id,
        seller_id: auction.user_id,
        buyer_id: winnerId,
        amount: auction.current_bid,
        currency: auction.currency || 'CHF',
        status: 'completed',
      };
      await db`INSERT INTO transactions ${db(transaction)}`;

      // Notify losing bidders
      await sendAuctionLostNotifications(auction.id, winnerId);
    }

    return NextResponse.json({ ok: true, message: "Offer accepted." });
  } catch (error) {
    console.error("Error accepting offer:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}