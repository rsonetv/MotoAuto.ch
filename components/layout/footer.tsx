import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-responsive-xl font-bold mb-4">
              MotoAuto<span className="text-red-500">.ch</span>
            </h3>
            <p className="text-gray-400 mb-4 text-responsive-sm leading-relaxed">
              Największa platforma sprzedaży samochodów i motocykli w Szwajcarii. Ponad 10,000 aktywnych ogłoszeń od
              zweryfikowanych sprzedawców.
            </p>
            <div className="space-y-2 text-responsive-sm">
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <a href="tel:+41441234567" className="hover:text-white transition-colors">
                  +41 44 123 45 67
                </a>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <a href="mailto:kontakt@motoauto.ch" className="hover:text-white transition-colors">
                  kontakt@motoauto.ch
                </a>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>Zürich, Szwajcaria</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-responsive-lg">Kategorie</h4>
            <ul className="space-y-2 text-gray-400 text-responsive-sm">
              <li>
                <Link href="/ogloszenia?category=auto" className="hover:text-white transition-colors">
                  Samochody osobowe
                </Link>
              </li>
              <li>
                <Link href="/ogloszenia?category=auto&type=dostawczy" className="hover:text-white transition-colors">
                  Samochody dostawcze
                </Link>
              </li>
              <li>
                <Link href="/ogloszenia?category=moto" className="hover:text-white transition-colors">
                  Motocykle
                </Link>
              </li>
              <li>
                <Link href="/ogloszenia?category=moto&type=skuter" className="hover:text-white transition-colors">
                  Skutery
                </Link>
              </li>
              <li>
                <Link href="/aukcje" className="hover:text-white transition-colors">
                  Aukcje
                </Link>
              </li>
              <li>
                <Link href="/dealerzy" className="hover:text-white transition-colors">
                  Dealerzy
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="font-semibold mb-4 text-responsive-lg">Pomoc i wsparcie</h4>
            <ul className="space-y-2 text-gray-400 text-responsive-sm">
              <li>
                <Link href="/jak-to-dziala" className="hover:text-white transition-colors">
                  Jak to działa
                </Link>
              </li>
              <li>
                <Link href="/cennik" className="hover:text-white transition-colors">
                  Cennik
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Często zadawane pytania
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Regulamin
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-responsive-lg">Śledź nas</h4>
            <div className="flex space-x-4 mb-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>

            <div>
              <h5 className="font-medium mb-2 text-responsive-base">Newsletter</h5>
              <p className="text-gray-400 text-responsive-sm mb-3">Otrzymuj najnowsze oferty na email</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Twój email"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm font-medium">
                  Zapisz się
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-responsive-sm text-center sm:text-left">
              &copy; 2024 MotoAuto.ch. Wszystkie prawa zastrzeżone.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-responsive-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Prywatność
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Regulamin
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                Mapa strony
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
