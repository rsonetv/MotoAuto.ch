import { getTranslations } from 'next-intl/server';
import { HeaderI18n } from '../../components/header-i18n';
import { FooterI18n } from '../../components/footer-i18n';
import { HeroSectionI18n } from '../../components/hero-section-i18n';
import type { Metadata } from "next"

type Props = {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale }
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function HomePage({ params: { locale } }: Props) {
  return (
    <>
      <HeaderI18n />
      <main className="min-h-screen">
        <HeroSectionI18n />

        {/* Add more internationalized sections here */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Content will be internationalized */}
          </div>
        </section>
      </main>
      <FooterI18n />
    </>
  )
}