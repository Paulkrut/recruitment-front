'use client';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState } from 'react';
import { getCurrentLocale, initI18n, type SupportedLocale } from '@/utils/i18n';

interface LinguiProviderProps {
  children: React.ReactNode;
}

export function LinguiProvider({ children }: LinguiProviderProps) {
  const [locale, setLocale] = useState<SupportedLocale>('ru');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLocale() {
      const currentLocale = getCurrentLocale();
      await initI18n(currentLocale);
      setLocale(currentLocale);
      setIsLoading(false);
    }

    loadLocale();
  }, []);

  if (isLoading) {
    return null; // или loader
  }

  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  );
}


