import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendNewQuestionNotification } from '@/lib/email/auction-notifications';

const questionSchema = z.object({
  question: z.string().min(10, 'Pytanie musi mieć co najmniej 10 znaków.'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auctionId = parseInt(params.id, 10);
  if (isNaN(auctionId)) {
    return NextResponse.json({ error: 'Invalid auction ID' }, { status: 400 });
  }

  const body = await request.json();
  const validation = questionSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Check if user is the auction owner
  const { data: auction, error: auctionError } = await supabase
    .from('auctions')
    .select('user_id')
    .eq('id', auctionId)
    .single();

  if (auctionError || !auction) {
    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  }

  if (auction.user_id === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot ask questions on your own auction.' },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('auction_questions')
    .insert({
      auction_id: auctionId,
      user_id: session.user.id,
      question: validation.data.question,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting question:', error);
    return NextResponse.json(
      { error: 'Failed to submit question.' },
      { status: 500 }
    );
  }

  // Send notification to seller
  try {
    await sendNewQuestionNotification(auctionId, data.id);
  } catch (emailError) {
    console.error('Failed to send new question notification email:', emailError);
    // Do not block the response for email failure
  }

  return NextResponse.json(data, { status: 201 });
}