'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { en, type TranslationKey } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';
export const DEFAULT_LOCALE: Locale = 'ar';

const translations: Record<Locale, Record<TranslationKey, string>> = { en, ar };

interface LocaleContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const saved = localStorage.getItem('aura-locale') as Locale | null;
  return saved === 'en' || saved === 'ar' ? saved : DEFAULT_LOCALE;
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const resolved = resolveInitialLocale();
    setLocaleState(resolved);
    applyDocumentLocale(resolved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem('aura-locale', next);
    applyDocumentLocale(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>) => {
      const dict = translations[locale];
      const raw =
        dict[key as TranslationKey] ??
        translations.ar[key as TranslationKey] ??
        translations.en[key as TranslationKey] ??
        key;
      return interpolate(raw, params);
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, dir: locale === 'ar' ? 'rtl' : 'ltr', setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
