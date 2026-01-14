import * as React from "react";
import type { Metadata } from 'next';
import AiDetectorClient from "./AiDetectorClient";

// SEO Metadata
export const metadata: Metadata = {
  title: "Детектор AI в резюме | Проверка резюме на ChatGPT | SofiHR",
  description: "Проверьте, написано ли резюме кандидата с помощью ChatGPT или другого AI. Бесплатный детектор AI-текста с подробным анализом. Без регистрации.",
  keywords: [
    "детектор AI в резюме",
    "проверка резюме на ChatGPT",
    "AI detector резюме",
    "проверка AI текста",
    "резюме написано ИИ",
    "детектор ChatGPT",
    "проверить резюме на AI",
    "AI-генерированное резюме",
    "детекция AI текста",
    "проверка резюме онлайн"
  ],
  openGraph: {
    title: "Детектор AI в резюме | Проверка на ChatGPT | SofiHR",
    description: "Проверьте, написано ли резюме кандидата с помощью AI. Бесплатный детектор с подробным анализом.",
    url: "https://sofihr.ru/hr-tools/ai-detector",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-ai-detector.jpg",
        width: 1200,
        height: 630,
        alt: "Детектор AI в резюме SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Детектор AI в резюме",
    description: "Проверьте, написано ли резюме с помощью ChatGPT или другого AI",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/ai-detector",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AiDetectorPage() {
  // JSON-LD для SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Детектор AI в резюме",
    "description": "Бесплатный инструмент для проверки, было ли резюме создано с помощью ChatGPT, Claude или других AI-ассистентов",
    "url": "https://sofihr.ru/hr-tools/ai-detector",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB"
    },
    "featureList": [
      "Детекция AI-генерированного текста",
      "Вероятность использования ChatGPT",
      "Подозрительные фрагменты",
      "Признаки человеческого текста",
      "Рекомендации для собеседования"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section - Pure HTML для SEO */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        paddingTop: '48px', 
        paddingBottom: '48px', 
        borderBottom: '1px solid #e0e0e0' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          paddingLeft: '24px', 
          paddingRight: '24px' 
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#1a1a2e',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}>
              Детектор AI в резюме
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Проверьте, было ли резюме создано с помощью ChatGPT, Claude или других AI-ассистентов. 
              Получите вероятностную оценку, подозрительные фрагменты и рекомендации для собеседования. 
              Детекция на основе языковых паттернов, структуры и содержания.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  Бесплатно навсегда
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2196F3' }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  Без регистрации
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF9800' }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  Анализ за 30 секунд
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component для интерактива - СРАЗУ ПОСЛЕ HERO */}
      <AiDetectorClient />

      {/* How it works - Pure HTML для SEO */}
      <div style={{ backgroundColor: '#fff', paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          paddingLeft: '24px', 
          paddingRight: '24px' 
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1a1a2e',
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            Как работает детектор AI
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2196F3' }}>1</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Вставьте текст резюме
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Скопируйте текст резюме кандидата и вставьте в форму. Минимум 100 символов для анализа.
              </p>
            </div>

            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4CAF50' }}>2</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                AI проанализирует паттерны
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Система анализирует языковые маркеры, структуру, содержание и выявляет признаки AI-генерации.
              </p>
            </div>

            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF9800' }}>3</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Получите детальный отчёт
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Вероятность AI, подозрительные фрагменты, признаки человеческого текста и рекомендации.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits - Pure HTML для SEO */}
      <div style={{ backgroundColor: '#f8f9fa', paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          paddingLeft: '24px', 
          paddingRight: '24px' 
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1a1a2e',
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            Что проверяет детектор
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
                Языковые маркеры
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Шаблонные фразы, избыточные прилагательные, формальный язык, пассивные конструкции — типичные признаки AI.
              </p>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
                Структура текста
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Идеальная симметрия, одинаковая длина пунктов, слишком правильная иерархия — признаки автогенерации.
              </p>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
                Содержание и детали
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Общие описания, нереалистичный набор навыков, отсутствие конкретных метрик и личных деталей.
              </p>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
                Признаки человека
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Опечатки, личные акценты, конкретные цифры, естественные речевые обороты, неравномерная детализация.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ - Pure HTML для SEO */}
      <div style={{ backgroundColor: '#fff', paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          paddingLeft: '24px', 
          paddingRight: '24px' 
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1a1a2e',
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            Часто задаваемые вопросы
          </h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#1a1a2e' }}>
                Насколько точен детектор AI?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Это вероятностная оценка, не абсолютная истина. Детектор анализирует множество признаков, 
                но не даёт 100% гарантии. Используйте результат как дополнительный индикатор для принятия решения.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#1a1a2e' }}>
                Какие AI-модели детектирует?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Детектор анализирует паттерны, типичные для ChatGPT, Claude, Gemini и других популярных AI-ассистентов. 
                Работает на русском языке с учётом культурного контекста.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#1a1a2e' }}>
                Что делать, если резюме AI-генерированное?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Используйте это как повод задать больше уточняющих вопросов на собеседовании. 
                Проверьте конкретные навыки и опыт. AI-резюме ≠ плохой кандидат, но требует дополнительной проверки.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#1a1a2e' }}>
                Может ли хорошо написанное резюме быть определено как AI?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да, возможны ложные срабатывания. Профессионально написанное резюме с грамотной структурой 
                может набрать высокий балл. Всегда смотрите на детальный анализ и подозрительные фрагменты.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

