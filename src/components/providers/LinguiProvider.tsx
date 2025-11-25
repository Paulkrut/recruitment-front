'use client';

import { i18n } from '@lingui/core';
import { useEffect, useState } from 'react';
import { getCurrentLocale, initI18n } from '@/utils/i18n';

// @ts-ignore - TypeScript не видит экспорт, но он есть в runtime
import { I18nProvider } from '@lingui/react';

interface LinguiProviderProps {
  children: React.ReactNode;
}

export function LinguiProvider({ children }: LinguiProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLocale() {
      const currentLocale = getCurrentLocale();
      await initI18n(currentLocale);
      setIsLoading(false);
    }

    loadLocale();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  );
}


