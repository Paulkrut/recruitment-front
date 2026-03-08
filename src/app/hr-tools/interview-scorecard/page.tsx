import * as React from "react";
import type { Metadata } from 'next';
import InterviewScorecardClient from "./InterviewScorecardClient";

export const metadata: Metadata = {
  title: "Оценочный лист кандидата — Interview Scorecard с AI | SofiHR",
  description: "Создайте структурированный оценочный лист для собеседования за 30 секунд. AI сгенерирует критерии оценки, шкалу баллов и red flags под вашу вакансию. Бесплатно.",
  keywords: [
    "оценочный лист кандидата",
    "interview scorecard",
    "анкета для собеседования",
    "чек-лист интервью",
    "форма оценки кандидата",
    "матрица оценки кандидата",
    "структурированное интервью",
    "критерии оценки кандидата",
    "scorecard для собеседования",
    "оценка кандидата на интервью",
  ],
  openGraph: {
    title: "Оценочный лист кандидата — Interview Scorecard с AI | SofiHR",
    description: "Создайте структурированный scorecard для собеседования за 30 секунд. Бесплатно и без регистрации.",
    url: "https://sofihr.ru/hr-tools/interview-scorecard",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-interview-scorecard.jpg",
        width: 1200,
        height: 630,
        alt: "Interview Scorecard — оценочный лист кандидата SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Оценочный лист кандидата с AI | SofiHR",
    description: "AI-генератор scorecard: критерии, шкала баллов, red flags за 30 секунд",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/interview-scorecard",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function InterviewScorecardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Генератор оценочного листа кандидата",
    "description": "Бесплатный AI-инструмент для создания структурированного interview scorecard: критерии оценки, шкала баллов и red flags под вашу вакансию",
    "url": "https://sofihr.ru/hr-tools/interview-scorecard",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB"
    },
    "featureList": [
      "Генерация критериев оценки под вакансию",
      "Сигналы сильного и слабого кандидата",
      "Автоматическая шкала баллов",
      "Список red flags для роли",
      "Итоговая рекомендация по найму",
      "Копирование и скачивание",
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section — Pure HTML для SEO */}
      <div style={{
        backgroundColor: '#f8f9fa',
        paddingTop: '48px',
        paddingBottom: '48px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '24px', paddingRight: '24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#1a1a2e',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}>
              Оценочный лист кандидата с AI
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Создайте структурированный interview scorecard за 30 секунд. AI сгенерирует критерии оценки, 
              сигналы сильного и слабого кандидата, шкалу баллов и список red flags — 
              под вашу конкретную должность и тип интервью.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Без регистрации</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2196F3' }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Scorecard за 30 секунд</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF9800' }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Под любую роль</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component — форма генератора */}
      <InterviewScorecardClient />

      {/* How it works — Pure HTML для SEO */}
      <div style={{ backgroundColor: '#fff', paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '24px', paddingRight: '24px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: '32px' }}>
            Как работает генератор scorecard
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2196F3' }}>1</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Укажите должность и параметры
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Введите название должности, выберите уровень кандидата (Junior/Middle/Senior/Lead) 
                и тип интервью: HR, техническое, финальное или универсальное. Опционально 
                добавьте ключевые компетенции или вставьте описание вакансии.
              </p>
            </div>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9C27B0' }}>2</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                AI создаёт структуру оценки
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                Искусственный интеллект анализирует параметры и генерирует 5-8 критериев оценки, 
                адаптированных под тип интервью. Для каждого критерия прописывает, что именно 
                проверяем, как выглядит сильный и слабый ответ.
              </p>
            </div>
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4CAF50' }}>3</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#1a1a2e' }}>
                Получите готовый scorecard
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
                За 30 секунд получите оценочный лист с критериями, сигналами, red flags и 
                итоговой шкалой рекомендаций. Скопируйте или скачайте для использования 
                на интервью. Можно перегенерировать.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What you get — Pure HTML для SEO */}
      <div style={{ backgroundColor: '#f8f9fa', paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '24px', paddingRight: '24px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: '32px' }}>
            Что входит в оценочный лист
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Критерии оценки', desc: '5-8 критериев, адаптированных под должность и тип интервью. Каждый критерий — с чётким описанием того, что проверяем.' },
              { title: 'Сигналы сильного кандидата', desc: 'Для каждого критерия прописан пример ответа или поведения, который говорит о сильном кандидате.' },
              { title: 'Сигналы слабого кандидата', desc: 'Примеры ответов и поведения, которые сигнализируют о слабом кандидате или несоответствии роли.' },
              { title: 'Шкала баллов', desc: 'Каждый критерий оценивается по шкале 1-5. Итоговая сумма баллов переводится в рекомендацию по найму.' },
              { title: 'Red flags', desc: '5-7 конкретных сигналов тревоги, характерных для данной роли. Помогают замечать проблемные паттерны в интервью.' },
              { title: 'Рекомендация по итогу', desc: 'Чёткая шкала: при каком суммарном балле рекомендовать, рассматривать с оговорками или отклонить кандидата.' },
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#1a1a2e' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ — Pure HTML для SEO */}
      <div style={{ backgroundColor: '#fff', paddingTop: '48px', paddingBottom: '48px', borderTop: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '24px', paddingRight: '24px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: '32px' }}>
            Часто задаваемые вопросы
          </h2>
          {[
            {
              q: 'Что такое interview scorecard?',
              a: 'Interview scorecard — это структурированный оценочный лист для интервью. Он содержит набор критериев оценки кандидата, шкалу баллов и итоговую рекомендацию. Помогает оценивать всех кандидатов по одинаковым параметрам и снижает субъективность.',
            },
            {
              q: 'Чем scorecard лучше оценки "по ощущениям"?',
              a: 'Scorecard делает процесс оценки объективным и воспроизводимым. Вы фиксируете конкретные сигналы по каждому критерию, можете сравнивать кандидатов между собой, передавать форму коллегам и возвращаться к заметкам после интервью.',
            },
            {
              q: 'Под какие типы интервью подходит инструмент?',
              a: 'Генератор поддерживает 4 типа: HR-интервью (soft skills, мотивация), техническое интервью (hard skills), финальное интервью (комплексная оценка) и универсальное. Критерии адаптируются под выбранный тип автоматически.',
            },
            {
              q: 'Можно ли использовать scorecard для разных уровней?',
              a: 'Да. При выборе Junior-уровня AI акцентирует обучаемость и потенциал, для Senior — опыт решения сложных задач и самостоятельность, для Lead — управленческие навыки и стратегическое мышление.',
            },
            {
              q: 'Нужно ли регистрироваться?',
              a: 'Нет. Инструмент полностью бесплатный и работает без регистрации. Если хотите хранить scorecard, использовать его в AI-интервью и видеть аналитику по всем кандидатам — это доступно в платформе SofiHR.',
            },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px', color: '#1a1a2e' }}>{item.q}</h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
