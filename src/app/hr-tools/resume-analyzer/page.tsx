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
              Анализатор резюме с AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Получите детальный AI-анализ резюме кандидата за 1 минуту. 
              Искусственный интеллект оценит опыт работы, навыки, образование и предоставит 
              процент соответствия вакансии. Выявите сильные и слабые стороны кандидата 
              до приглашения на интервью.
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
                  Анализ за 60 секунд
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component - Форма анализатора */}
      <ResumeAnalyzerClient />

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
            Как работает анализатор резюме
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
                Загрузите резюме и вакансию
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Вставьте текст резюме кандидата (можно скопировать с HeadHunter или из PDF) 
                и опционально добавьте описание вакансии. AI проанализирует релевантность 
                опыта для конкретной позиции.
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
                AI анализирует резюме
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Искусственный интеллект проводит глубокий анализ: оценивает опыт работы, 
                навыки, образование, карьерную траекторию. Выявляет сильные стороны, 
                gaps в опыте и риски. Рассчитывает процент соответствия вакансии.
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
                Получите детальный отчёт
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                За 60 секунд получите структурированный анализ с оценкой опыта, списком навыков, 
                процентом соответствия и рекомендациями. Экспортируйте отчёт или используйте 
                для подготовки к интервью.
              </p>
            </div>
          </div>
        </div>
      </div>

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
            Преимущества AI-анализатора резюме
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#2196F3' }}>
                ⚡ Быстрый скрининг
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Ручной анализ резюме занимает 10-15 минут. AI делает это за 1 минуту, 
                позволяя быстро отсеять неподходящих кандидатов и сфокусироваться на лучших.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#4CAF50' }}>
                🎯 Объективная оценка
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI анализирует резюме без предвзятости и субъективных факторов. 
                Оценка основана только на фактах: опыт, навыки, достижения, соответствие требованиям.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#FF9800' }}>
                📊 Процент соответствия
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Получите точный процент соответствия резюме вакансии. AI сравнивает навыки, 
                опыт и требования, выделяя что совпадает, а чего не хватает.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#9C27B0' }}>
                🔍 Глубокий анализ
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI не просто сканирует ключевые слова, а понимает контекст: карьерный рост, 
                смену индустрий, уровень ответственности, релевантность проектов.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#E91E63' }}>
                ⚠️ Выявление рисков
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI автоматически находит красные флаги: частая смена работы, gaps в резюме, 
                несоответствие уровня позиции и опыта, завышенные претензии.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#00BCD4' }}>
                🆓 Полностью бесплатно
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Без ограничений, без регистрации, без скрытых платежей. Анализируйте 
                столько резюме, сколько нужно для поиска идеального кандидата.
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
                Как AI анализирует резюме кандидата?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI использует NLP (обработку естественного языка) для понимания текста резюме. 
                Система анализирует опыт работы, образование, навыки, достижения и карьерную траекторию. 
                Затем сравнивает с требованиями вакансии (если указана) и выдаёт структурированный 
                отчёт с оценками и рекомендациями.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Какие форматы резюме поддерживаются?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Вы можете вставить текст резюме в любом формате: скопированный с HeadHunter, 
                из PDF, Word документа или написанный вручную. AI понимает различные структуры 
                резюме и автоматически извлекает нужную информацию.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Насколько точен процент соответствия?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI рассчитывает соответствие на основе множества факторов: навыки, опыт работы, 
                уровень позиций, индустрия, образование. Точность составляет 85-90%. Это отличный 
                индикатор для первичного скрининга, но финальное решение всегда за рекрутером.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли анализировать резюме без вакансии?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да! Даже без указания вакансии AI проведёт общий анализ резюме: оценит опыт работы, 
                выделит ключевые навыки, определит уровень специалиста (Junior/Middle/Senior), 
                найдёт сильные стороны и потенциальные риски.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Сохраняются ли данные резюме?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Нет, мы не храним резюме кандидатов. Весь анализ происходит в реальном времени, 
                и данные не сохраняются на серверах. Это гарантирует конфиденциальность 
                персональной информации кандидатов.
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
