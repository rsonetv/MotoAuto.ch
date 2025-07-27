import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, Cookie, ArrowLeft, Settings, BarChart, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Cookie-Richtlinie MotoAuto.ch | Informationen zu Cookies",
  description: "Cookie-Richtlinie von MotoAuto.ch - Informationen zur Verwendung von Cookies und ähnlichen Technologien gemäß Schweizer Recht und DSGVO.",
  keywords: ["Cookies", "Cookie-Richtlinie", "Tracking", "MotoAuto.ch", "Datenschutz", "Privatsphäre"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Cookie-Richtlinie MotoAuto.ch",
    description: "Informationen zur Verwendung von Cookies auf der Plattform MotoAuto.ch",
    type: "article",
    locale: "de_CH",
  },
  alternates: {
    languages: {
      'de': '/cookie-richtlinie',
      'fr': '/politique-cookies',
      'pl': '/cookies'
    }
  }
}

export default function CookiesPolicyPageDE() {
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
              <Link href="/politique-cookies" className="text-sm text-gray-600 hover:text-gray-900">FR</Link>
              <span className="text-gray-300">|</span>
              <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">PL</Link>
            </div>
            
            {/* Print Button */}
            <PrintButton label="Drucken" />
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="w-8 h-8 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Cookie-Richtlinie MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Letzte Aktualisierung: {lastUpdated}</span>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-orange-800 text-sm">
              <strong>Cookie-Verwaltung:</strong> Sie können Ihre Cookie-Präferenzen in den Browser-Einstellungen 
              oder über unser Präferenzzentrum verwalten.
            </p>
          </div>
        </header>

        {/* Cookie Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cookie-Präferenzzentrum</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen verwalten
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            Klicken Sie auf die Schaltfläche oben, um Ihre Cookie-Präferenzen anzupassen. 
            Sie können auswählen, welche Cookie-Kategorien Sie akzeptieren möchten.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Inhaltsverzeichnis</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Was sind Cookies</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Cookie-Arten</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Notwendige Cookies</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Funktionale Cookies</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Analytische Cookies</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Marketing-Cookies</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Drittanbieter-Cookies</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Cookie-Verwaltung</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Richtlinien-Updates</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Kontakt</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Was sind Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Cookies sind kleine Textdateien, die auf Ihrem Gerät (Computer, Tablet, Smartphone) 
                  gespeichert werden, wenn Sie unsere Website besuchen. Cookies helfen uns, ein besseres 
                  Nutzererlebnis zu bieten und ermöglichen das ordnungsgemäße Funktionieren der Website.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ähnliche Technologien</h3>
                  <p className="text-sm text-gray-600">
                    Neben Cookies verwenden wir auch ähnliche Technologien wie Web Beacons, Tracking-Pixel, 
                    Local Storage und Session Storage, die ähnlichen Zwecken dienen.
                  </p>
                </div>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Rechtsgrundlage:</strong> Art. 45c nDSG sowie ePrivacy-Verordnung (für EU-Nutzer)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Cookie-Arten nach Speicherdauer
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Session-Cookies</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Werden beim Schließen des Browsers gelöscht</li>
                      <li>• Notwendig für grundlegende Funktionen</li>
                      <li>• Speichern Daten nur während der Sitzung</li>
                      <li>• Erfordern keine Nutzereinwilligung</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Persistente Cookies</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Bleiben nach dem Schließen des Browsers bestehen</li>
                      <li>• Haben eine bestimmte Ablaufzeit</li>
                      <li>• Speichern Nutzerpräferenzen</li>
                      <li>• Können Nutzereinwilligung erfordern</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Cookies nach Herkunft:</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Eigene Cookies (First-Party)</h4>
                      <p className="text-sm text-gray-600">Direkt von MotoAuto.ch gesetzt</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Drittanbieter-Cookies (Third-Party)</h4>
                      <p className="text-sm text-gray-600">Von externen Dienstleistern gesetzt</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Notwendige Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Immer aktiv - keine Einwilligung erforderlich</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Diese Cookies sind für das grundlegende Funktionieren der Website erforderlich und können nicht deaktiviert werden.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Zweck</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Speicherdauer</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">session_id</td>
                        <td className="border-b border-gray-200 px-4 py-3">Identifikation der Benutzersitzung</td>
                        <td className="border-b border-gray-200 px-4 py-3">Sitzung</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">csrf_token</td>
                        <td className="border-b border-gray-200 px-4 py-3">Schutz vor CSRF-Angriffen</td>
                        <td className="border-b border-gray-200 px-4 py-3">Sitzung</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">auth_token</td>
                        <td className="border-b border-gray-200 px-4 py-3">Benutzerauthentifizierung</td>
                        <td className="border-b border-gray-200 px-4 py-3">30 Tage</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">cookie_consent</td>
                        <td className="border-b border-gray-200 px-4 py-3">Speicherung der Cookie-Präferenzen</td>
                        <td className="border-b border-gray-200 px-4 py-3">1 Jahr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Funktionale Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Optional - Einwilligung erforderlich</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Diese Cookies verbessern die Website-Funktionalität und speichern Ihre Präferenzen.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Sprachpräferenzen</h4>
                    <p className="text-sm text-gray-600">Speicherung der gewählten Interface-Sprache (DE/FR/PL/EN)</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Suchfilter</h4>
                    <p className="text-sm text-gray-600">Speicherung der Filtereinstellungen für die Fahrzeugsuche</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Favoriten-Inserate</h4>
                    <p className="text-sm text-gray-600">Speicherung der Liste favorisierter Fahrzeuge</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Anzeigeeinstellungen</h4>
                    <p className="text-sm text-gray-600">Präferenzen für Seitenlayout und Ergebnisanzahl</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Analytische Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <BarChart className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-800">Optional - Einwilligung erforderlich</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Diese Cookies helfen uns zu verstehen, wie Nutzer unsere Website verwenden.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Anbieter</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Zweck</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Speicherdauer</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Google Analytics</td>
                        <td className="border-b border-gray-200 px-4 py-3">Analyse von Traffic und Nutzerverhalten</td>
                        <td className="border-b border-gray-200 px-4 py-3">2 Jahre</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Hotjar</td>
                        <td className="border-b border-gray-200 px-4 py-3">Heatmaps und Session-Aufzeichnungen</td>
                        <td className="border-b border-gray-200 px-4 py-3">1 Jahr</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">MotoAuto Analytics</td>
                        <td className="border-b border-gray-200 px-4 py-3">Interne Performance-Analyse</td>
                        <td className="border-b border-gray-200 px-4 py-3">6 Monate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 border-l-4 border-purple-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Datenanonymisierung:</strong> Alle analytischen Daten werden anonymisiert und erlauben 
                    keine Identifikation einzelner Nutzer.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Marketing-Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">Optional - Einwilligung erforderlich</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Diese Cookies dienen der Anzeige personalisierter Werbung und der Verfolgung ihrer Wirksamkeit.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Remarketing</h4>
                    <p className="text-sm text-gray-600">Anzeige von Werbung auf anderen Websites basierend auf Ihrer Aktivität</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Werbepersonalisierung</h4>
                    <p className="text-sm text-gray-600">Anpassung von Werbeinhalten an Ihre Interessen</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Wirksamkeitsmessung</h4>
                    <p className="text-sm text-gray-600">Verfolgung von Konversionen und Kampagnen-Wirksamkeit</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Hinweis:</strong> Sie können die Einwilligung für Marketing-Cookies jederzeit im 
                    Cookie-Präferenzzentrum widerrufen.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Drittanbieter-Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Einige Cookies werden von externen Dienstleistern gesetzt, die wir auf unserer Website verwenden:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Zahlungsanbieter</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Stripe (Zahlungsabwicklung)</li>
                      <li>• PayPal (Online-Zahlungen)</li>
                      <li>• PostFinance (Schweizer Zahlungen)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Soziale Medien</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Facebook (Teilen-Buttons)</li>
                      <li>• Twitter (Tweet-Einbettungen)</li>
                      <li>• YouTube (Video-Player)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Karten und Standort</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Google Maps (Kartenanzeige)</li>
                      <li>• OpenStreetMap (Alternative Karten)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Kundensupport</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Zendesk (Ticket-System)</li>
                      <li>• Intercom (Live-Chat)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Datenschutzrichtlinien Dritter:</strong> Jeder der genannten Anbieter hat eigene 
                    Datenschutzrichtlinien, die auf deren Websites eingesehen werden können.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Cookie-Verwaltung
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Sie haben vollständige Kontrolle über die auf unserer Website verwendeten Cookies:</p>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Präferenzzentrum</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Nutzen Sie unser Cookie-Präferenzzentrum zur Anpassung der Einstellungen.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Präferenzzentrum öffnen
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Browser-Einstellungen</h4>
                    <p className="text-sm text-gray-600">
                      Sie können Cookies auch direkt in Ihren Browser-Einstellungen verwalten.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Anleitungen für gängige Browser:</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Google Chrome</h5>
                      <p className="text-sm text-gray-600">Einstellungen → Datenschutz und Sicherheit → Cookies und andere Website-Daten</p>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Mozilla Firefox</h5>
                      <p className="text-sm text-gray-600">Einstellungen → Datenschutz & Sicherheit → Cookies und Website-Daten</p>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Safari</h5>
                      <p className="text-sm text-gray-600">Einstellungen → Datenschutz → Website-Daten verwalten</p>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Microsoft Edge</h5>
                      <p className="text-sm text-gray-600">Einstellungen → Cookies und Website-Berechtigungen → Cookies verwalten</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Hinweis:</strong> Das Deaktivieren von Cookies kann die Website-Funktionalität beeinträchtigen.
                    Einige Funktionen funktionieren möglicherweise nicht ordnungsgemäß.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Richtlinien-Updates
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Diese Cookie-Richtlinie kann regelmäßig aktualisiert werden, um Änderungen in unseren
                  Praktiken oder aus betrieblichen, rechtlichen oder regulatorischen Gründen zu reflektieren.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Benachrichtigungen über Änderungen</h4>
                  <p className="text-sm text-gray-600">
                    Über wesentliche Änderungen der Cookie-Richtlinie informieren wir durch:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Benachrichtigung auf der Startseite</li>
                    <li>• E-Mail an registrierte Nutzer</li>
                    <li>• Aktualisierung des "Letzte Aktualisierung"-Datums</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">MotoAuto.ch AG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Adresse:</strong> Bahnhofstrasse 1, 8001 Zürich, Schweiz</p>
                    <p><strong>E-Mail:</strong> privacy@motoauto.ch</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Kontaktformular:</strong> <Link href="/kontakt" className="text-blue-600 hover:text-blue-800 underline">motoauto.ch/kontakt</Link></p>
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
              href="/nutzungsbedingungen"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Nutzungsbedingungen
            </Link>
            <Link
              href="/datenschutzrichtlinie"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Datenschutzrichtlinie
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