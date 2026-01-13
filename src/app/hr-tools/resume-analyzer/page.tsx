import * as React from "react";
import type { Metadata } from 'next';
import ResumeAnalyzerClient from "./ResumeAnalyzerClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Анализатор резюме с AI | SofiHR",
  description: "Получите AI-анализ резюме кандидата за минуту. Оценка опыта, навыков и соответствия вакансии. Без регистрации.",
  keywords: [
    "анализатор резюме",
    "проверка резюме AI",
    "анализ резюме онлайн",
    "оценка кандидата",
    "AI для HR",
    "соответствие резюме вакансии",
    "проверка CV",
    "анализ опыта кандидата",
    "бесплатный анализатор резюме",
  ],
  openGraph: {
    title: "Анализатор резюме с AI | SofiHR",
    description: "Получите AI-анализ резюме кандидата за минуту. Оценка опыта, навыков и соответствия вакансии.",
    url: "https://sofihr.ru/hr-tools/resume-analyzer",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-resume-analyzer.jpg",
        width: 1200,
        height: 630,
        alt: "Анализатор резюме SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Анализатор резюме с AI",
    description: "Получите AI-анализ резюме кандидата за минуту",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/resume-analyzer",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ResumeAnalyzerPage() {
  return (
    <>
      <ResumeAnalyzerClient />
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Анализатор резюме SofiHR",
            "description": "AI-инструмент для анализа резюме кандидата: оценка опыта, навыков, сильных сторон и соответствия вакансии",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "200"
            },
            "featureList": [
              "Анализ опыта работы",
              "Оценка навыков кандидата",
              "Процент соответствия вакансии",
              "Выявление сильных сторон",
              "Рекомендации по улучшению",
              "Экспорт результатов",
              "Без регистрации"
            ]
          })
        }}
      />
    </>
  );
}
