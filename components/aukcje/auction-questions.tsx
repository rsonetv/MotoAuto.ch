'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Session } from '@supabase/auth-helpers-nextjs'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const questionSchema = z.object({
  question: z.string().min(10, 'Pytanie musi mieć co najmniej 10 znaków.'),
})

const answerSchema = z.object({
  answer: z.string().min(1, 'Odpowiedź nie może być pusta.'),
})

type Question = {
  id: number
  question: string
  answer: string | null
  created_at: string
  answered_at: string | null
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface AuctionQuestionsProps {
  auctionId: string
  questions: Question[]
  session: Session | null
  isOwner: boolean
}

export function AuctionQuestions({
  auctionId,
  questions: initialQuestions,
  session,
  isOwner,
}: AuctionQuestionsProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register: registerQuestion,
    handleSubmit: handleQuestionSubmit,
    reset: resetQuestionForm,
    formState: { errors: questionErrors },
  } = useForm<{ question: string }>({
    resolver: zodResolver(questionSchema),
  })

  const onQuestionSubmit = async (data: { question: string }) => {
    if (!session) {
      toast({
        title: 'Błąd',
        description: 'Musisz być zalogowany, aby zadać pytanie.',
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/auctions/${auctionId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const newQuestion = await response.json()
      if (!response.ok) {
        throw new Error(newQuestion.error || 'Nie udało się zadać pytania.')
      }
      setQuestions((prev) => [...prev, { ...newQuestion, profiles: { full_name: session.user.user_metadata.full_name, avatar_url: session.user.user_metadata.avatar_url } }])
      resetQuestionForm()
      toast({
        title: 'Sukces',
        description: 'Twoje pytanie zostało wysłane.',
      })
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onAnswerSubmit = async (questionId: number, data: { answer: string }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updatedQuestion = await response.json()
      if (!response.ok) {
        throw new Error(updatedQuestion.error || 'Nie udało się wysłać odpowiedzi.')
      }
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...updatedQuestion } : q))
      )
      toast({
        title: 'Sukces',
        description: 'Odpowiedź została dodana.',
      })
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pytania i Odpowiedzi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border-t pt-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={q.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{q.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{q.profiles?.full_name || 'Anonimowy użytkownik'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(q.created_at), { addSuffix: true, locale: pl })}
                    </p>
                  </div>
                  <p className="mt-1">{q.question}</p>
                </div>
              </div>
              {q.answer ? (
                <div className="mt-4 ml-12 pl-4 border-l-2">
                  <div className="flex items-start space-x-4">
                    {/* Assuming owner avatar can be fetched or is available */}
                    <Avatar>
                      <AvatarImage src={''} />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Sprzedawca</p>
                        <p className="text-sm text-muted-foreground">
                          {q.answered_at && formatDistanceToNow(new Date(q.answered_at), { addSuffix: true, locale: pl })}
                        </p>
                      </div>
                      <p className="mt-1">{q.answer}</p>
                    </div>
                  </div>
                </div>
              ) : (
                isOwner && (
                  <AnswerForm
                    questionId={q.id}
                    onSubmit={onAnswerSubmit}
                    isSubmitting={isSubmitting}
                  />
                )
              )}
            </div>
          ))}
        </div>

        {!isOwner && session && (
          <form onSubmit={handleQuestionSubmit(onQuestionSubmit)} className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-2">Zadaj pytanie</h3>
            <Textarea
              {...registerQuestion('question')}
              placeholder="Wpisz swoje pytanie tutaj..."
              className={questionErrors.question ? 'border-red-500' : ''}
            />
            {questionErrors.question && (
              <p className="text-sm text-red-500 mt-1">{questionErrors.question.message}</p>
            )}
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij pytanie'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function AnswerForm({
  questionId,
  onSubmit,
  isSubmitting,
}: {
  questionId: number
  onSubmit: (questionId: number, data: { answer: string }) => void
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ answer: string }>({
    resolver: zodResolver(answerSchema),
  })

  const onFormSubmit = (data: { answer: string }) => {
    onSubmit(questionId, data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="mt-4 ml-12 pl-4 border-l-2">
      <Textarea
        {...register('answer')}
        placeholder="Wpisz swoją odpowiedź..."
        className={`min-h-[80px] ${errors.answer ? 'border-red-500' : ''}`}
      />
      {errors.answer && (
        <p className="text-sm text-red-500 mt-1">{errors.answer.message}</p>
      )}
      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Wysyłanie...' : 'Odpowiedz'}
      </Button>
    </form>
  )
}