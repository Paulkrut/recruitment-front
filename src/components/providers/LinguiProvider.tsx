'use client';

import { useEffect, useState } from 'react';
import { getCurrentLocale, initI18n } from '@/utils/i18n';

interface LinguiProviderProps {
  children: React.ReactNode;
}

/**
 * LinguiProvider инициализирует i18n глобально
 * В LinguiJS v5 не требуется оборачивать в I18nProvider,
 * так как i18n настраивается глобально
 */
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
    return null; // или loader
  }

  return <>{children}</>;
}


