"use client";

// @ts-ignore - I18nProvider существует в runtime
import { I18nProvider } from "@lingui/react";
import { type Messages, setupI18n } from "@lingui/core";
import { useMemo } from "react";

type LinguiProviderProps = {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: Messages;
};

export function LinguiProvider({
  children,
  initialLocale,
  initialMessages,
}: LinguiProviderProps) {
  // Создаём экземпляр i18n один раз с сообщениями от сервера
  const i18n = useMemo(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    });
  }, [initialLocale, initialMessages]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}


