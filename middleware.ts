import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  // Chronione ścieżki
  const protectedPaths = ["/dashboard", "/profile"]

  // Publiczne ścieżki (tylko dla niezalogowanych)
  const publicPaths = ["/login", "/register", "/forgot-password"]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
