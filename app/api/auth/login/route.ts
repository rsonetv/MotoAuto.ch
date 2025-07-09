import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email i hasło są wymagane" }, { status: 400 })
    }

    const { user, session } = await auth.signIn(email, password)

    const response = NextResponse.json({ user, message: "Zalogowano pomyślnie" }, { status: 200 })

    // Ustaw cookie z tokenem
    if (session?.access_token) {
      response.cookies.set("auth-token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      })
    }

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Błąd logowania" }, { status: 401 })
  }
}
