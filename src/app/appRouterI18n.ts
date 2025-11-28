import { setupI18n, type I18n } from "@lingui/core";

export type SupportedLocale = "ru" | "en";

// Определяем локаль по региону или переменной окружения
export function getLocale(): SupportedLocale {
  // Проверяем NEXT_PUBLIC_DEFAULT_LOCALE сначала, потом NEXT_PUBLIC_REGION
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (defaultLocale === 'en' || defaultLocale === 'ru') {
    return defaultLocale;
  }
  
  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

// Статическая загрузка сообщений для серверного рендеринга
async function loadCatalog(locale: SupportedLocale) {
  try {
    console.log(`📥 [appRouterI18n] Loading catalog for locale: ${locale}`);
    
    // Динамически импортируем скомпилированные каталоги
    // Это работает на сервере после того, как lingui compile создаст файлы
    const catalog = await import(`../../locales/${locale}/messages.js`);
    
    console.log(`📦 [appRouterI18n] Catalog imported:`, {
      locale,
      hasCatalog: !!catalog,
      hasMessages: !!catalog?.messages,
      hasDefault: !!catalog?.default,
      catalogKeys: Object.keys(catalog),
    });
    
    // Обрабатываем разные форматы экспорта
    let messages;
    
    // 1. CommonJS: module.exports = {messages: {...}}
    if (catalog.messages && typeof catalog.messages === 'object') {
      messages = catalog.messages;
    }
    // 2. CommonJS с default: module.exports = {default: {messages: {...}}}
    else if (catalog.default?.messages) {
      messages = catalog.default.messages;
    }
    // 3. ES Module: export default {...}
    else if (catalog.default && typeof catalog.default === 'object') {
      messages = catalog.default;
    }
    // 4. Прямой экспорт
    else {
      messages = catalog;
    }
    
    console.log(`✅ [appRouterI18n] Messages extracted:`, {
      locale,
      messagesType: typeof messages,
      messagesCount: messages && typeof messages === 'object' ? Object.keys(messages).length : 0,
      firstKeys: messages && typeof messages === 'object' ? Object.keys(messages).slice(0, 3) : [],
    });
    
    return messages;
  } catch (error) {
    console.error(`❌ [appRouterI18n] Failed to load catalog for locale ${locale}:`, error);
    // Возвращаем пустой объект как fallback
    return {};
  }
}

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  console.log('🚀 [appRouterI18n] getI18nInstance called, locale:', locale);
  
  const messages = await loadCatalog(locale);
  
  console.log('📊 [appRouterI18n] Creating i18n with:', {
    locale,
    messagesKeys: Object.keys(messages).length,
    firstMessage: Object.values(messages).slice(0, 1),
  });
  
  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });
  
  console.log('✅ [appRouterI18n] i18n created:', {
    locale,
    hasMessages: !!(i18n as any)._messages,
    messagesCount: Object.keys((i18n as any)._messages?.[locale] || {}).length,
    testTranslation: i18n._('L7S2Qo'),
  });
  
  return i18n;
}
