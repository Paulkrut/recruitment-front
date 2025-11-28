"use client";

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
  // Создаём экземпляр i18n используя useMemo для стабильности
  const i18n = useMemo(() => {
    const newI18n = setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages }
    });
    
    return newI18n;
  }, [initialLocale, initialMessages]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

