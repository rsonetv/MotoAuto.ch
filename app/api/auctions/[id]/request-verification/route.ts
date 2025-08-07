import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auctionId = params.id;

  // First, check if the user is the owner of the auction
  const { data: auctionData, error: auctionError } = await supabase
    .from('auctions')
    .select('created_by')
    .eq('id', auctionId)
    .single();

  if (auctionError || !auctionData) {
    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  }

  if (auctionData.created_by !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Update the auction to set verification_requested to true
  const { error } = await supabase
    .from('auctions')
    .update({ verification_requested: true })
    .eq('id', auctionId);

  if (error) {
    console.error('Error updating auction for verification request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}