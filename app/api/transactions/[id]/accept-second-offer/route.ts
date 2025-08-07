import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const transactionId = params.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Step 1: Get the original transaction (payment)
  const { data: originalPayment, error: paymentError } = await supabase
    .from('payments')
    .select('listing_id, status')
    .eq('id', transactionId)
    .single();

  if (paymentError || !originalPayment) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  if (originalPayment.status !== 'cancelled_no_payment') {
    return NextResponse.json({ error: 'Offer is not valid' }, { status: 400 });
  }

  // Step 2: Find the second highest bid for the auction
  const { data: bids, error: bidsError } = await supabase
    .from('bids')
    .select('user_id, amount')
    .eq('listing_id', originalPayment.listing_id)
    .order('amount', { ascending: false })
    .limit(2);

  if (bidsError || bids.length < 2) {
    return NextResponse.json({ error: 'Could not find a second bidder' }, { status: 404 });
  }

  const secondBidder = bids[1];

  if (secondBidder.user_id !== user.id) {
    return NextResponse.json({ error: 'You are not the second bidder' }, { status: 403 });
  }

  // Step 3: Create a new payment for the second bidder
  const { data: newPayment, error: newPaymentError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      listing_id: originalPayment.listing_id,
      amount: secondBidder.amount,
      type: 'commission',
      status: 'pending',
      payment_deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    })
    .select()
    .single();

  if (newPaymentError) {
    console.error('Error creating new payment:', newPaymentError);
    return NextResponse.json({ error: 'Failed to create new payment' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Offer accepted. Please proceed to payment.', payment: newPayment });
}