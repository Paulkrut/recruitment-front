import { setupI18n, type I18n } from "@lingui/core";
// Статические импорты - гарантированно работают в SSR
import ruMessages from "@/locales/ru/messages";
import enMessages from "@/locales/en/messages";

export type SupportedLocale = "ru" | "en";

// Определяем локаль по региону или переменной окружения
export function getLocale(): SupportedLocale {
  // Проверяем NEXT_PUBLIC_DEFAULT_LOCALE сначала, потом NEXT_PUBLIC_REGION
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (defaultLocale === 'en' || defaultLocale === 'ru') {
    console.log(`🌍 [i18nStaticLoader] Using NEXT_PUBLIC_DEFAULT_LOCALE: ${defaultLocale}`);
    return defaultLocale;
  }
  
  const region = process.env.NEXT_PUBLIC_REGION;
  const locale = region === "US" ? "en" : "ru";
  console.log(`🌍 [i18nStaticLoader] Using NEXT_PUBLIC_REGION ${region} -> locale: ${locale}`);
  return locale;
}

// Каталоги загружаются статически при билде
const catalogs = {
  ru: ruMessages.messages || ruMessages,
  en: enMessages.messages || enMessages,
};

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  console.log('🚀 [i18nStaticLoader] getI18nInstance called, locale:', locale);
  
  const messages = catalogs[locale];
  
  console.log('📊 [i18nStaticLoader] Messages loaded:', {
    locale,
    messagesType: typeof messages,
    messagesCount: messages && typeof messages === 'object' ? Object.keys(messages).length : 0,
    firstKeys: messages && typeof messages === 'object' ? Object.keys(messages).slice(0, 3) : [],
  });
  
  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });
  
  console.log('✅ [i18nStaticLoader] i18n created successfully');
  
  return i18n;
}

