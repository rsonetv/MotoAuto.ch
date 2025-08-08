import type { routing } from '../i18n/routing';

export type Locale = (typeof routing.locales)[number];

export interface LocaleMetadata {
  name: string;
  nativeName: string;
  code: Locale;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  pl: {
    name: 'Polish',
    nativeName: 'Polski',
    code: 'pl',
    flag: '🇵🇱',
    dir: 'ltr'
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    code: 'de',
    flag: '🇩🇪',
    dir: 'ltr'
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    code: 'fr',
    flag: '🇫🇷',
    dir: 'ltr'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    flag: '🇬🇧',
    dir: 'ltr'
  },
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    code: 'it',
    flag: '🇮🇹',
    dir: 'ltr'
  }
};

export interface CurrencyOptions {
  locale: Locale;
  currency: 'CHF' | 'EUR' | 'USD';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface DateFormatOptions {
  locale: Locale;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
}

export interface RouteParams {
  locale: Locale;
  [key: string]: string | string[];
}