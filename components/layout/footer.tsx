import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              MotoAuto<span className="text-red-500">.ch</span>
            </h3>
            <p className="text-gray-400">Największa platforma sprzedaży samochodów i motocykli w Szwajcarii.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kategorie</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/ogloszenia?category=moto" className="hover:text-white transition-colors">
                  Motocykle
                </Link>
              </li>
              <li>
                <Link href="/ogloszenia?category=auto" className="hover:text-white transition-colors">
                  Samochody
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

          <div>
            <h4 className="font-semibold mb-4">Pomoc</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/jak-to-dziala" className="hover:text-white transition-colors">
                  Jak to działa
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

          <div>
            <h4 className="font-semibold mb-4">Śledź nas</h4>
            <div className="flex space-x-4">
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
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MotoAuto.ch. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
