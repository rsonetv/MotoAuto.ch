import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto my-12 max-w-4xl px-4">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Jak działają nasze aukcje?
      </h1>
      <p className="mb-12 text-center text-lg text-gray-600">
        Dowiedz się, jak łatwo możesz kupować i sprzedawać pojazdy na naszej
        platformie. Poniżej znajdziesz przewodnik krok po kroku.
      </p>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Krok 1: Rejestracja i weryfikacja</AccordionTrigger>
          <AccordionContent>
            Aby wziąć udział w aukcjach, musisz najpierw założyć konto. Proces
            jest szybki i prosty. Po rejestracji poprosimy Cię o weryfikację
            tożsamości, aby zapewnić bezpieczeństwo wszystkim użytkownikom.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Krok 2: Przeglądanie aukcji</AccordionTrigger>
          <AccordionContent>
            Po zalogowaniu możesz przeglądać wszystkie dostępne aukcje. Użyj
            filtrów, aby znaleźć interesujące Cię pojazdy. Każda aukcja
            zawiera szczegółowy opis, zdjęcia oraz historię pojazdu.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Krok 3: Licytacja</AccordionTrigger>
          <AccordionContent>
            Gdy znajdziesz interesujący Cię pojazd, możesz zacząć licytować.
            Możesz składać oferty ręcznie lub ustawić automatycznego agenta
            licytującego (auto-bid), który będzie licytował za Ciebie do
            określonej kwoty. Pamiętaj, że każda oferta jest wiążąca.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>
            Krok 4: Zakończenie aukcji i płatność
          </AccordionTrigger>
          <AccordionContent>
            Jeśli Twoja oferta będzie najwyższa w momencie zakończenia aukcji,
            wygrywasz! Otrzymasz od nas powiadomienie z instrukcjami
            dotyczącymi płatności. Płatności można dokonać bezpiecznie przez
            naszą platformę.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>Krok 5: Odbiór pojazdu</AccordionTrigger>
          <AccordionContent>
            Po zaksięgowaniu wpłaty możesz umówić się na odbiór pojazdu ze
            sprzedającym. Nasz zespół jest do Twojej dyspozycji, aby pomóc w
            koordynacji tego procesu.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
