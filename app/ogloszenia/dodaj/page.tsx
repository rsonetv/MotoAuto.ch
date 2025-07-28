"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ModernListingForm } from "@/components/forms/modern-listing-form"

export default function DodajOgloszeniePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Dodaj nowe ogłoszenie</h1>
            <p className="text-xl text-muted-foreground">
              Jednokrokowy formularz z natychmiastowym podglądem zdjęć i asynchroniczną wysyłką
            </p>
          </div>

          <ModernListingForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
