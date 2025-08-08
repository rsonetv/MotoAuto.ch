import type React from "react"
import type { Metadata } from "next/server"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import "../globals.css"
import { Toaster } from "sonner"
import { QueryProvider } from "../providers/query-provider"
import { generateHreflangLinks } from '../../lib/i18n/utils';

const inter = Inter({ subsets: ["latin"] })

type Props = {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale }
}: Props): Promise<Metadata> {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL("https://motoauto.ch"),
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: "MotoAuto.ch" }],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: "https://motoauto.ch",
      siteName: "MotoAuto.ch",
      locale: locale,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: locale === 'pl' ? 'https://motoauto.ch' : `https://motoauto.ch/${locale}`,
      languages: {
        'x-default': 'https://motoauto.ch',
        'pl': 'https://motoauto.ch',
        'de': 'https://motoauto.ch/de',
        'fr': 'https://motoauto.ch/fr',
        'en': 'https://motoauto.ch/en',
        'it': 'https://motoauto.ch/it',
      }
    },
    generator: 'Next.js',
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
      <head>
        {/* Add hreflang links for SEO */}
        {generateHreflangLinks('').map(({ hreflang, href }) => (
          <link
            key={hreflang}
            rel="alternate"
            hrefLang={hreflang}
            href={href}
          />
        ))}
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}