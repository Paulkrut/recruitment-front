import type { Metadata } from 'next';
import MaintenanceThemeProvider from './ThemeProvider';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


export const metadata: Metadata = {
  title: _(msg`Технические работы - Сайт временно недоступен`),
  description: _(msg`Мы проводим плановые технические работы. Сайт скоро будет доступен.`),
  robots: 'noindex, nofollow',
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { _ } = useLingui();

  return (
    <html lang="ru">
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