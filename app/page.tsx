import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/layout/hero-section"
import { StickyTabs } from "@/components/layout/sticky-tabs"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <StickyTabs />
      <Footer />
    </main>
  )
}
