import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, FileText, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Conditions générales du site MotoAuto.ch | Conditions d'utilisation",
  description: "Conditions générales d'utilisation de MotoAuto.ch - conditions d'utilisation de la plateforme de vente de véhicules en Suisse conformément au droit suisse.",
  keywords: ["conditions générales", "CGU", "MotoAuto.ch", "droit suisse", "CO", "nLPD"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Conditions générales du site MotoAuto.ch",
    description: "Conditions d'utilisation de la plateforme MotoAuto.ch conformes au droit suisse",
    type: "article",
    locale: "fr_CH",
  },
  alternates: {
    languages: {
      'de': '/nutzungsbedingungen',
      'fr': '/conditions-generales',
      'pl': '/regulamin'
    }
  }
}

export default function TermsOfServicePageFR() {
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
              <Link href="/nutzungsbedingungen" className="text-sm text-gray-600 hover:text-gray-900">DE</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-medium text-blue-600">FR</span>
              <span className="text-gray-300">|</span>
              <Link href="/regulamin" className="text-sm text-gray-600 hover:text-gray-900">PL</Link>
            </div>
            
            {/* Print Button */}
            <PrintButton label="Imprimer" />
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Conditions générales du site MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Dernière mise à jour : {lastUpdated}</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Information juridique :</strong> Ces conditions générales sont conformes au droit suisse, 
              notamment au Code des obligations (CO) et à la nouvelle Loi fédérale sur la protection des données (nLPD).
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Table des matières</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Dispositions générales</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Définitions</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Inscription et compte utilisateur</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Règles d'utilisation</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Annonces et enchères</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Paiements et commissions</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Responsabilité</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Protection des données</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Dispositions finales</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Contact</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Dispositions générales
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Les présentes conditions générales régissent l'utilisation de la plateforme internet MotoAuto.ch 
                  (ci-après : "la Plateforme"), exploitée par MotoAuto.ch AG, société ayant son siège à Zurich, Suisse.
                </p>
                <p>
                  L'utilisation de la Plateforme implique l'acceptation intégrale de ces conditions générales. 
                  Les conditions sont conformes au droit suisse, notamment au Code des obligations (CO).
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Base juridique :</strong> Art. 1-40 CO (Code des obligations de la Suisse)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Définitions
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Dans les présentes conditions générales, les termes suivants signifient :</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Plateforme</strong> - la plateforme internet MotoAuto.ch</li>
                  <li><strong>Utilisateur</strong> - personne utilisant la Plateforme</li>
                  <li><strong>Vendeur</strong> - utilisateur proposant un véhicule à la vente</li>
                  <li><strong>Acheteur</strong> - utilisateur intéressé par l'achat d'un véhicule</li>
                  <li><strong>Annonce</strong> - offre de vente d'un véhicule</li>
                  <li><strong>Enchère</strong> - vente de véhicule sous forme d'enchères</li>
                </ul>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Inscription et compte utilisateur
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Pour utiliser toutes les fonctionnalités de la Plateforme, l'utilisateur doit créer un compte. 
                  L'inscription est gratuite et nécessite la fourniture de données personnelles véridiques.
                </p>
                <p>
                  L'utilisateur s'engage à :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fournir des données véridiques et actuelles lors de l'inscription</li>
                  <li>Maintenir la confidentialité des données de connexion</li>
                  <li>Signaler immédiatement tout accès non autorisé au compte</li>
                  <li>Mettre à jour les données personnelles en cas de changement</li>
                </ul>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Règles d'utilisation
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>L'utilisateur s'engage à utiliser la Plateforme conformément à la loi et de bonne foi.</p>
                <p><strong>Il est interdit de :</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Publier des informations fausses sur les véhicules</li>
                  <li>Violer les droits d'auteur et la propriété intellectuelle</li>
                  <li>Utiliser la Plateforme pour des activités illégales</li>
                  <li>Tenter de pirater ou perturber le fonctionnement de la Plateforme</li>
                  <li>Envoyer du spam et des messages non sollicités</li>
                </ul>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Annonces et enchères
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Les vendeurs peuvent publier des annonces de vente de véhicules et organiser des enchères. 
                  Toutes les annonces doivent contenir des informations véridiques sur le véhicule.
                </p>
                <p><strong>Exigences pour les annonces :</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Photos authentiques du véhicule</li>
                  <li>Description précise de l'état technique</li>
                  <li>Informations sur l'historique du véhicule</li>
                  <li>Prix actuel ou mise à prix</li>
                </ul>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Paiements et commissions
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  La Plateforme prélève des commissions sur les transactions réussies. Tous les paiements sont 
                  effectués en francs suisses (CHF) selon le tarif en vigueur.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note :</strong> La commission n'est prélevée qu'en cas de vente réussie du véhicule.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Responsabilité
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  MotoAuto.ch AG agit comme intermédiaire entre vendeurs et acheteurs. 
                  La responsabilité de l'état juridique et technique des véhicules incombe au vendeur.
                </p>
                <p>
                  La Plateforme n'est pas responsable de :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Informations fausses fournies par les utilisateurs</li>
                  <li>Litiges entre utilisateurs</li>
                  <li>Dommages résultant de l'utilisation de la Plateforme</li>
                  <li>Interruptions du fonctionnement de la Plateforme</li>
                </ul>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Protection des données
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Le traitement des données personnelles s'effectue conformément à la nouvelle Loi fédérale 
                  sur la protection des données (nLPD) et à notre Politique de confidentialité.
                </p>
                <p>
                  Les informations détaillées sur le traitement des données se trouvent dans notre 
                  <Link href="/politique-confidentialite" className="text-blue-600 hover:text-blue-800 underline">
                    Politique de confidentialité
                  </Link>.
                </p>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Dispositions finales
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Les conditions générales peuvent être modifiées. Les utilisateurs seront informés 
                  des modifications avec un préavis de 30 jours.
                </p>
                <p>
                  Pour les questions non réglées par les présentes conditions générales, le droit suisse s'applique. 
                  Tous les litiges seront tranchés par les tribunaux de Zurich.
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>For compétent :</strong> Tribunaux de Zurich, Suisse
                  </p>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Contact
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">MotoAuto.ch AG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Adresse :</strong> Bahnhofstrasse 1, 8001 Zürich, Suisse</p>
                    <p><strong>Téléphone :</strong> +41 44 123 45 67</p>
                    <p><strong>E-mail :</strong> contact@motoauto.ch</p>
                    <p><strong>Numéro d'inscription au registre du commerce :</strong> CHE-123.456.789</p>
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
              href="/politique-confidentialite" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Politique de confidentialité
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