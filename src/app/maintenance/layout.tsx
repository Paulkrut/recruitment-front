import type { Metadata } from 'next';
import MaintenanceThemeProvider from './ThemeProvider';

// Динамическая генерация metadata с переводами
export async function generateMetadata(): Promise<Metadata> {
  const locale = process.env.NEXT_PUBLIC_REGION === 'US' ? 'en' : 'ru';
  
  // Загружаем переводы из скомпилированных .js файлов
  // Используем относительный путь вместо алиаса @/
  const { i18n } = await import('@lingui/core');
  
  try {
    const catalog = locale === 'en' 
      ? await import('../../locales/en/messages.js')
      : await import('../../locales/ru/messages.js');
    
    // Обрабатываем CommonJS формат
    const messages = catalog.messages || catalog.default?.messages || catalog.default || catalog;
    
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (error) {
    console.error('Failed to load maintenance translations:', error);
  }

  const titles = {
    ru: "Технические работы - Сайт временно недоступен",
    en: "Maintenance - Site Temporarily Unavailable"
  };
  
  const descriptions = {
    ru: "Мы проводим плановые технические работы. Сайт скоро будет доступен.",
    en: "We are performing scheduled maintenance. The site will be available soon."
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    robots: 'noindex, nofollow',
  };
}

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = process.env.NEXT_PUBLIC_REGION === 'US' ? 'en' : 'ru';

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body>
        <MaintenanceThemeProvider>
          {children}
        </MaintenanceThemeProvider>
      </body>
    </html>
  );
} 