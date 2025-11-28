import { setupI18n, type I18n } from "@lingui/core";
// Импортируем скомпилированные каталоги целиком
import ruCatalog from "@/locales/ru/messages";
import enCatalog from "@/locales/en/messages";

export type SupportedLocale = "ru" | "en";

// Определяем локаль по региону
export function getLocale(): SupportedLocale {
  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

// Статическая загрузка сообщений для серверного рендеринга
function loadCatalog(locale: SupportedLocale) {
  const catalog = locale === "en" ? enCatalog : ruCatalog;
  // Скомпилированные каталоги LinguiJS уже в правильном формате
  // просто возвращаем их напрямую
  return catalog.messages;
}

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  console.log('🚀 [appRouterI18n] getI18nInstance called, locale:', locale);
  
  try {
    const messages = loadCatalog(locale);
    
    console.log('📥 [appRouterI18n] Creating i18n with:', {
      locale,
      messagesKeys: Object.keys(messages).length,
      firstMessage: messages[Object.keys(messages)[0]]
    });
    
    // Используем правильный способ загрузки скомпилированных каталогов
    const i18n = setupI18n({
      locale: locale,
      messages: { [locale]: messages }
    });
    
    console.log('✅ [appRouterI18n] i18n created:', {
      locale: i18n.locale,
      hasMessages: !!i18n.messages[locale],
      messagesCount: i18n.messages[locale] ? Object.keys(i18n.messages[locale]).length : 0,
      testTranslation: i18n._('L7S2Qo')
    });
    
    return i18n;
  } catch (error) {
    console.error('❌ [appRouterI18n] Error:', error);
    throw error;
  }
}
