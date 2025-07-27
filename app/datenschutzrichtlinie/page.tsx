import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, Shield, ArrowLeft, Lock, Eye, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Datenschutzrichtlinie MotoAuto.ch | Datenschutz und Privatsphäre",
  description: "Datenschutzrichtlinie von MotoAuto.ch - Informationen zur Verarbeitung personenbezogener Daten gemäß dem neuen Datenschutzgesetz (nDSG) der Schweiz.",
  keywords: ["Datenschutz", "Datenschutzrichtlinie", "DSGVO", "nDSG", "MotoAuto.ch", "Schweizer Recht"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Datenschutzrichtlinie MotoAuto.ch",
    description: "Informationen zur Verarbeitung personenbezogener Daten gemäß Schweizer Recht",
    type: "article",
    locale: "de_CH",
  },
  alternates: {
    languages: {
      'de': '/datenschutzrichtlinie',
      'fr': '/politique-confidentialite',
      'pl': '/polityka-prywatnosci'
    }
  }
}

export default function PrivacyPolicyPageDE() {
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
              <Link href="/politique-confidentialite" className="text-sm text-gray-600 hover:text-gray-900">FR</Link>
              <span className="text-gray-300">|</span>
              <Link href="/polityka-prywatnosci" className="text-sm text-gray-600 hover:text-gray-900">PL</Link>
            </div>
            
            {/* Print Button */}
            <PrintButton label="Drucken" />
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Datenschutzrichtlinie MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Letzte Aktualisierung: {lastUpdated}</span>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 text-sm">
              <strong>Rechtskonformität:</strong> Diese Datenschutzrichtlinie entspricht dem neuen 
              Datenschutzgesetz (nDSG) der Schweiz sowie der DSGVO für Nutzer aus der EU.
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Inhaltsverzeichnis</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Datenverantwortlicher</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Arten verarbeiteter Daten</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Verarbeitungszwecke</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Rechtsgrundlagen</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Datenweitergabe</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Speicherdauer</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Nutzerrechte</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Datensicherheit</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Cookies und Tracking</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Kontakt</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Datenverantwortlicher
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Verantwortlicher für die Verarbeitung personenbezogener Daten ist die MotoAuto.ch AG mit Sitz in Zürich, Schweiz.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Kontaktdaten des Verantwortlichen:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Firma:</strong> MotoAuto.ch AG</p>
                    <p><strong>Adresse:</strong> Bahnhofstrasse 1, 8001 Zürich, Schweiz</p>
                    <p><strong>E-Mail:</strong> privacy@motoauto.ch</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Handelsregisternummer:</strong> CHE-123.456.789</p>
                  </div>
                </div>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Rechtsgrundlage:</strong> Art. 19-25 nDSG (neues Datenschutzgesetz)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Arten verarbeiteter Daten
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Wir verarbeiten folgende Kategorien personenbezogener Daten:</p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Database className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">Registrierungsdaten</h3>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Vor- und Nachname</li>
                      <li>• E-Mail-Adresse</li>
                      <li>• Telefonnummer</li>
                      <li>• Wohnadresse</li>
                      <li>• Geburtsdatum</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Eye className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Verhaltensdaten</h3>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Browsing-Verlauf</li>
                      <li>• Suchpräferenzen</li>
                      <li>• Gerätedaten</li>
                      <li>• IP-Adresse</li>
                      <li>• Geografische Lage</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center mb-3">
                    <Lock className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold">Transaktionsdaten</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Transaktionshistorie</li>
                    <li>• Zahlungsdaten (verschlüsselt)</li>
                    <li>• Rechnungen und Belege</li>
                    <li>• Kundensupport-Kommunikation</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Verarbeitungszwecke
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Personenbezogene Daten verarbeiten wir zu folgenden Zwecken:</p>
                <div className="space-y-4 mt-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Dienstleistungserbringung</h4>
                    <p className="text-sm text-gray-600">Ermöglichung der Plattformnutzung, Kontoverwaltung, Transaktionsabwicklung</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Kommunikation</h4>
                    <p className="text-sm text-gray-600">Kontakt mit Nutzern, Transaktionsbenachrichtigungen, Kundensupport</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Marketing</h4>
                    <p className="text-sm text-gray-600">Versendung von Angebotsinformationen, Inhalts-Personalisierung (mit Einwilligung)</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Sicherheit</h4>
                    <p className="text-sm text-gray-600">Betrugsverhinderung, Schutz vor Missbrauch, Sicherheitsgewährleistung</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Rechtsgrundlagen der Verarbeitung
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage von:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Vertragserfüllung</strong> - Plattform-Dienstleistungen (Art. 31 nDSG)</li>
                  <li><strong>Einwilligung</strong> - Marketing, nicht-essenzielle Cookies (Art. 31 nDSG)</li>
                  <li><strong>Berechtigtes Interesse</strong> - Sicherheit, Analytik (Art. 31 nDSG)</li>
                  <li><strong>Rechtliche Verpflichtung</strong> - Aufbewahrung von Buchungsbelegen (OR Art. 957-963)</li>
                </ul>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Hinweis:</strong> Die Einwilligung kann jederzeit widerrufen werden, ohne dass die Rechtmäßigkeit 
                    der vor dem Widerruf erfolgten Verarbeitung berührt wird.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Datenweitergabe an Dritte
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Personenbezogene Daten können an folgende Empfängerkategorien weitergegeben werden:</p>
                <div className="space-y-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Technische Dienstleister</h4>
                    <p className="text-sm text-gray-600">Hosting, Zahlungsabwicklung, Analytik - nur im für die Dienstleistung erforderlichen Umfang</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Staatliche Stellen</h4>
                    <p className="text-sm text-gray-600">Auf Anfrage von Strafverfolgungsbehörden oder anderen berechtigten Institutionen gemäß Schweizer Recht</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Geschäftspartner</h4>
                    <p className="text-sm text-gray-600">Händler, Versicherungsunternehmen - nur mit Nutzereinwilligung</p>
                  </div>
                </div>
                <p className="mt-4">
                  <strong>Datenübermittlung außerhalb der Schweiz:</strong> Daten können in EU/EWR-Länder 
                  sowie in Länder mit angemessenem Datenschutzniveau gemäß Entscheidungen des Eidgenössischen 
                  Datenschutz- und Öffentlichkeitsbeauftragten übermittelt werden.
                </p>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Speicherdauer
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Personenbezogene Daten speichern wir für folgende Zeiträume:</p>
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Datenkategorie</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Speicherdauer</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Rechtsgrundlage</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Benutzerkontodaten</td>
                        <td className="border-b border-gray-200 px-4 py-3">Bis Kontolöschung + 1 Jahr</td>
                        <td className="border-b border-gray-200 px-4 py-3">Berechtigtes Interesse</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Transaktionsdaten</td>
                        <td className="border-b border-gray-200 px-4 py-3">10 Jahre</td>
                        <td className="border-b border-gray-200 px-4 py-3">OR Art. 958f (Buchführungspflicht)</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">System-Logs</td>
                        <td className="border-b border-gray-200 px-4 py-3">12 Monate</td>
                        <td className="border-b border-gray-200 px-4 py-3">Systemsicherheit</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Marketing-Daten</td>
                        <td className="border-b border-gray-200 px-4 py-3">Bis Widerruf der Einwilligung</td>
                        <td className="border-b border-gray-200 px-4 py-3">Nutzereinwilligung</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Nutzerrechte
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Gemäß nDSG stehen Ihnen folgende Rechte zu:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Auskunftsrecht</h4>
                    <p className="text-sm text-gray-600">Information über verarbeitete personenbezogene Daten</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Berichtigungsrecht</h4>
                    <p className="text-sm text-gray-600">Korrektur unrichtiger Daten</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Löschungsrecht</h4>
                    <p className="text-sm text-gray-600">Löschung von Daten in bestimmten Fällen</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Einschränkungsrecht</h4>
                    <p className="text-sm text-gray-600">Einschränkung der Datenverarbeitung</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Datenübertragbarkeit</h4>
                    <p className="text-sm text-gray-600">Erhalt der Daten in strukturiertem Format</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Widerspruchsrecht</h4>
                    <p className="text-sm text-gray-600">Widerspruch gegen Verarbeitung zu bestimmten Zwecken</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Rechte ausüben:</strong> Um Ihre Rechte auszuüben, kontaktieren Sie uns unter 
                    privacy@motoauto.ch. Wir antworten innerhalb von 30 Tagen.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Datensicherheit
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Wir setzen angemessene technische und organisatorische Maßnahmen zum Schutz personenbezogener Daten 
                  vor unbefugtem Zugriff, Verlust, Zerstörung oder Offenlegung ein.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Technische Maßnahmen:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• SSL/TLS-Verschlüsselung</li>
                      <li>• Datenbank-Verschlüsselung</li>
                      <li>• Regelmäßige Backups</li>
                      <li>• 24/7 Sicherheitsüberwachung</li>
                      <li>• Sicherheitsupdates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Organisatorische Maßnahmen:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Mitarbeiterschulungen</li>
                      <li>• Zugriffskontrolle</li>
                      <li>• Sicherheitsverfahren</li>
                      <li>• Sicherheitsaudits</li>
                      <li>• Incident-Response-Plan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Cookies und Tracking-Technologien
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Unsere Website verwendet Cookies und ähnliche Technologien. 
                  Detaillierte Informationen finden Sie in unserer 
                  <Link href="/cookie-richtlinie" className="text-blue-600 hover:text-blue-800 underline">
                    Cookie-Richtlinie
                  </Link>.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Cookie-Verwaltung:</strong> Sie können Cookie-Einstellungen in Ihrem Browser verwalten 
                    oder unser Cookie-Präferenzzentrum nutzen.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Kontakt und Beschwerden
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Datenschutzbeauftragter</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>E-Mail:</strong> privacy@motoauto.ch</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Adresse:</strong> MotoAuto.ch AG, Bahnhofstrasse 1, 8001 Zürich</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Beschwerderecht</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Bei Verstößen gegen Datenschutzbestimmungen können Sie Beschwerde einreichen bei:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)</strong></p>
                    <p>Feldeggweg 1, 3003 Bern, Schweiz</p>
                    <p>E-Mail: contact@edoeb.admin.ch</p>
                    <p>Tel: +41 58 462 43 95</p>
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