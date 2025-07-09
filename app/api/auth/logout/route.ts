import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await auth.signOut()

    const response = NextResponse.json({ message: "Wylogowano pomyślnie" }, { status: 200 })

    // Usuń cookie z tokenem
    response.cookies.delete("auth-token")

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Błąd wylogowania" }, { status: 500 })
  }
}
