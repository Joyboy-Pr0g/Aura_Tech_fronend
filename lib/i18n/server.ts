import { cookies } from 'next/headers';
import { ar } from './ar';
import { en, type TranslationKey } from './en';
import { DEFAULT_LOCALE, type Locale } from './locale-provider';

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get('aura-locale')?.value;
  return saved === 'en' || saved === 'ar' ? saved : DEFAULT_LOCALE;
}

export async function getServerTranslation(
  key: TranslationKey,
  params?: Record<string, string | number>,
): Promise<string> {
  const locale = await getServerLocale();
  const dictionary = locale === 'ar' ? ar : en;
  return interpolate(dictionary[key], params);
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  const dictionary = locale === 'ar' ? ar : en;

  return {
    locale,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      interpolate(dictionary[key], params),
  };
}
