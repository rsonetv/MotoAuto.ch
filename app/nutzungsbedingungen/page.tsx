import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, FileText, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Nutzungsbedingungen von MotoAuto.ch | Allgemeine Geschäftsbedingungen",
  description: "Nutzungsbedingungen von MotoAuto.ch - Allgemeine Geschäftsbedingungen für die Nutzung der Fahrzeughandelsplattform in der Schweiz gemäß Schweizer Recht.",
  keywords: ["Nutzungsbedingungen", "AGB", "MotoAuto.ch", "Schweizer Recht", "OR", "nDSG"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Nutzungsbedingungen von MotoAuto.ch",
    description: "Allgemeine Geschäftsbedingungen der Plattform MotoAuto.ch gemäß Schweizer Recht",
    type: "article",
    locale: "de_CH",
  },
  alternates: {
    languages: {
      'de': '/nutzungsbedingungen',
      'fr': '/conditions-generales',
      'pl': '/regulamin'
    }
  }
}

export default function TermsOfServicePageDE() {
  const lastUpdated = "26. Juli 2025"
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-blue-600">DE</span>
              <span className="text-gray-300">|</span>
              <Link href="/conditions-generales" className="text-sm text-gray-600 hover:text-gray-900">FR</Link>
              <span className="text-gray-300">|</span>
              <Link href="/regulamin" className="text-sm text-gray-600 hover:text-gray-900">PL</Link>
            </div>
            
            {/* Print Button */}
            <PrintButton label="Drucken" />
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Nutzungsbedingungen von MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Letzte Aktualisierung: {lastUpdated}</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Rechtliche Information:</strong> Diese Nutzungsbedingungen entsprechen dem Schweizer Recht, 
              insbesondere dem Obligationenrecht (OR) und dem neuen Datenschutzgesetz (nDSG).
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Inhaltsverzeichnis</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Allgemeine Bestimmungen</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Definitionen</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Registrierung und Benutzerkonto</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Nutzungsregeln</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Inserate und Auktionen</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Zahlungen und Provisionen</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Haftung</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Datenschutz</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Schlussbestimmungen</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Kontakt</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Allgemeine Bestimmungen
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Diese Nutzungsbedingungen regeln die Nutzung der Internetplattform MotoAuto.ch 
                  (nachfolgend: "Plattform"), die von der MotoAuto.ch AG mit Sitz in Zürich, Schweiz, betrieben wird.
                </p>
                <p>
                  Die Nutzung der Plattform bedeutet die vollständige Annahme dieser Nutzungsbedingungen. 
                  Die Bedingungen entsprechen dem Schweizer Recht, insbesondere dem Obligationenrecht (OR).
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Rechtsgrundlage:</strong> Art. 1-40 OR (Obligationenrecht der Schweiz)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Definitionen
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>In diesen Nutzungsbedingungen bedeuten folgende Begriffe:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Plattform</strong> - die Internetplattform MotoAuto.ch</li>
                  <li><strong>Nutzer</strong> - Person, die die Plattform nutzt</li>
                  <li><strong>Verkäufer</strong> - Nutzer, der ein Fahrzeug zum Verkauf anbietet</li>
                  <li><strong>Käufer</strong> - Nutzer, der am Kauf eines Fahrzeugs interessiert ist</li>
                  <li><strong>Inserat</strong> - Verkaufsangebot für ein Fahrzeug</li>
                  <li><strong>Auktion</strong> - Fahrzeugverkauf in Form einer Versteigerung</li>
                </ul>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Registrierung und Benutzerkonto
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Um die volle Funktionalität der Plattform nutzen zu können, muss der Nutzer ein Konto erstellen. 
                  Die Registrierung ist kostenlos und erfordert die Angabe wahrheitsgemäßer persönlicher Daten.
                </p>
                <p>
                  Der Nutzer verpflichtet sich:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wahrheitsgemäße und aktuelle Daten bei der Registrierung anzugeben</li>
                  <li>Die Vertraulichkeit der Anmeldedaten zu wahren</li>
                  <li>Unbefugten Zugriff auf das Konto unverzüglich zu melden</li>
                  <li>Persönliche Daten bei Änderungen zu aktualisieren</li>
                </ul>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Nutzungsregeln
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Der Nutzer verpflichtet sich, die Plattform rechtskonform und in gutem Glauben zu nutzen.</p>
                <p><strong>Verboten ist:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Die Veröffentlichung falscher Informationen über Fahrzeuge</li>
                  <li>Die Verletzung von Urheberrechten und geistigem Eigentum</li>
                  <li>Die Nutzung der Plattform für rechtswidrige Aktivitäten</li>
                  <li>Versuche des Einbruchs oder der Störung des Plattformbetriebs</li>
                  <li>Spam und unerwünschte Nachrichten</li>
                </ul>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Inserate und Auktionen
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Verkäufer können Fahrzeuginserate veröffentlichen und Auktionen organisieren. 
                  Alle Inserate müssen wahrheitsgemäße Informationen über das Fahrzeug enthalten.
                </p>
                <p><strong>Anforderungen an Inserate:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Echte Fotos des Fahrzeugs</li>
                  <li>Genaue Beschreibung des technischen Zustands</li>
                  <li>Informationen zur Fahrzeughistorie</li>
                  <li>Aktueller Preis oder Startgebot</li>
                </ul>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Zahlungen und Provisionen
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Die Plattform erhebt Provisionen für erfolgreiche Transaktionen. Alle Zahlungen werden 
                  in Schweizer Franken (CHF) gemäß der gültigen Preisliste abgewickelt.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Hinweis:</strong> Die Provision wird nur bei erfolgreichem Fahrzeugverkauf erhoben.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Haftung
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Die MotoAuto.ch AG fungiert als Vermittler zwischen Verkäufern und Käufern. 
                  Die Verantwortung für den rechtlichen und technischen Zustand der Fahrzeuge liegt beim Verkäufer.
                </p>
                <p>
                  Die Plattform haftet nicht für:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Falsche Informationen von Nutzern</li>
                  <li>Streitigkeiten zwischen Nutzern</li>
                  <li>Schäden aus der Nutzung der Plattform</li>
                  <li>Unterbrechungen des Plattformbetriebs</li>
                </ul>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Datenschutz
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Die Verarbeitung personenbezogener Daten erfolgt gemäß dem neuen Datenschutzgesetz (nDSG) 
                  und unserer Datenschutzrichtlinie.
                </p>
                <p>
                  Detaillierte Informationen zur Datenverarbeitung finden Sie in unserer 
                  <Link href="/datenschutzrichtlinie" className="text-blue-600 hover:text-blue-800 underline">
                    Datenschutzrichtlinie
                  </Link>.
                </p>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Schlussbestimmungen
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Die Nutzungsbedingungen können geändert werden. Über Änderungen werden die Nutzer 
                  mit 30-tägiger Vorankündigung informiert.
                </p>
                <p>
                  Für nicht in diesen Nutzungsbedingungen geregelte Angelegenheiten gilt Schweizer Recht. 
                  Alle Streitigkeiten werden von den Gerichten in Zürich entschieden.
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Gerichtsstand:</strong> Gerichte in Zürich, Schweiz
                  </p>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">MotoAuto.ch AG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Adresse:</strong> Bahnhofstrasse 1, 8001 Zürich, Schweiz</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>E-Mail:</strong> kontakt@motoauto.ch</p>
                    <p><strong>Handelsregisternummer:</strong> CHE-123.456.789</p>
                  </div>
                </div>
              </div>
            </section>

          </article>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-6">
            <Link 
              href="/datenschutzrichtlinie" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Datenschutzrichtlinie
            </Link>
            <Link 
              href="/cookie-richtlinie" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Cookie-Richtlinie
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            Version vom {lastUpdated}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}