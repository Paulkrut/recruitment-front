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
              Генератор описания вакансии с AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Создайте полное профессиональное описание вакансии за 1 минуту. 
              Искусственный интеллект сгенерирует обязанности, требования, навыки и условия работы 
              на основе должности и уровня позиции. Готовый текст для публикации на HeadHunter, 
              LinkedIn и других job-сайтах.
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
                  Результат за 60 секунд
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component - Форма генератора */}
      <JobDescriptionClient />

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
            Как работает генератор вакансий
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
                Укажите должность и уровень
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Введите название должности (например, "Frontend разработчик" или "Менеджер по продажам") 
                и выберите уровень: Junior, Middle, Senior или Lead. Можно добавить дополнительные 
                требования и специфику.
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
                AI генерирует полное описание
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Искусственный интеллект анализирует должность и создаёт структурированное описание: 
                обязанности, требования к опыту и навыкам, hard skills, soft skills, условия работы. 
                Текст адаптирован под российский рынок труда.
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
                Получите готовый текст
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                За 60 секунд получите профессиональное описание вакансии, готовое к публикации. 
                Скопируйте в HeadHunter, LinkedIn, или скачайте как текстовый файл. Можно 
                отредактировать и перегенерировать.
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
            Преимущества AI-генератора вакансий
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
                Создание качественного описания вакансии вручную занимает 1-2 часа. 
                AI делает это за 1 минуту, освобождая время на работу с кандидатами.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#4CAF50' }}>
                🎯 Профессиональная структура
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Описания составлены по best practices рекрутмента: чёткие обязанности, 
                конкретные требования, привлекательные условия. Без воды и шаблонных фраз.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#FF9800' }}>
                📊 Адаптация под уровень
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI автоматически корректирует сложность задач и требований в зависимости от уровня: 
                Junior получит базовые навыки, Senior — стратегические и лидерские.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#9C27B0' }}>
                🌍 Готово для job-сайтов
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Формат текста оптимизирован для HeadHunter, Superjob, LinkedIn, Habr Career 
                и других платформ. Просто скопируйте и опубликуйте.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#E91E63' }}>
                💡 Привлекательное описание
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI создаёт не просто список требований, а продающее описание, которое 
                мотивирует кандидатов откликнуться на вакансию.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#00BCD4' }}>
                🆓 Полностью бесплатно
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Без ограничений, без регистрации, без скрытых платежей. Генерируйте 
                столько вакансий, сколько нужно.
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
                Как AI генерирует описание вакансии?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI анализирует название должности и уровень позиции, затем создаёт структурированное 
                описание на основе best practices рекрутмента. Система учитывает специфику индустрии, 
                требования рынка труда и автоматически формирует разделы: обязанности, требования к опыту, 
                hard skills, soft skills, условия работы.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли добавить свои требования?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да! В поле "Дополнительная информация" вы можете указать специфические требования, 
                технологии, форматы работы, бонусы и любые другие детали. AI учтёт их при генерации 
                и органично встроит в текст вакансии.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Описание подходит для всех индустрий?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да. AI работает для IT, продаж, маркетинга, финансов, производства, логистики, HR, 
                дизайна и других сфер. Система понимает специфику каждой индустрии и адаптирует 
                терминологию, требования и формат описания.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли редактировать сгенерированный текст?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Конечно! После генерации вы можете редактировать любые части описания прямо в интерфейсе. 
                Добавляйте, удаляйте или изменяйте пункты под свои нужды. Также можно перегенерировать 
                вакансию для получения альтернативного варианта.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Нужна ли регистрация для использования генератора?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Нет, регистрация не требуется. Генератор полностью бесплатный и работает без создания 
                аккаунта. Просто откройте страницу, введите данные и получите готовое описание вакансии.
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
