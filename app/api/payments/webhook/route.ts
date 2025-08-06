import { createClient } from "@supabase/supabase-js"
import { buffer } from "micro"
import { NextApiRequest, NextApiResponse } from "next"
import { NextResponse } from "next/server"
import Stripe from "stripe"


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const config = {
  api: {
    bodyParser: false,
  },
}


export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
  })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const buf = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(err)
    console.log(`❌ Error message: ${errorMessage}`)
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }

  // Successfully constructed event.
  console.log("✅ Success:", event.id)

  switch (event.type) {
    case "charge.succeeded":
      const charge = event.data.object as Stripe.Charge
      try {
        const { data, error } = await supabase
          .from("payments")
          .insert([
            {
              user_id: charge.metadata.user_id,
              amount: charge.amount / 100,
              commission: Math.min((charge.amount / 100) * 0.05, 500),
              status: "succeeded",
              stripe_charge_id: charge.id,
            },
          ])
          .select()

        if (error) {
          throw error
        }
        console.log("Payment inserted:", data)
      } catch (error) {
        console.error("Error inserting payment:", error)
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 }
        )
      }
      break
    default:
      console.warn(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}