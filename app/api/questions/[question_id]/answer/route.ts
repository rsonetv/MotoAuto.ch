import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendQuestionAnsweredNotification } from '@/lib/email/auction-notifications';

const answerSchema = z.object({
  answer: z.string().min(1, 'Odpowiedź nie może być pusta.'),
});

export async function POST(
  request: Request,
  { params }: { params: { question_id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const questionId = parseInt(params.question_id, 10);
  if (isNaN(questionId)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  const body = await request.json();
  const validation = answerSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Verify that the user is the owner of the auction associated with the question
  const { data: question, error: questionError } = await supabase
    .from('auction_questions')
    .select('auctions(user_id)')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  if (question.auctions?.user_id !== session.user.id) {
    return NextResponse.json(
      { error: 'You are not authorized to answer this question.' },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('auction_questions')
    .update({
      answer: validation.data.answer,
      answered_at: new Date().toISOString(),
    })
    .eq('id', questionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating question with answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer.' },
      { status: 500 }
    );
  }

  // Send notification to the user who asked the question
  try {
    await sendQuestionAnsweredNotification(data.id);
  } catch (emailError) {
    console.error('Failed to send question answered notification email:', emailError);
    // Do not block the response for email failure
  }

  return NextResponse.json(data, { status: 200 });
}