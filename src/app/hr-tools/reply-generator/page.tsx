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
              Генератор ответа кандидату с AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Создайте профессиональное письмо кандидату за 10 секунд. 
              Искусственный интеллект сгенерирует приглашение на собеседование или 
              вежливый отказ с учётом контекста. Персонализированные, корректные 
              и дружелюбные ответы для поддержания HR-бренда компании.
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
                  Результат за 10 секунд
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
            Как работает генератор ответов
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
                Выберите тип ответа
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Укажите, что хотите сгенерировать: приглашение на собеседование или отказ кандидату. 
                Опционально добавьте контекст: название вакансии, имя кандидата, причину отказа, 
                детали интервью (дата, время, формат).
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
                AI генерирует письмо
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Искусственный интеллект создаёт профессиональное письмо с правильным тоном: 
                дружелюбным для приглашения или корректно-вежливым для отказа. Учитывается 
                этика коммуникации и best practices HR-брендинга.
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
                Отправьте кандидату
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                За 10 секунд получите готовое письмо. Скопируйте в email, Telegram, WhatsApp 
                или систему управления кандидатами. Можно отредактировать детали или 
                перегенерировать для другого варианта.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component - Форма генератора */}
      <ReplyGeneratorClient />

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
            Преимущества AI-генератора ответов
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#2196F3' }}>
                ⚡ Мгновенный ответ
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Написание персонализированного письма вручную занимает 5-10 минут. 
                AI делает это за 10 секунд, освобождая время на более важные задачи.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#4CAF50' }}>
                🎯 Правильный тон
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI автоматически подбирает подходящий тон: энтузиазм для приглашения, 
                эмпатию для отказа. Письма звучат профессионально и по-человечески.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#FF9800' }}>
                📝 Персонализация
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Добавьте имя кандидата, название вакансии, детали встречи — AI встроит 
                их органично. Никаких шаблонных "Уважаемый соискатель".
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#9C27B0' }}>
                🤝 Укрепление HR-бренда
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Даже отказы формируют мнение о компании. AI создаёт корректные, 
                вежливые и эмпатичные письма, которые не портят репутацию работодателя.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#E91E63' }}>
                ✅ Без ошибок
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI не допускает опечаток, грамматических ошибок или неловких формулировок. 
                Каждое письмо проверено на стилистику и корректность.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#00BCD4' }}>
                🆓 Полностью бесплатно
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Без ограничений, без регистрации, без скрытых платежей. Генерируйте 
                столько писем, сколько нужно для коммуникации с кандидатами.
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
                Как AI генерирует письма кандидатам?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI анализирует тип ответа (приглашение или отказ) и контекст, который вы указали. 
                Затем создаёт письмо по best practices HR-коммуникации: с правильной структурой, 
                профессиональным тоном, персонализацией и эмпатией. Система обучена на тысячах 
                успешных примеров писем от опытных рекрутеров.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли редактировать сгенерированное письмо?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да! После генерации вы можете редактировать любые части письма прямо в интерфейсе. 
                Добавьте специфические детали, измените формулировки или тон. Также можно 
                перегенерировать письмо для получения альтернативного варианта.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Как писать отказы, не портя HR-бренд?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI создаёт отказы с учётом этики и эмпатии: благодарит за интерес к компании, 
                объясняет причину (если указана) корректно, желает успехов в поиске работы. 
                Письма не обидные, не формальные, а по-человечески вежливые, что сохраняет 
                позитивное мнение о компании.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли указать детали интервью?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да! Для приглашения на собеседование вы можете указать дату, время, формат 
                (офлайн/онлайн/звонок), адрес или ссылку на видеоконференцию, контактное лицо, 
                что подготовить. AI органично встроит всю информацию в письмо.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Нужна ли регистрация для использования генератора?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Нет, регистрация не требуется. Генератор полностью бесплатный и работает без 
                создания аккаунта. Просто откройте страницу, выберите тип ответа, заполните 
                детали и получите готовое письмо.
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
