import { db } from "@/lib/db";
import { Listing } from "@/types/database.types";

export async function getUserWonAuctions(userId: string): Promise<(Listing & { payment_status: string })[]> {
  const wonAuctions = await db`
    SELECT l.*, p.status as payment_status
    FROM listings l
    JOIN bids b ON l.id = b.listing_id
    LEFT JOIN payments p ON p.listing_id = l.id AND p.user_id = b.user_id
    WHERE l.status = 'ENDED_SUCCESS'
      AND b.user_id = ${userId}
      AND b.amount = l.current_bid
  `;
  return wonAuctions;
}

export async function getUserSoldVehicles(userId: string): Promise<Listing[]> {
    const soldVehicles = await db`
      SELECT *
      FROM listings
      WHERE status = 'ENDED_SUCCESS'
        AND user_id = ${userId}
    `;
    return soldVehicles;
  }

export async function getSecondChanceOffers(userId: string) {
  const offers = await db`
    SELECT
      p.id as transaction_id,
      l.title,
      b.amount,
      l.currency
    FROM payments p
    JOIN listings l ON p.listing_id = l.id
    JOIN (
      SELECT
        listing_id,
        user_id,
        amount,
        ROW_NUMBER() OVER(PARTITION BY listing_id ORDER BY amount DESC) as rn
      FROM bids
    ) b ON l.id = b.listing_id
    WHERE p.status = 'cancelled_no_payment'
      AND b.rn = 2
      AND b.user_id = ${userId}
  `;
  return offers;
}