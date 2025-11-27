import { setupI18n, type I18n } from "@lingui/core";

export type SupportedLocale = "ru" | "en";

// Определяем локаль по региону
export function getLocale(): SupportedLocale {
  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

// Асинхронная загрузка сообщений для серверного рендеринга
async function loadCatalog(locale: SupportedLocale) {
  const messagesModule = await import(`@/locales/${locale}/messages.js`);
  // messages.js использует CommonJS: module.exports = {messages: ...}
  return messagesModule.messages || messagesModule.default?.messages || {};
}

// Создаём и настраиваем экземпляр i18n для сервера
export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  const messages = await loadCatalog(locale);
  
  const i18n = setupI18n({
    locale,
    messages: { [locale]: messages },
  });
  
  return i18n;
}
