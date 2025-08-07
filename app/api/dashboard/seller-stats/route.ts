import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getSession } from '@/lib/actions/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: auctions, error } = await supabase
    .from('auctions')
    .select(`
      id,
      title,
      view_count,
      end_time,
      bids ( count ),
      questions ( count ),
      prices ( price )
    `)
    .eq('user_id', session.user.id)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json({ error: 'Failed to fetch seller stats' }, { status: 500 });
  }

  const stats = auctions.map(auction => ({
    auction_id: auction.id,
    title: auction.title,
    view_count: auction.view_count,
    bid_count: auction.bids[0]?.count || 0,
    question_count: auction.questions[0]?.count || 0,
    current_bid: auction.prices[0]?.price || 0,
    end_time: auction.end_time
  }));

  return NextResponse.json(stats);
}