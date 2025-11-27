import { setupI18n, type I18n } from "@lingui/core";
// Статические импорты для production
import { messages as ruMessages } from "@/locales/ru/messages";
import { messages as enMessages } from "@/locales/en/messages";

export type SupportedLocale = "ru" | "en";

// Определяем локаль по региону
export function getLocale(): SupportedLocale {
  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

// Статическая загрузка сообщений для серверного рендеринга
function loadCatalog(locale: SupportedLocale) {
  const messages = locale === "en" ? enMessages : ruMessages;
  console.log('🔍 [appRouterI18n] loadCatalog:', {
    locale,
    messagesType: typeof messages,
    messagesKeys: messages ? Object.keys(messages).length : 0,
    firstKeys: messages ? Object.keys(messages).slice(0, 5) : [],
    sampleMessage: messages ? messages[Object.keys(messages)[0]] : null,
    isArray: Array.isArray(messages)
  });
  return messages;
}

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  console.log('🚀 [appRouterI18n] getI18nInstance called with locale:', locale);
  
  const messages = loadCatalog(locale);
  
  const i18n = setupI18n();
  
  console.log('🔧 [appRouterI18n] Before load:', {
    i18nMessages: i18n.messages,
    messagesToLoad: Object.keys(messages).slice(0, 3)
  });
  
  i18n.load(locale, messages);
  i18n.activate(locale);
  
  console.log('✅ [appRouterI18n] After load:', {
    locale: i18n.locale,
    allMessages: i18n.messages,
    messagesForLocale: i18n.messages[locale],
    messagesLoaded: Object.keys(i18n.messages[locale] || {}).length,
    messagesInCatalog: Object.keys(messages).length
  });
  
  return i18n;
}
