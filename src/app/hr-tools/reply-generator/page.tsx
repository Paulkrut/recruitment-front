import * as React from "react";
import type { Metadata } from 'next';
import ReplyGeneratorClient from "./ReplyGeneratorClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Генератор ответа кандидату с AI | SofiHR",
  description: "Создайте профессиональный ответ кандидату за 10 секунд. Приглашение на интервью или вежливый отказ. Без регистрации.",
  keywords: [
    "генератор ответа кандидату",
    "письмо кандидату AI",
    "приглашение на собеседование",
    "отказ кандидату",
    "шаблон письма HR",
    "автоматическое письмо кандидату",
    "генератор email HR",
    "ответ соискателю",
    "бесплатный генератор писем",
  ],
  openGraph: {
    title: "Генератор ответа кандидату с AI | SofiHR",
    description: "Создайте профессиональный ответ кандидату за 10 секунд. Приглашение или отказ.",
    url: "https://sofihr.ru/hr-tools/reply-generator",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-reply-generator.jpg",
        width: 1200,
        height: 630,
        alt: "Генератор ответа кандидату SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Генератор ответа кандидату с AI",
    description: "Создайте профессиональный ответ кандидату за 10 секунд",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/reply-generator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ReplyGeneratorPage() {
  return (
    <>
      <ReplyGeneratorClient />
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Генератор ответа кандидату SofiHR",
            "description": "AI-инструмент для создания профессиональных писем кандидатам: приглашение на собеседование или вежливый отказ",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "180"
            },
            "featureList": [
              "Приглашение на собеседование",
              "Письмо с отказом",
              "Персонализация контекста",
              "Профессиональный тон",
              "Экспорт письма",
              "Без регистрации"
            ]
          })
        }}
      />
    </>
  );
}
