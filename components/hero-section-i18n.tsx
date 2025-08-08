'use client';

import { useTranslations } from 'next-intl';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Car, Motorcycle, Truck, Wrench } from "lucide-react";
import { Link } from '../i18n/routing';
import { Badge } from "./ui/badge";
import { useState } from "react";

export function HeroSectionI18n() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: Car,
      href: '/ogloszenia?category=cars',
      label: t('cars'),
      count: '2,547'
    },
    {
      icon: Motorcycle,
      href: '/ogloszenia?category=motorcycles',
      label: t('motorcycles'),
      count: '892'
    },
    {
      icon: Truck,
      href: '/ogloszenia?category=trucks',
      label: t('trucks'),
      count: '341'
    },
    {
      icon: Wrench,
      href: '/ogloszenia?category=parts',
      label: t('parts'),
      count: '1,205'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ogloszenia?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-background to-muted/50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 text-sm font-medium">
              🇨🇭 {t('welcomeMessage')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('heroDescription')}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <div className="flex">
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg h-14 pr-32 rounded-r-none"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="h-14 px-8 rounded-l-none"
                >
                  <Search className="h-5 w-5 mr-2" />
                  {tCommon('search')}
                </Button>
              </div>
            </div>
          </form>

          {/* Category Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-foreground">
              {t('browseCategories')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={index}
                    href={category.href}
                    className="group"
                  >
                    <div className="bg-card hover:bg-accent transition-colors p-6 rounded-lg border border-border hover:border-primary/50 text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-medium text-foreground mb-2">
                        {category.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link href="/ogloszenia">
              <Button size="lg" className="w-full md:w-auto">
                {t('recentListings')}
              </Button>
            </Link>
            <Link href="/aukcje">
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                {t('featuredListings')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">4,985</div>
                <div className="text-sm text-muted-foreground">Aktywne ogłoszenia</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">12,450</div>
                <div className="text-sm text-muted-foreground">Użytkownicy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">892</div>
                <div className="text-sm text-muted-foreground">Aukcje</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Zadowolenia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}