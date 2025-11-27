"use client";

import { I18nProvider } from "@lingui/react";
import { type Messages, setupI18n } from "@lingui/core";
import { useState } from "react";

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
  // Создаём экземпляр i18n один раз при монтировании компонента
  // useState гарантирует, что i18n создаётся только один раз
  const [i18n] = useState(() => {
    console.log('🎨 [LinguiProvider] Creating i18n:', {
      locale: initialLocale,
      messagesType: typeof initialMessages,
      messagesKeys: initialMessages ? Object.keys(initialMessages).length : 0,
      firstKeys: initialMessages ? Object.keys(initialMessages).slice(0, 5) : []
    });
    
    const newI18n = setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    });
    
    console.log('✅ [LinguiProvider] i18n created:', {
      locale: newI18n.locale,
      messagesCount: Object.keys(newI18n.messages[initialLocale] || {}).length
    });
    
    return newI18n;
  });

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}


