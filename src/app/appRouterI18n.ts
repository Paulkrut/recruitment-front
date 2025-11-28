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
  const messages = loadCatalog(locale);
  
  // Используем правильный способ загрузки скомпилированных каталогов
  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });
  
  return i18n;
}
