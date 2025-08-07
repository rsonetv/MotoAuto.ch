import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
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
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const validation = reviewSchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(JSON.stringify(validation.error), { status: 400 });
  }

  const { rating, comment } = validation.data;
  const paymentId = params.id;
  const reviewerId = session.user.id;

  try {
    // 1. Verify the transaction (payment) exists and the user is part of it
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, seller_id, buyer_id')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    const isSeller = payment.seller_id === reviewerId;
    const isBuyer = payment.buyer_id === reviewerId;

    if (!isSeller && !isBuyer) {
      return new NextResponse('You are not a participant in this transaction', {
        status: 403,
      });
    }

    const reviewedId = isSeller ? payment.buyer_id : payment.seller_id;
    
    if (!reviewedId) {
        return new NextResponse('Reviewed user not found', { status: 404 });
    }

    // 2. Check if the user has already reviewed this transaction
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('payment_id', paymentId)
      .eq('reviewer_id', reviewerId)
      .single();

    if (existingReview) {
      return new NextResponse('You have already reviewed this transaction', {
        status: 409,
      });
    }

    // 3. Insert the new review
    const { error: insertError } = await supabase.from('reviews').insert({
      payment_id: paymentId,
      reviewer_id: reviewerId,
      reviewed_id: reviewedId,
      rating,
      comment,
    });

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return new NextResponse('Failed to submit review', { status: 500 });
    }

    // The trigger will handle updating the reputation score and badges

    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error in review submission:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}