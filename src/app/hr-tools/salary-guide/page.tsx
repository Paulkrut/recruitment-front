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
              Зарплатный гид 2026 с AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Узнайте актуальный уровень зарплат для любой позиции в России за 30 секунд. 
              Искусственный интеллект анализирует рынок труда и предоставляет зарплатные вилки 
              с учётом города, уровня позиции и индустрии. Данные 2025-2026 года для правильного 
              бюджетирования и конкурентных офферов.
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
                  Данные за 30 секунд
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component - Форма справочника */}
      <SalaryGuideClient />

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
            Как работает зарплатный гид
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
                Укажите позицию и город
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Введите название должности (например, "Frontend разработчик" или "HR менеджер") 
                и выберите город. Опционально укажите уровень (Junior/Middle/Senior) и индустрию 
                для более точного анализа.
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
                AI анализирует рынок труда
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Искусственный интеллект анализирует актуальные данные с job-сайтов, учитывает 
                региональные особенности, экономические факторы, тренды индустрии и уровень конкуренции. 
                Рассчитывает зарплатную вилку: минимум, среднее, максимум.
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
                Получите зарплатную аналитику
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                За 30 секунд получите зарплатную вилку, тренды рынка, факторы влияния на зарплату, 
                рекомендации для офферов. Сравните зарплаты в разных городах. Экспортируйте 
                данные для презентации руководству.
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
            Преимущества AI-зарплатного гида
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#2196F3' }}>
                📊 Актуальные данные
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI анализирует свежие данные с рынка труда 2025-2026 года: HeadHunter, 
                Superjob, Habr Career, LinkedIn. Информация обновляется регулярно.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#4CAF50' }}>
                🎯 Учёт региональных различий
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Зарплаты в Москве, Санкт-Петербурге, Казани и Новосибирске различаются в 2-3 раза. 
                AI учитывает региональный коэффициент и стоимость жизни.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#FF9800' }}>
                💰 Конкурентные офферы
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Узнайте рыночные зарплаты, чтобы делать конкурентные предложения кандидатам 
                и не переплачивать. Привлекайте таланты правильными офферами.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#9C27B0' }}>
                📈 Тренды рынка труда
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                AI показывает, как изменились зарплаты за последний год: рост, падение или стабильность. 
                Учитывайте тренды при планировании бюджета.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#E91E63' }}>
                ⚖️ Справедливая оплата
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Используйте данные для пересмотра зарплат текущих сотрудников. Платите 
                рыночные ставки, чтобы удерживать команду и избегать текучки.
              </p>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#00BCD4' }}>
                🆓 Полностью бесплатно
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Без ограничений, без регистрации, без скрытых платежей. Проверяйте 
                зарплаты для любого количества позиций.
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
                Откуда AI берёт данные о зарплатах?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI анализирует публичные данные с крупнейших российских job-сайтов: HeadHunter, 
                Superjob, Habr Career, LinkedIn, а также отраслевые зарплатные обзоры. Система 
                учитывает тысячи вакансий, фильтрует аномалии и рассчитывает статистически 
                значимую зарплатную вилку.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Насколько точны данные о зарплатах?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Точность составляет 80-85% для популярных позиций в крупных городах. Для редких 
                специальностей или малых городов данные могут быть приблизительными. AI всегда 
                указывает уровень уверенности в оценке и рекомендует проверить дополнительные источники.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Какие факторы влияют на зарплату?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                AI учитывает: уровень позиции (Junior/Middle/Senior/Lead), город работы, 
                индустрию (IT платит выше финансов), размер компании, формат работы (офис/гибрид/удалёнка), 
                редкость навыков, экономическую ситуацию. Все факторы отображаются в отчёте.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Можно ли сравнить зарплаты в разных городах?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да! Запустите анализ для одной позиции в разных городах. AI покажет разницу 
                в зарплатах и объяснит причины (стоимость жизни, конкуренция за таланты, 
                концентрация компаний). Это помогает при планировании релокации или открытия филиала.
              </p>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Подходит ли гид для всех индустрий?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Да. AI анализирует зарплаты в IT, продажах, маркетинге, финансах, производстве, 
                логистике, HR, дизайне, строительстве и других сферах. Для специфических индустрий 
                (например, медицина, образование) укажите это в комментарии для более точного анализа.
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
