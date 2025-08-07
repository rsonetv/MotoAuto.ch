import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  // Step 1: Find overdue payments
  const { data: overduePayments, error: overdueError } = await supabase
    .from('payments')
    .select('id, user_id, listing_id')
    .eq('status', 'pending')
    .lt('payment_deadline', new Date().toISOString());

  if (overdueError) {
    console.error('Error fetching overdue payments:', overdueError);
    return NextResponse.json({ error: 'Failed to fetch overdue payments' }, { status: 500 });
  }

  if (!overduePayments || overduePayments.length === 0) {
    return NextResponse.json({ message: 'No overdue payments to process.' });
  }

  for (const payment of overduePayments) {
    // Step 2: Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'cancelled_no_payment' })
      .eq('id', payment.id);

    if (updateError) {
      console.error(`Error updating payment ${payment.id}:`, updateError);
      continue; // Move to the next payment
    }

    // Step 3: Apply penalty
    const { error: penaltyError } = await supabase
      .from('user_penalties')
      .insert({
        user_id: payment.user_id,
        payment_id: payment.id,
        reason: 'Payment not received by deadline.',
        points_deducted: 10, // Example penalty
      });

    if (penaltyError) {
      console.error(`Error applying penalty for user ${payment.user_id}:`, penaltyError);
    }

    // Step 4: Decrement reputation score
    const { error: reputationError } = await supabase.rpc('decrement_reputation', {
      user_id_param: payment.user_id,
      decrement_value: 10,
    });

    if (reputationError) {
      console.error(`Error updating reputation for user ${payment.user_id}:`, reputationError);
    }

    // Step 5: Offer to second bidder
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('user_id, amount')
      .eq('listing_id', payment.listing_id)
      .order('amount', { ascending: false })
      .limit(2);

    if (bidsError || bids.length < 2) {
      console.error(`Could not find a second bidder for listing ${payment.listing_id}`);
      continue;
    }

    const secondBidder = bids[1];

    // Here you would typically send an email notification
    console.log(`Sending second chance offer to user ${secondBidder.user_id} for listing ${payment.listing_id}`);
    
    // This part will be fully implemented with the email service later.
    // For now, we'll just log it.
  }

  return NextResponse.json({ message: 'Overdue payments processed successfully.' });
}