import { Shell } from "@/components/shells/shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LanguageSelector } from "@/components/language-selector"
import { content } from "@/config/content"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

export async function generateStaticParams() {
  return [
    { lang: 'pl' },
    { lang: 'de' },
    { lang: 'fr' },
    { lang: 'en' },
    { lang: 'it' },
  ]
}

export default function HowItWorksPage({ params }: { params: { lang: string } }) {
  const supportedLanguages = ['pl', 'de', 'fr', 'en', 'it']
  
  if (!supportedLanguages.includes(params.lang)) {
    notFound()
  }

  const langContent = content[params.lang as keyof typeof content]

  return (
    <Shell>
      <section className="container flex flex-col gap-8 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <LanguageSelector currentLang={params.lang} />
          <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            {langContent.title}
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {langContent.subtitle}
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mx-auto max-w-[58rem] mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">{langContent.howItWorks.title}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {langContent.howItWorks.steps.map((step, index) => (
              <Card key={index} className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-[58rem] mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {langContent.faqs.map((faq, index) => (
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
