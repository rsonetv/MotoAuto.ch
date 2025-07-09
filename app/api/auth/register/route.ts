import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Wszystkie pola są wymagane" }, { status: 400 })
    }

    const { user } = await auth.signUp(email, password, fullName)

    return NextResponse.json(
      {
        user,
        message: "Konto zostało utworzone. Sprawdź email w celu weryfikacji.",
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Błąd rejestracji" }, { status: 400 })
  }
}
