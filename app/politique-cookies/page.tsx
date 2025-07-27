import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Globe, Calendar, Cookie, ArrowLeft, Printer, Settings, BarChart, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Politique de cookies MotoAuto.ch | Informations sur les cookies",
  description: "Politique de cookies de MotoAuto.ch - informations sur l'utilisation des cookies et technologies similaires conformément au droit suisse et au RGPD.",
  keywords: ["cookies", "politique de cookies", "suivi", "MotoAuto.ch", "confidentialité", "vie privée"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Politique de cookies MotoAuto.ch",
    description: "Informations sur l'utilisation des cookies sur la plateforme MotoAuto.ch",
    type: "article",
    locale: "fr_CH",
  },
  alternates: {
    languages: {
      'de': '/cookie-richtlinie',
      'fr': '/politique-cookies',
      'pl': '/cookies'
    }
  }
}

export default function CookiesPolicyPageFR() {
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
              <Link href="/cookie-richtlinie" className="text-sm text-gray-600 hover:text-gray-900">DE</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-medium text-blue-600">FR</span>
              <span className="text-gray-300">|</span>
              <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">PL</Link>
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
            <Cookie className="w-8 h-8 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Politique de cookies MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Dernière mise à jour : {lastUpdated}</span>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-orange-800 text-sm">
              <strong>Gestion des cookies :</strong> Vous pouvez gérer vos préférences de cookies 
              dans les paramètres de votre navigateur ou en utilisant notre centre de préférences.
            </p>
          </div>
        </header>

        {/* Cookie Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Centre de préférences cookies</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Settings className="w-4 h-4 mr-2" />
              Gérer les paramètres
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            Cliquez sur le bouton ci-dessus pour personnaliser vos préférences de cookies. 
            Vous pouvez choisir quelles catégories de cookies vous souhaitez accepter.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Table des matières</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Que sont les cookies</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Types de cookies</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Cookies nécessaires</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Cookies fonctionnels</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Cookies analytiques</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Cookies marketing</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Cookies tiers</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Gestion des cookies</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Mises à jour de la politique</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Contact</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Que sont les cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Les cookies sont de petits fichiers texte qui sont stockés sur votre appareil (ordinateur, tablette, smartphone) 
                  lorsque vous visitez notre site web. Les cookies nous aident à offrir une meilleure expérience utilisateur 
                  et permettent le bon fonctionnement du site.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Technologies similaires</h3>
                  <p className="text-sm text-gray-600">
                    En plus des cookies, nous utilisons également des technologies similaires telles que les web beacons, 
                    les pixels de suivi, le stockage local et le stockage de session, qui servent des objectifs similaires.
                  </p>
                </div>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Base juridique :</strong> Art. 45c nLPD ainsi que le Règlement ePrivacy (pour les utilisateurs UE)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Types de cookies selon la durée de stockage
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Cookies de session</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Supprimés à la fermeture du navigateur</li>
                      <li>• Nécessaires au fonctionnement de base</li>
                      <li>• Stockent les données uniquement pendant la session</li>
                      <li>• Ne nécessitent pas le consentement de l'utilisateur</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Cookies persistants</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Restent après la fermeture du navigateur</li>
                      <li>• Ont une durée d'expiration déterminée</li>
                      <li>• Mémorisent les préférences de l'utilisateur</li>
                      <li>• Peuvent nécessiter le consentement de l'utilisateur</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Cookies selon l'origine :</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Cookies propres (first-party)</h4>
                      <p className="text-sm text-gray-600">Définis directement par MotoAuto.ch</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Cookies tiers (third-party)</h4>
                      <p className="text-sm text-gray-600">Définis par des prestataires de services externes</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Cookies nécessaires
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Toujours actifs - aucun consentement requis</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Ces cookies sont nécessaires au fonctionnement de base du site et ne peuvent pas être désactivés.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Nom</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Objectif</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Durée de stockage</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">session_id</td>
                        <td className="border-b border-gray-200 px-4 py-3">Identification de la session utilisateur</td>
                        <td className="border-b border-gray-200 px-4 py-3">Session</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">csrf_token</td>
                        <td className="border-b border-gray-200 px-4 py-3">Protection contre les attaques CSRF</td>
                        <td className="border-b border-gray-200 px-4 py-3">Session</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">auth_token</td>
                        <td className="border-b border-gray-200 px-4 py-3">Authentification de l'utilisateur</td>
                        <td className="border-b border-gray-200 px-4 py-3">30 jours</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono">cookie_consent</td>
                        <td className="border-b border-gray-200 px-4 py-3">Mémorisation des préférences cookies</td>
                        <td className="border-b border-gray-200 px-4 py-3">1 an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Cookies fonctionnels
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Optionnels - consentement requis</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Ces cookies améliorent la fonctionnalité du site et mémorisent vos préférences.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Préférences linguistiques</h4>
                    <p className="text-sm text-gray-600">Mémorisation de la langue d'interface choisie (FR/DE/PL/EN)</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Filtres de recherche</h4>
                    <p className="text-sm text-gray-600">Sauvegarde des paramètres de filtres pour la recherche de véhicules</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Annonces favorites</h4>
                    <p className="text-sm text-gray-600">Stockage de la liste des véhicules favoris</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Paramètres d'affichage</h4>
                    <p className="text-sm text-gray-600">Préférences concernant la mise en page et le nombre de résultats</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Cookies analytiques
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <BarChart className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-800">Optionnels - consentement requis</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Ces cookies nous aident à comprendre comment les utilisateurs utilisent notre site.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Fournisseur</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Objectif</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Durée de stockage</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Google Analytics</td>
                        <td className="border-b border-gray-200 px-4 py-3">Analyse du trafic et du comportement des utilisateurs</td>
                        <td className="border-b border-gray-200 px-4 py-3">2 ans</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Hotjar</td>
                        <td className="border-b border-gray-200 px-4 py-3">Cartes de chaleur et enregistrements de sessions</td>
                        <td className="border-b border-gray-200 px-4 py-3">1 an</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">MotoAuto Analytics</td>
                        <td className="border-b border-gray-200 px-4 py-3">Analyse interne des performances</td>
                        <td className="border-b border-gray-200 px-4 py-3">6 mois</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 border-l-4 border-purple-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Anonymisation des données :</strong> Toutes les données analytiques sont anonymisées et 
                    ne permettent pas l'identification d'utilisateurs individuels.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Cookies marketing
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">Optionnels - consentement requis</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Ces cookies servent à afficher des publicités personnalisées et à suivre leur efficacité.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Remarketing</h4>
                    <p className="text-sm text-gray-600">Affichage de publicités sur d'autres sites web basé sur votre activité</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Personnalisation publicitaire</h4>
                    <p className="text-sm text-gray-600">Adaptation du contenu publicitaire à vos intérêts</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Mesure d'efficacité</h4>
                    <p className="text-sm text-gray-600">Suivi des conversions et de l'efficacité des campagnes publicitaires</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note :</strong> Vous pouvez retirer votre consentement pour les cookies marketing à tout moment 
                    dans le centre de préférences cookies.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Cookies tiers
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Certains cookies sont définis par des prestataires de services externes que nous utilisons sur notre site :
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Fournisseurs de paiement</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Stripe (traitement des paiements)</li>
                      <li>• PayPal (paiements en ligne)</li>
                      <li>• PostFinance (paiements suisses)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Médias sociaux</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Facebook (boutons de partage)</li>
                      <li>• Twitter (intégration de tweets)</li>
                      <li>• YouTube (lecteurs vidéo)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Cartes et localisation</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Google Maps (affichage de cartes)</li>
                      <li>• OpenStreetMap (cartes alternatives)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Support client</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Zendesk (système de tickets)</li>
                      <li>• Intercom (chat en direct)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Politiques de confidentialité tierces :</strong> Chacun des fournisseurs mentionnés a sa propre 
                    politique de confidentialité, consultable sur leurs sites web respectifs.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Gestion des cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Vous avez un contrôle total sur les cookies utilisés sur notre site :</p>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Centre de préférences</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Utilisez notre centre de préférences cookies pour personnaliser les paramètres.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Ouvrir le centre de préférences
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Paramètres du navigateur</h4>
                    <p className="text-sm text-gray-600">
                      Vous pouvez également gérer les cookies directement dans les paramètres de votre navigateur.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Instructions pour les navigateurs populaires :</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Google Chrome</h5>
                      <p className="text-sm text-gray-600">Paramètres → Confidentialité et sécurité → Cookies et autres données de site</p>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Mozilla Firefox</h5>
                      <p className="text-sm text-gray-600">Paramètres → Vie privée et sécurité → Cookies et données de sites</p>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Safari</h5>
                      <p className="text-sm text-gray-600">Préférences → Confidentialité → Gérer les données de sites web</p>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h5 className="font-medium text-gray-900">Microsoft Edge</h5>
                      <p className="text-sm text-gray-600">Paramètres → Cookies et autorisations de site → Gérer les cookies</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note :</strong> La désactivation des cookies peut affecter la fonctionnalité du site. 
                    Certaines fonctionnalités peuvent ne pas fonctionner correctement.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Mises à jour de la politique cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Cette politique de cookies peut être mise à jour périodiquement pour refléter
                  les changements dans nos pratiques ou pour des raisons opérationnelles, légales ou réglementaires.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Notifications des changements</h4>
                  <p className="text-sm text-gray-600">
                    Nous informons des changements importants de la politique de cookies par :
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Notification sur la page d'accueil</li>
                    <li>• E-mail aux utilisateurs enregistrés</li>
                    <li>• Mise à jour de la date "dernière mise à jour"</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Contact
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Si vous avez des questions concernant notre politique de cookies, contactez-nous :
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">MotoAuto.ch AG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Adresse :</strong> Bahnhofstrasse 1, 8001 Zürich, Suisse</p>
                    <p><strong>E-mail :</strong> privacy@motoauto.ch</p>
                    <p><strong>Téléphone :</strong> +41 44 123 45 67</p>
                    <p><strong>Formulaire de contact :</strong> <Link href="/kontakt" className="text-blue-600 hover:text-blue-800 underline">motoauto.ch/contact</Link></p>
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
              href="/politique-confidentialite"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Politique de confidentialité
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