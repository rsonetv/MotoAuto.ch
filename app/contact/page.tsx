import { Shell } from "@/components/shells/shell"
import { ContactForm } from "@/components/forms/contact-form"

export default function ContactPage() {
  return (
    <Shell>
      <section className="container flex flex-col gap-8 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Skontaktuj się z nami
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Masz pytania? Jesteśmy tutaj, aby pomóc. Wypełnij formularz poniżej, a odpowiemy najszybciej jak to możliwe.
          </p>
        </div>
        <div className="mx-auto grid max-w-[58rem] gap-4">
          <ContactForm />
        </div>
      </section>
    </Shell>
  )
}
