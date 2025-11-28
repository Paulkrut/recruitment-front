import React from "react";
import { setI18n } from "@lingui/react/server";
import { getI18nInstance, getLocale } from "./i18nStaticLoader"; // Используем статический загрузчик
import { Providers } from "@/store/providers";
import MyApp from "./app";
import "./global.css";
import YandexMetrika from "@/components/YandexMetrika";
import StructuredData from "@/components/StructuredData";
import CookieBanner from "@/app/components/CookieBanner";
import type { Metadata } from 'next';

// Динамическая генерация metadata с переводами
export async function generateMetadata(): Promise<Metadata> {
  // Определяем локаль по домену или переменной окружения
  const locale = process.env.NEXT_PUBLIC_REGION === 'US' ? 'en' : 'ru';
  const domain = locale === 'en' ? 'https://www.sofihr.com' : 'https://www.sofihr.ru';
  
  // Используем переводы или дефолтные значения
  const titles = {
    ru: "SofiHR - Система управления рекрутингом",
    en: "SofiHR - Recruitment Management System"
  };
  
  const descriptions = {
    ru: "Современная HR-система для управления вакансиями, кандидатами и процессами найма. Автоматизация рекрутинга с AI-оценкой кандидатов.",
    en: "Modern HR system for managing vacancies, candidates, and hiring processes. Recruitment automation with AI candidate assessment."
  };
  
  const keywords = {
    ru: "рекрутинг, HR, найм, вакансии, кандидаты, управление персоналом, автоматизация рекрутинга, AI-оценка",
    en: "recruitment, HR, hiring, vacancies, candidates, personnel management, recruitment automation, AI assessment"
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: keywords[locale],
    authors: [{ name: "SofiHR Team" }],
    creator: "SofiHR",
    publisher: "SofiHR",
    robots: "index, follow",
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      url: domain,
      siteName: "SofiHR",
      locale: locale === 'en' ? 'en_US' : 'ru_RU',
      type: "website",
      images: [
        {
          url: `${domain}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: titles[locale],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale],
      description: descriptions[locale],
      images: [`${domain}/og-image.jpg`],
    },
    alternates: {
      canonical: domain,
      languages: {
        'ru-RU': 'https://www.sofihr.ru',
        'en-US': 'https://www.sofihr.com',
      },
    },
    verification: {
      yandex: "your-yandex-verification-code",
      google: "your-google-verification-code",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  
  console.log('🏠 [layout] Starting with locale:', locale);
  
  // Инициализируем i18n для серверных компонентов
  const i18n = await getI18nInstance(locale);
  setI18n(i18n);
  
  // Получаем сообщения из i18n._messages (внутреннее поле)
  const messagesToPass = (i18n as any)._messages?.[locale] || {};
  
  console.log('📦 [layout] Messages to pass:', {
    locale,
    messagesCount: Object.keys(messagesToPass).length,
    hasMessages: Object.keys(messagesToPass).length > 0,
  });
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="msapplication-TileColor" content="#1976d2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SofiHR" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect для оптимизации */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
        
        {/* DNS prefetch */}
        <link rel="dns-prefetch" href="//mc.yandex.ru" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body>
        <Providers 
          initialLocale={locale} 
          initialMessages={messagesToPass as any}
        >
          <MyApp>{children}</MyApp>
          <CookieBanner />
        </Providers>
        <YandexMetrika />
        <StructuredData locale={locale} />
      </body>
    </html>
  );
}
