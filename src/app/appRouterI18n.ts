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
  const isDev = process.env.NODE_ENV === 'development';
  
  // В dev используем скомпилированные .js файлы
  if (isDev) {
    const catalog = locale === 'en' 
      ? await import('@/locales/en/messages.js')
      : await import('@/locales/ru/messages.js');
    
    return catalog.messages || {};
  }
  
  // В production используем @lingui/loader
  try {
    const catalog = await import(
      `@lingui/loader!../locales/${locale}/messages.po`
    );
    
    return catalog.messages || {};
  } catch (error) {
    console.error(`Failed to load catalog with @lingui/loader for locale ${locale}:`, error);
    
    // Fallback на скомпилированные .js файлы
    const catalog = locale === 'en' 
      ? await import('@/locales/en/messages.js')
      : await import('@/locales/ru/messages.js');
    
    return catalog.messages || {};
  }
}

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  const messages = await loadCatalog(locale);
  
  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });
  
  return i18n;
}
