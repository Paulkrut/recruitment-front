import { i18n } from '@lingui/core';

export type SupportedLocale = 'ru' | 'en';

export const locales: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English',
};

export const defaultLocale: SupportedLocale = 'ru';

/**
 * Динамически загружает каталог переводов для указанной локали
 */
export async function loadCatalog(locale: SupportedLocale) {
  try {
    // Используем относительный путь вместо алиаса @/
    const catalog = await import(`../locales/${locale}/messages.js`);
    
    // Обрабатываем CommonJS формат
    const messages = catalog.messages || catalog.default?.messages || catalog.default || catalog;
    
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (error) {
    console.error(`Failed to load catalog for locale ${locale}:`, error);
  }
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
