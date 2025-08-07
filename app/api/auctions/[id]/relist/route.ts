import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendAuctionRelistedEmail } from "@/lib/email/auction-notifications";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

type Listing = Database['public']['Tables']['listings']['Row'];

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

    const newAuctionEndTime = new Date();
    newAuctionEndTime.setDate(newAuctionEndTime.getDate() + 7); // Relist for 7 days

    await db`
      UPDATE listings 
      SET status = 'active',
          auction_end_time = ${newAuctionEndTime.toISOString()},
          decision_deadline = NULL
      WHERE id = ${auction.id}
    `;

    await sendAuctionRelistedEmail(auction.id);

    return NextResponse.json({ ok: true, message: "Auction relisted." });
  } catch (error) {
    console.error("Error relisting auction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}