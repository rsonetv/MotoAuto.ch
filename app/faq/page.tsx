import { Shell } from "@/components/shells/shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Jak działa platforma MotoAuto.ch?",
    answer: "MotoAuto.ch to platforma łącząca sprzedających i kupujących pojazdy. Sprzedający mogą wystawiać ogłoszenia i brać udział w aukcjach, a kupujący mogą przeglądać, licytować i kupować pojazdy. Oferujemy zarówno tradycyjne ogłoszenia, jak i aukcje."
  },
  {
    question: "Ile kosztuje wystawienie ogłoszenia?",
    answer: "Wystawienie podstawowego ogłoszenia jest darmowe. Dostępne są również płatne pakiety z dodatkowymi funkcjami, takimi jak wyróżnienie ogłoszenia czy publikacja w mediach społecznościowych."
  },
  {
    question: "Jak mogę się zarejestrować?",
    answer: "Rejestracja jest prosta i darmowa. Wystarczy kliknąć przycisk 'Zarejestruj się', podać podstawowe dane i potwierdzić adres email. Dla dealerów oferujemy specjalne konta biznesowe z dodatkowymi funkcjami."
  },
  {
    question: "Jakie są metody płatności?",
    answer: "Akceptujemy płatności kartą kredytową, przelewem bankowym oraz poprzez popularne systemy płatności elektronicznych. Wszystkie transakcje są bezpieczne i szyfrowane."
  },
  {
    question: "Co jeśli mam problem techniczny?",
    answer: "Nasz zespół wsparcia technicznego jest dostępny przez całą dobę. Możesz skontaktować się z nami poprzez formularz kontaktowy, email lub telefonicznie."
  }
]

export default function FAQPage() {
  return (
    <Shell>
      <section className="container flex flex-col gap-8 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Często zadawane pytania
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Znajdź odpowiedzi na najczęściej zadawane pytania o MotoAuto.ch
          </p>
        </div>
        <div className="mx-auto grid max-w-[58rem] gap-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Shell>
  )
}
