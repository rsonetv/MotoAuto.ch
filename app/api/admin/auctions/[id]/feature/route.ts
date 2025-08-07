import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: auctionId } = params;

  if (!auctionId) {
    return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('listings')
    .update({ is_featured: true })
    .eq('id', auctionId)
    .select()
    .single();

  if (error) {
    console.error('Error featuring auction:', error);
    return NextResponse.json({ error: 'Failed to feature auction' }, { status: 500 });
  }

  return NextResponse.json(data);
}