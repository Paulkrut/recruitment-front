import { i18n } from '@lingui/core';
import { messages as ruMessages } from '@/locales/ru/messages';
import { messages as enMessages } from '@/locales/en/messages';

export type SupportedLocale = 'ru' | 'en';

export const locales: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English',
};

export const defaultLocale: SupportedLocale = 'ru';

/**
 * Синхронная загрузка каталога переводов (для начальной инициализации)
 */
export function loadCatalogSync(locale: SupportedLocale) {
  const messages = locale === 'en' ? enMessages : ruMessages;
  i18n.load(locale, messages);
  i18n.activate(locale);
}

/**
 * Динамически загружает каталог переводов для указанной локали
 */
export async function loadCatalog(locale: SupportedLocale) {
  // Используем скомпилированные .js файлы вместо .po
  const { messages } = await import(
    `@/locales/${locale}/messages.js`
  );

  i18n.load(locale, messages);
  i18n.activate(locale);
}

/**
 * Определяет язык по домену
 * Примеры:
 * - sofihr.ru -> 'ru'
 * - sofihr.com -> 'en'
 * - localhost -> 'ru' (по умолчанию)
 */
export function getLocaleFromHostname(hostname: string): SupportedLocale {
  // Для независимого домена возвращаем английский
  if (hostname.includes('.com') || hostname.includes('en.')) {
    return 'en';
  }
  
  // По умолчанию русский
  return 'ru';
}

/**
 * Получает текущую локаль из браузера или cookies
 */
export function getCurrentLocale(): SupportedLocale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const locale = getLocaleFromHostname(window.location.hostname);
  return locale;
}

/**
 * Инициализирует i18n с указанной локалью
 */
export async function initI18n(locale: SupportedLocale = defaultLocale) {
  await loadCatalog(locale);
  return i18n;
}
