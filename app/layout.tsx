import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { QueryProvider } from "@/lib/providers/query-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://motoauto.ch"),
  title: "MotoAuto.ch - Znajdź swój wymarzony pojazd",
  description:
    "Największa platforma sprzedaży samochodów i motocykli w Szwajcarii. Znajdź swój wymarzony pojazd już dziś!",
  keywords: ["samochody", "motocykle", "sprzedaż", "aukcje", "Szwajcaria"],
  authors: [{ name: "MotoAuto.ch" }],
  openGraph: {
    title: "MotoAuto.ch - Znajdź swój wymarzony pojazd",
    description: "Największa platforma sprzedaży samochodów i motocykli w Szwajcarii",
    url: "https://motoauto.ch",
    siteName: "MotoAuto.ch",
    locale: "pl_PL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
