'use client';

import { i18n } from '@lingui/core';
import { useEffect, useState } from 'react';
import { getCurrentLocale, loadCatalogSync, type SupportedLocale } from '@/utils/i18n';

// @ts-ignore - TypeScript не видит экспорт, но он есть в runtime
import { I18nProvider } from '@lingui/react';

interface LinguiProviderProps {
  children: React.ReactNode;
}

// Инициализируем i18n синхронно при загрузке модуля
// Это гарантирует, что i18n доступен до первого рендера
if (typeof window !== 'undefined') {
  const initialLocale = getCurrentLocale();
  loadCatalogSync(initialLocale);
}

export function LinguiProvider({ children }: LinguiProviderProps) {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (typeof window !== 'undefined') {
      return getCurrentLocale();
    }
    return 'ru';
  });

  useEffect(() => {
    // Проверяем, нужно ли переключить локаль
    const currentLocale = getCurrentLocale();
    if (currentLocale !== locale) {
      loadCatalogSync(currentLocale);
      setLocale(currentLocale);
    }
  }, [locale]);

  // Всегда рендерим I18nProvider с уже инициализированным i18n
  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  );
}


