import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

type Listing = Database['public']['Tables']['listings']['Row'];
type Bid = Database['public']['Tables']['bids']['Row'];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
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

    const bids: Bid[] = await db`
      SELECT * FROM bids 
      WHERE listing_id = ${auction.id} 
      ORDER BY amount DESC, placed_at ASC 
      LIMIT 2
    `;

    if (bids.length < 2) {
      return new NextResponse("Second bidder not found", { status: 404 });
    }

    const secondBidderId = bids[1].user_id;

    // In a real implementation, you would create a private message thread
    // or send an email to the second bidder.
    // For now, we'll just log it.
    console.log(`Contacting second bidder ${secondBidderId} for auction ${auctionId}`);

    // Update the auction status to reflect that a deal is being negotiated
    await db`
        UPDATE listings 
        SET status = 'ENDED_NEGOTIATING'
        WHERE id = ${auction.id}
    `;


    return NextResponse.json({ ok: true, message: "Contacting second bidder." });
  } catch (error) {
    console.error("Error contacting second bidder:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}