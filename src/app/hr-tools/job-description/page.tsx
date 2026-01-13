import * as React from "react";
import type { Metadata } from 'next';
import JobDescriptionClient from "./JobDescriptionClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Генератор описания вакансии с AI | SofiHR",
  description: "Создайте полное описание вакансии за минуту с помощью AI. Укажите должность и уровень — получите готовый текст для публикации на job-сайтах. Без регистрации.",
  keywords: [
    "генератор вакансий",
    "описание вакансии AI",
    "создать вакансию онлайн",
    "генератор описания работы",
    "AI для HR",
    "автоматическое создание вакансии",
    "текст вакансии",
    "требования к кандидату",
    "бесплатный генератор вакансий",
  ],
  openGraph: {
    title: "Генератор описания вакансии с AI | SofiHR",
    description: "Создайте полное описание вакансии за минуту. Бесплатно и без регистрации.",
    url: "https://sofihr.ru/hr-tools/job-description",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-job-description.jpg",
        width: 1200,
        height: 630,
        alt: "Генератор вакансий SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Генератор описания вакансии с AI",
    description: "Создайте полное описание вакансии за минуту",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/job-description",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function JobDescriptionPage() {
  return (
    <>
      <JobDescriptionClient />
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Генератор описания вакансии SofiHR",
            "description": "AI-инструмент для автоматического создания полного описания вакансии: обязанности, требования, условия работы",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "ratingCount": "120"
            },
            "featureList": [
              "Генерация обязанностей",
              "Генерация требований",
              "Генерация условий работы",
              "Настройка уровня (Junior/Middle/Senior/Lead)",
              "Экспорт в текстовый файл",
              "Без регистрации"
            ]
          })
        }}
      />
    </>
  );
}
