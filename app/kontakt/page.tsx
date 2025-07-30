import { Metadata } from 'next'
import { ContactForm } from '@/components/forms/contact-form'

export const metadata: Metadata = {
  title: 'Kontakt - MotoAuto.ch',
  description: 'Skontaktuj się z nami - MotoAuto.ch'
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Kontakt</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Skontaktuj się z nami</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">kontakt@motoauto.ch</p>
              </div>
              <div>
                <h3 className="font-medium">Telefon</h3>
                <p className="text-gray-600">+41 XX XXX XX XX</p>
              </div>
              <div>
                <h3 className="font-medium">Adres</h3>
                <p className="text-gray-600">
                  MotoAuto.ch<br />
                  Przykładowa 123<br />
                  8000 Zürich<br />
                  Szwajcaria
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Wyślij wiadomość</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}