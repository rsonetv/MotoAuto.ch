import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getSession } from '@/lib/actions/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('watchers')
    .select('auction_id, auctions (*)')
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }

  const watchlist = data.map((item) => item.auctions);

  return NextResponse.json(watchlist);
}