import { setupI18n, type I18n } from "@lingui/core";
import { messages as ruMessages } from "../locales/ru/messages.js";
import { messages as enMessages } from "../locales/en/messages.js";

export type SupportedLocale = "ru" | "en";

// Debug логи только в development
const isDev = process.env.NODE_ENV === 'development';
const log = isDev ? console.log : () => {};
const error = console.error; // Ошибки всегда показываем

// Определяем локаль по региону или переменной окружения
export function getLocale(): SupportedLocale {
  log('🌍 [getLocale] Environment variables:', {
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
  });

  // Проверяем NEXT_PUBLIC_DEFAULT_LOCALE сначала, потом NEXT_PUBLIC_REGION
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (defaultLocale === 'en' || defaultLocale === 'ru') {
    log(`✅ [getLocale] Using NEXT_PUBLIC_DEFAULT_LOCALE: ${defaultLocale}`);
    return defaultLocale;
  }

  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

// Каталоги сообщений
const catalogs = {
  ru: ruMessages,
  en: enMessages,
};

// Статическая загрузка сообщений для серверного рендеринга
async function loadCatalog(locale: SupportedLocale) {
  try {
    log(`📥 [appRouterI18n] Loading catalog for locale: ${locale}`);

    const messages = catalogs[locale] || {};

    log(`✅ [appRouterI18n] Messages loaded:`, {
      locale,
      messagesType: typeof messages,
      messagesCount: Object.keys(messages).length,
      firstKeys: Object.keys(messages).slice(0, 3),
    });

    return messages;
  } catch (err) {
    error(`❌ [appRouterI18n] Failed to load catalog for locale ${locale}:`, err);
    // Возвращаем пустой объект как fallback
    return {};
  }
}

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  log('🚀 [appRouterI18n] getI18nInstance called, locale:', locale);

  const messages = await loadCatalog(locale);

  log('📊 [appRouterI18n] Creating i18n with:', {
    locale,
    messagesKeys: Object.keys(messages).length,
    firstMessage: Object.values(messages).slice(0, 1),
  });

  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });

  log('✅ [appRouterI18n] i18n created:', {
    locale,
    hasMessages: !!(i18n as any)._messages,
    messagesCount: Object.keys((i18n as any)._messages?.[locale] || {}).length,
    testTranslation: i18n._('L7S2Qo'),
  });

  return i18n;
}
