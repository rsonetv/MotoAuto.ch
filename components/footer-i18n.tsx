'use client';

import { useTranslations } from 'next-intl';
import { Link } from '../i18n/routing';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState } from "react";

export function FooterI18n() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic here
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const footerSections = [
    {
      title: t('aboutUs'),
      links: [
        { href: '/faq', label: t('help') },
        { href: '/kontakt', label: t('contact') },
        { href: '/jak-to-dziala', label: 'Jak to działa?' },
        { href: '/cennik', label: 'Cennik' }
      ]
    },
    {
      title: 'Kategorie',
      links: [
        { href: '/ogloszenia?category=cars', label: 'Samochody' },
        { href: '/ogloszenia?category=motorcycles', label: 'Motocykle' },
        { href: '/ogloszenia?category=trucks', label: 'Ciężarówki' },
        { href: '/ogloszenia?category=parts', label: 'Części' }
      ]
    },
    {
      title: 'Konto',
      links: [
        { href: '/auth/login', label: 'Zaloguj się' },
        { href: '/auth/register', label: 'Zarejestruj się' },
        { href: '/dashboard', label: 'Panel użytkownika' },
        { href: '/watchlist', label: 'Obserwowane' }
      ]
    },
    {
      title: 'Prawne',
      links: [
        { href: '/regulamin', label: t('termsOfService') },
        { href: '/polityka-prywatnosci', label: t('privacyPolicy') },
        { href: '/cookie-richtlinie', label: t('cookiePolicy') },
        { href: '/dane-firmy', label: 'Dane firmy' }
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="text-2xl font-bold">
                  <span className="text-primary">Moto</span>
                  <span className="text-foreground">Auto</span>
                  <span className="text-destructive">.ch</span>
                </div>
              </Link>

              <p className="text-muted-foreground mb-6 max-w-md">
                Największa platforma sprzedaży samochodów i motocykli w Szwajcarii. 
                Bezpieczne transakcje, sprawdzone ogłoszenia, najlepsze ceny.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">{t('newsletter')}</h3>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Twój email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+41 44 123 45 67</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>kontakt@motoauto.ch</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Zürich, Schweiz</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-4">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2025 MotoAuto.ch. {t('allRightsReserved')}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{t('followUs')}:</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Badges/Certifications */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                SSL Secured
              </Badge>
              <Badge variant="secondary" className="text-xs">
                🇨🇭 Swiss Made
              </Badge>
            </div>
          </div>
        </div>

        {/* Additional Info Bar */}
        <div className="py-4 bg-muted/50 -mx-4 px-4">
          <div className="text-center">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground">
              <span>Licencjonowany dealer samochodowy w Szwajcarii</span>
              <Separator orientation="vertical" className="h-3" />
              <span>VAT: CHE-123.456.789 MWST</span>
              <Separator orientation="vertical" className="h-3" />
              <span>Ubezpieczony przez Swiss Insurance Group</span>
              <Separator orientation="vertical" className="h-3" />
              <Link href="/dane-firmy" className="hover:text-foreground">
                Dane firmy <ExternalLink className="h-3 w-3 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}