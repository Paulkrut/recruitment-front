import * as React from "react";
import type { Metadata } from 'next';
import QuestionGeneratorClient from "./QuestionGeneratorClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Генератор вопросов для собеседования с AI | SofiHR",
  description: "Создайте профессиональные вопросы для интервью за 30 секунд. AI сгенерирует релевантные вопросы на основе описания вакансии и резюме кандидата. Без регистрации.",
  keywords: [
    "генератор вопросов для собеседования",
    "вопросы для интервью AI",
    "вопросы для собеседования онлайн",
    "генератор вопросов HR",
    "AI вопросы для собеседования",
    "автоматическая генерация вопросов",
    "инструменты для HR",
    "подготовка к интервью",
    "бесплатный генератор вопросов",
  ],
  openGraph: {
    title: "Генератор вопросов для собеседования с AI | SofiHR",
    description: "Создайте профессиональные вопросы для интервью за 30 секунд. Бесплатно и без регистрации.",
    url: "https://sofihr.ru/hr-tools/question-generator",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-question-generator.jpg",
        width: 1200,
        height: 630,
        alt: "Генератор вопросов для собеседования SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Генератор вопросов для собеседования с AI",
    description: "Создайте профессиональные вопросы для интервью за 30 секунд",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/question-generator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QuestionGeneratorPage() {
  return (
    <>
      <QuestionGeneratorClient />
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Генератор вопросов для собеседования SofiHR",
            "description": "AI-инструмент для автоматической генерации профессиональных вопросов для собеседования на основе описания вакансии",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "150"
            },
            "featureList": [
              "Генерация вопросов с учетом Hard Skills",
              "Генерация вопросов с учетом Soft Skills",
              "Генерация ситуационных вопросов",
              "Персонализация под резюме кандидата",
              "Экспорт в текстовый файл",
              "Без регистрации"
            ]
          })
        }}
      />
    </>
  );
}
