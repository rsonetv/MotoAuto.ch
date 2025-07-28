import { Shell } from "@/components/shells/shell"
import { PricingCards } from "@/components/pricing/pricing-cards"
import { buttonVariants } from "@/components/ui/button"

export default function PricingPage() {
  return (
    <Shell>
      <section className="container flex flex-col gap-8 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Prosta i przejrzysta wycena
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Wybierz plan odpowiedni dla Twoich potrzeb. Zacznij od darmowego konta i rozwijaj się razem z nami.
          </p>
        </div>
        <PricingCards />
      </section>
    </Shell>
  )
}
