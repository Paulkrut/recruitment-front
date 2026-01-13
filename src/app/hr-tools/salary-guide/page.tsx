import * as React from "react";
import type { Metadata } from 'next';
import SalaryGuideClient from "./SalaryGuideClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Зарплатный гид 2026 с AI | SofiHR",
  description: "Узнайте актуальный уровень зарплат для любой позиции в России. AI-анализ рынка труда 2025-2026: зарплатные вилки, тренды, сравнение по городам. Без регистрации.",
  keywords: [
    "зарплатный гид",
    "уровень зарплат",
    "зарплаты в IT",
    "зарплатная вилка",
    "сколько зарабатывают",
    "рынок труда России",
    "зарплаты 2026",
    "средняя зарплата",
    "сравнение зарплат по городам",
  ],
  openGraph: {
    title: "Зарплатный гид 2026 с AI | SofiHR",
    description: "Узнайте актуальный уровень зарплат для любой позиции. Данные по рынку труда России.",
    url: "https://sofihr.ru/hr-tools/salary-guide",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-salary-guide.jpg",
        width: 1200,
        height: 630,
        alt: "Зарплатный гид SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Зарплатный гид 2026 с AI",
    description: "Узнайте актуальный уровень зарплат для любой позиции",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/salary-guide",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SalaryGuidePage() {
  return (
    <>
      <SalaryGuideClient />
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Зарплатный гид SofiHR",
            "description": "AI-инструмент для анализа уровня зарплат по всем городам России: зарплатные вилки, тренды рынка, сравнение по городам",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.6",
              "ratingCount": "95"
            },
            "featureList": [
              "Зарплатные вилки по позициям",
              "Тренды рынка труда",
              "Сравнение по городам",
              "Анализ факторов влияния",
              "Актуальные данные 2025-2026",
              "Экспорт результатов",
              "Без регистрации"
            ]
          })
        }}
      />
    </>
  );
}
