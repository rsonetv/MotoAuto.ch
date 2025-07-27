import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Globe, Calendar, Shield, ArrowLeft, Printer, Lock, Eye, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Politique de confidentialité MotoAuto.ch | Protection des données personnelles",
  description: "Politique de confidentialité de MotoAuto.ch - informations sur le traitement des données personnelles conformément à la nouvelle Loi fédérale sur la protection des données (nLPD) de la Suisse.",
  keywords: ["politique de confidentialité", "protection des données", "RGPD", "nLPD", "MotoAuto.ch", "droit suisse"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Politique de confidentialité MotoAuto.ch",
    description: "Informations sur le traitement des données personnelles conformément au droit suisse",
    type: "article",
    locale: "fr_CH",
  },
  alternates: {
    languages: {
      'de': '/datenschutzrichtlinie',
      'fr': '/politique-confidentialite',
      'pl': '/polityka-prywatnosci'
    }
  }
}

export default function PrivacyPolicyPageFR() {
  const lastUpdated = "26 juillet 2025"
  
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
            Retour à l'accueil
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <Link href="/datenschutzrichtlinie" className="text-sm text-gray-600 hover:text-gray-900">DE</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-medium text-blue-600">FR</span>
              <span className="text-gray-300">|</span>
              <Link href="/polityka-prywatnosci" className="text-sm text-gray-600 hover:text-gray-900">PL</Link>
            </div>
            
            {/* Print Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.print()}
              className="hidden md:flex"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Politique de confidentialité MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Dernière mise à jour : {lastUpdated}</span>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 text-sm">
              <strong>Conformité juridique :</strong> Cette politique de confidentialité est conforme à la nouvelle 
              Loi fédérale sur la protection des données (nLPD) de la Suisse ainsi qu'au RGPD pour les utilisateurs de l'UE.
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Table des matières</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Responsable des données</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Types de données traitées</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Finalités du traitement</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Bases juridiques</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Partage des données</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Durée de conservation</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Droits des utilisateurs</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Sécurité des données</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Cookies et suivi</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Contact</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Responsable des données
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Le responsable du traitement des données personnelles est MotoAuto.ch AG, société ayant son siège à Zurich, Suisse.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Coordonnées du responsable :</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Société :</strong> MotoAuto.ch AG</p>
                    <p><strong>Adresse :</strong> Bahnhofstrasse 1, 8001 Zürich, Suisse</p>
                    <p><strong>E-mail :</strong> privacy@motoauto.ch</p>
                    <p><strong>Téléphone :</strong> +41 44 123 45 67</p>
                    <p><strong>Numéro d'inscription au registre du commerce :</strong> CHE-123.456.789</p>
                  </div>
                </div>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Base juridique :</strong> Art. 19-25 nLPD (nouvelle Loi fédérale sur la protection des données)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Types de données traitées
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Nous traitons les catégories suivantes de données personnelles :</p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Database className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">Données d'inscription</h3>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Prénom et nom</li>
                      <li>• Adresse e-mail</li>
                      <li>• Numéro de téléphone</li>
                      <li>• Adresse de domicile</li>
                      <li>• Date de naissance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Eye className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Données comportementales</h3>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Historique de navigation</li>
                      <li>• Préférences de recherche</li>
                      <li>• Données d'appareil</li>
                      <li>• Adresse IP</li>
                      <li>• Localisation géographique</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center mb-3">
                    <Lock className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold">Données transactionnelles</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Historique des transactions</li>
                    <li>• Données de paiement (chiffrées)</li>
                    <li>• Factures et reçus</li>
                    <li>• Communication avec le support client</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Finalités du traitement
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Nous traitons les données personnelles aux fins suivantes :</p>
                <div className="space-y-4 mt-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Prestation de services</h4>
                    <p className="text-sm text-gray-600">Permettre l'utilisation de la plateforme, gestion de compte, traitement des transactions</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Communication</h4>
                    <p className="text-sm text-gray-600">Contact avec les utilisateurs, notifications de transactions, support client</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Marketing</h4>
                    <p className="text-sm text-gray-600">Envoi d'informations sur les offres, personnalisation du contenu (avec consentement)</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Sécurité</h4>
                    <p className="text-sm text-gray-600">Prévention de la fraude, protection contre les abus, garantie de sécurité</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Bases juridiques du traitement
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Le traitement des données personnelles s'effectue sur la base de :</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Exécution du contrat</strong> - services de la plateforme (art. 31 nLPD)</li>
                  <li><strong>Consentement</strong> - marketing, cookies non essentiels (art. 31 nLPD)</li>
                  <li><strong>Intérêt légitime</strong> - sécurité, analytique (art. 31 nLPD)</li>
                  <li><strong>Obligation légale</strong> - conservation des documents comptables (CO art. 957-963)</li>
                </ul>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Note :</strong> Le consentement peut être retiré à tout moment sans affecter la licéité 
                    du traitement effectué avant le retrait.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Partage des données avec des tiers
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Les données personnelles peuvent être partagées avec les catégories de destinataires suivantes :</p>
                <div className="space-y-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prestataires techniques</h4>
                    <p className="text-sm text-gray-600">Hébergement, traitement des paiements, analytique - uniquement dans la mesure nécessaire au service</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Autorités publiques</h4>
                    <p className="text-sm text-gray-600">Sur demande des autorités de poursuite pénale ou d'autres institutions habilitées selon le droit suisse</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Partenaires commerciaux</h4>
                    <p className="text-sm text-gray-600">Concessionnaires, compagnies d'assurance - uniquement avec le consentement de l'utilisateur</p>
                  </div>
                </div>
                <p className="mt-4">
                  <strong>Transfert de données hors de Suisse :</strong> Les données peuvent être transférées vers des pays UE/EEE 
                  ainsi que vers des pays disposant d'un niveau de protection des données adéquat selon les décisions du 
                  Préposé fédéral à la protection des données et à la transparence.
                </p>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Durée de conservation
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Nous conservons les données personnelles pendant les durées suivantes :</p>
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Catégorie de données</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Durée de conservation</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Base juridique</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Données de compte utilisateur</td>
                        <td className="border-b border-gray-200 px-4 py-3">Jusqu'à suppression du compte + 1 an</td>
                        <td className="border-b border-gray-200 px-4 py-3">Intérêt légitime</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Données transactionnelles</td>
                        <td className="border-b border-gray-200 px-4 py-3">10 ans</td>
                        <td className="border-b border-gray-200 px-4 py-3">CO art. 958f (obligation comptable)</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Journaux système</td>
                        <td className="border-b border-gray-200 px-4 py-3">12 mois</td>
                        <td className="border-b border-gray-200 px-4 py-3">Sécurité du système</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Données marketing</td>
                        <td className="border-b border-gray-200 px-4 py-3">Jusqu'au retrait du consentement</td>
                        <td className="border-b border-gray-200 px-4 py-3">Consentement de l'utilisateur</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Droits des utilisateurs
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Conformément à la nLPD, vous disposez des droits suivants :</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Droit d'accès</h4>
                    <p className="text-sm text-gray-600">Information sur les données personnelles traitées</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                    <p className="text-sm text-gray-600">Correction des données incorrectes</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Droit d'effacement</h4>
                    <p className="text-sm text-gray-600">Suppression des données dans certains cas</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Droit de limitation</h4>
                    <p className="text-sm text-gray-600">Limitation du traitement des données</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                    <p className="text-sm text-gray-600">Obtention des données dans un format structuré</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Droit d'opposition</h4>
                    <p className="text-sm text-gray-600">Opposition au traitement à certaines fins</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Exercer vos droits :</strong> Pour exercer vos droits, contactez-nous à 
                    privacy@motoauto.ch. Nous répondrons dans les 30 jours.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Sécurité des données
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données personnelles 
                  contre l'accès non autorisé, la perte, la destruction ou la divulgation.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Mesures techniques :</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Chiffrement SSL/TLS</li>
                      <li>• Chiffrement des bases de données</li>
                      <li>• Sauvegardes régulières</li>
                      <li>• Surveillance de sécurité 24/7</li>
                      <li>• Mises à jour de sécurité</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Mesures organisationnelles :</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Formation des employés</li>
                      <li>• Contrôle d'accès</li>
                      <li>• Procédures de sécurité</li>
                      <li>• Audits de sécurité</li>
                      <li>• Plan de réponse aux incidents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Cookies et technologies de suivi
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Notre site web utilise des cookies et des technologies similaires. 
                  Les informations détaillées se trouvent dans notre 
                  <Link href="/politique-cookies" className="text-blue-600 hover:text-blue-800 underline">
                    Politique de cookies
                  </Link>.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Gestion des cookies :</strong> Vous pouvez gérer les paramètres de cookies dans votre navigateur 
                    ou utiliser notre centre de préférences cookies.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Contact et réclamations
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Délégué à la protection des données</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>E-mail :</strong> privacy@motoauto.ch</p>
                    <p><strong>Téléphone :</strong> +41 44 123 45 67</p>
                    <p><strong>Adresse :</strong> MotoAuto.ch AG, Bahnhofstrasse 1, 8001 Zürich</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Droit de déposer une réclamation</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    En cas de violation des dispositions sur la protection des données, vous pouvez déposer une réclamation auprès de :
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Préposé fédéral à la protection des données et à la transparence (PFPDT)</strong></p>
                    <p>Feldeggweg 1, 3003 Berne, Suisse</p>
                    <p>E-mail : contact@edoeb.admin.ch</p>
                    <p>Tél : +41 58 462 43 95</p>
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
              href="/conditions-generales" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Conditions générales
            </Link>
            <Link 
              href="/politique-cookies" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Politique de cookies
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            Version du {lastUpdated}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}