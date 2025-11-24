'use client';

import React from "react";
import { Providers } from "@/store/providers";
import MyApp from "./app";
import "./global.css";
import YandexMetrika from "@/components/YandexMetrika";
import StructuredData from "@/components/StructuredData";
import CookieBanner from "@/app/components/CookieBanner";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


export const metadata = {
  title: _(msg`SofiHR - Система управления рекрутингом`),
  description: _(msg`Современная HR-система для управления вакансиями, кандидатами и процессами найма. Автоматизация рекрутинга с AI-оценкой кандидатов.`),
  keywords: _(msg`рекрутинг, HR, найм, вакансии, кандидаты, управление персоналом, автоматизация рекрутинга, AI-оценка`),
  authors: [{ name: "SofiHR Team" }],
  creator: "SofiHR",
  publisher: "SofiHR",
  robots: "index, follow",
  openGraph: {
    title: _(msg`SofiHR - Система управления рекрутингом`),
    description: _(msg`Современная HR-система для управления вакансиями, кандидатами и процессами найма`),
    url: "https://www.sofihr.ru",
    siteName: "SofiHR",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "https://www.sofihr.ru/og-image.jpg",
        width: 1200,
        height: 630,
        alt: _(msg`SofiHR - Система управления рекрутингом`),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: _(msg`SofiHR - Система управления рекрутингом`),
    description: _(msg`Современная HR-система для управления вакансиями, кандидатами и процессами найма`),
    images: ["https://www.sofihr.ru/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.sofihr.ru",
  },
  verification: {
    yandex: "your-yandex-verification-code",
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { _ } = useLingui();

  return (
    <html lang="ru" suppressHydrationWarning>
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
        <Providers>
          <MyApp>{children}</MyApp>
        </Providers>
        <CookieBanner />
        <YandexMetrika />
        <StructuredData />
      </body>
    </html>
  );
}
