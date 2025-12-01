import { setupI18n, type I18n } from "@lingui/core";

export type SupportedLocale = "ru" | "en";

// Определяем локаль по региону или переменной окружения
export function getLocale(): SupportedLocale {
  console.log('🌍 [getLocale] Environment variables:', {
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
  });

  // Проверяем NEXT_PUBLIC_DEFAULT_LOCALE сначала, потом NEXT_PUBLIC_REGION
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (defaultLocale === 'en' || defaultLocale === 'ru') {
    console.log(`✅ [getLocale] Using NEXT_PUBLIC_DEFAULT_LOCALE: ${defaultLocale}`);
    return defaultLocale;
  }

  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
  const locale = region === "US" ? "en" : "ru";
  console.log(`✅ [getLocale] Using NEXT_PUBLIC_REGION ${region} -> locale: ${locale}`);
  return locale;
}

// Статическая загрузка сообщений для серверного рендеринга
async function loadCatalog(locale: SupportedLocale) {
  try {
    console.log(`📥 [appRouterI18n] Loading catalog for locale: ${locale}`);

    // Используем @lingui/loader для прямой загрузки .po файлов
    // Это работает как в dev, так и в production, без предварительной компиляции
    const catalog = await import(
      `@lingui/loader!../locales/${locale}/messages.po`
      );

    console.log(`📦 [appRouterI18n] Catalog imported:`, {
      locale,
      hasCatalog: !!catalog,
      hasMessages: !!catalog?.messages,
      messagesCount: catalog?.messages ? Object.keys(catalog.messages).length : 0,
    });

    // @lingui/loader возвращает { messages: {...} }
    const messages = catalog.messages || {};

    console.log(`✅ [appRouterI18n] Messages extracted:`, {
      locale,
      messagesType: typeof messages,
      messagesCount: Object.keys(messages).length,
      firstKeys: Object.keys(messages).slice(0, 3),
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

