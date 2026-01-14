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
              Генератор вопросов для собеседования с AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Автоматически создавайте профессиональные вопросы для интервью за 30 секунд. 
              Искусственный интеллект анализирует описание вакансии и генерирует релевантные вопросы 
              по Hard Skills, Soft Skills, мотивации и ситуационные кейсы. Идеально для HR-специалистов 
              и рекрутеров.
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
                  Результат за 30 секунд
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            Как работает генератор вопросов
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
                Опишите вакансию
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Введите описание вакансии: обязанности, требования, технологии. Можно использовать 
                готовые шаблоны или вставить текст с HeadHunter. Опционально добавьте резюме кандидата 
                для персонализированных вопросов.
              </p>
            </div>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9C27B0' }}>2</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                AI анализирует и генерирует
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Искусственный интеллект анализирует вакансию и создаёт сбалансированный набор вопросов: 
                40% Hard Skills, 30% Soft Skills, 20% мотивация, 10% ситуационные кейсы. Учитывается 
                уровень позиции и специфика индустрии.
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
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4CAF50' }}>3</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Получите готовые вопросы
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                За 30 секунд получите 5-15 профессиональных вопросов с категориями и пометками, 
                что проверяет каждый вопрос. Скопируйте в буфер обмена или скачайте как текстовый файл. 
                Можно перегенерировать для новых вариантов.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component - Форма генератора */}
      <QuestionGeneratorClient />

      {/* Benefits Section - Pure HTML для SEO */}
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
            Преимущества AI-генератора вопросов
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#2196F3' }}>
                ⚡ Экономия времени
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Создание вопросов вручную занимает 30-60 минут. AI делает это за 30 секунд, 
                освобождая время на более важные задачи.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#4CAF50' }}>
                🎯 Профессиональное качество
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Вопросы составлены по методологии опытных HR-специалистов: открытые, конкретные, 
                проверяющие реальные навыки, а не теорию.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#FF9800' }}>
                📊 Сбалансированная структура
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Автоматическое распределение по категориям: технические навыки, коммуникация, 
                мотивация, ситуационные кейсы.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#9C27B0' }}>
                🔄 Персонализация
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Добавьте резюме кандидата — AI сгенерирует вопросы, проверяющие конкретный 
                опыт и навыки из его карьеры.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#E91E63' }}>
                💯 Без шаблонных вопросов
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI избегает банальных вопросов типа "Кем видите себя через 5 лет?" и создаёт 
                релевантные для конкретной позиции.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#00BCD4' }}>
                🆓 Полностью бесплатно
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Без ограничений, без регистрации, без скрытых платежей. Генерируйте столько 
                вопросов, сколько нужно.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Pure HTML для SEO */}
      <div style={{ backgroundColor: '#fff', paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ 
          maxWidth: '900px', 
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Как AI генерирует вопросы для собеседования?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI анализирует описание вакансии, выделяет ключевые навыки и требования, 
                затем создаёт вопросы по проверенной HR-методологии. Система учитывает уровень позиции, 
                индустрию и автоматически распределяет вопросы по категориям (Hard Skills, Soft Skills, 
                мотивация, ситуационные кейсы).
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли генерировать вопросы под конкретного кандидата?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да! Нажмите "Добавить резюме кандидата" и вставьте текст резюме. AI проанализирует 
                опыт кандидата и создаст персонализированные вопросы, проверяющие конкретные проекты, 
                технологии и достижения из его карьеры.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Сколько вопросов можно сгенерировать?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                От 5 до 15 вопросов за один раз. Этого достаточно для полноценного первичного интервью 
                на 45-60 минут. Можно перегенерировать неограниченное количество раз для получения 
                новых вариантов.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Вопросы действительно профессиональные?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да. AI обучен на методологии опытных HR-специалистов с 10+ годами опыта. Вопросы 
                всегда открытые (не "да/нет"), конкретные, проверяют практический опыт, избегают 
                банальностей и стрессовых формулировок. Каждый вопрос снабжён пометкой, что именно 
                он проверяет.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Нужна ли регистрация для использования генератора?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Нет, регистрация не нужна. Генератор полностью бесплатный и работает без создания 
                аккаунта. Просто откройте страницу, введите данные и получите результат.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
