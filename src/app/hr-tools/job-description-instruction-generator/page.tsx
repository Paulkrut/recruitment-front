import * as React from "react";
import type { Metadata } from "next";
import InterviewInstructionClient from "./InterviewInstructionClient";

export const metadata: Metadata = {
  title: "Должностная инструкция: шаблон и генератор | SofiHR",
  description:
    "Составьте должностную инструкцию онлайн за несколько минут. Система соберёт обязанности, функции, права, ответственность, требования и KPI под конкретную роль. Бесплатно и без регистрации.",
  keywords: [
    "должностная инструкция",
    "должностная инструкция образец",
    "шаблон должностной инструкции",
    "генератор должностной инструкции",
    "должностная инструкция онлайн",
    "обязанности сотрудника",
    "должностная инструкция менеджера",
    "должностная инструкция hr",
    "должностная инструкция специалиста",
    "структура должностной инструкции",
  ],
  openGraph: {
    title: "Должностная инструкция: шаблон и генератор | SofiHR",
    description:
      "Соберите основу должностной инструкции за несколько минут: обязанности, права, ответственность, требования и KPI под конкретную роль.",
    url: "https://sofihr.ru/hr-tools/job-description-instruction-generator",
    siteName: "SofiHR",
    type: "website",
    images: [
      {
        url: "https://sofihr.ru/og-job-instruction.jpg",
        width: 1200,
        height: 630,
        alt: "Генератор должностной инструкции SofiHR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Должностная инструкция: генератор | SofiHR",
    description: "Генератор должностной инструкции: обязанности, права, KPI и Word-шаблон",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/job-description-instruction-generator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function JobDescriptionInstructionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Генератор должностной инструкции",
    description:
      "Бесплатный инструмент для создания должностной инструкции: обязанности, права, ответственность, требования, KPI и Word-шаблон документа",
    url: "https://sofihr.ru/hr-tools/job-description-instruction-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
    },
    featureList: [
      "Генерация структуры должностной инструкции",
      "Обязанности, функции, права и ответственность",
      "Требования к квалификации и KPI",
      "Готовый шаблон документа",
      "Экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          backgroundColor: "#f8f9fa",
          paddingTop: "48px",
          paddingBottom: "48px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#1a1a2e",
                marginBottom: "16px",
                lineHeight: 1.2,
              }}
            >
              Должностная инструкция: шаблон и генератор
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#666",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Создайте рабочую основу должностной инструкции за несколько минут.
              Система соберёт обязанности, функциональные задачи, права, зоны ответственности,
              требования к квалификации, KPI и готовый Word-шаблон под конкретную роль.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4CAF50" }} />
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Без регистрации</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2196F3" }} />
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Готовый шаблон документа</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FF9800" }} />
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Экспорт в Word</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InterviewInstructionClient />

      <div style={{ backgroundColor: "#fff", paddingTop: "48px", paddingBottom: "48px" }}>
        <div
          style={{
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            Как работает генератор должностной инструкции
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            <div>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2196F3" }}>1</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px", color: "#1a1a2e" }}>
                Укажите роль и контекст
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6 }}>
                Введите должность, уровень роли, подразделение и руководителя. При желании добавьте задачи,
                требования и контекст бизнеса, чтобы система точнее адаптировала документ.
              </p>
            </div>
            <div>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#f3e5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#9C27B0" }}>2</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px", color: "#1a1a2e" }}>
                Система собирает структуру документа
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6 }}>
                Инструмент формирует цель роли, обязанности, функциональные задачи, права, зоны ответственности,
                требования к квалификации, KPI и блок взаимодействия с другими отделами.
              </p>
            </div>
            <div>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4CAF50" }}>3</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px", color: "#1a1a2e" }}>
                Получите шаблон и Word-файл
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6 }}>
                На выходе вы видите структурированный шаблон документа прямо на странице, можете скопировать текст
                или скачать Word-файл для согласования и адаптации под внутренние регламенты.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "48px" }}>
        <div
          style={{
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            Что входит в должностную инструкцию
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              {
                title: "Обязанности и функции",
                desc: "Система разделяет общий круг обязанностей и конкретные функциональные задачи, чтобы документ был понятнее HR, руководителю и самому сотруднику.",
              },
              {
                title: "Права и ответственность",
                desc: "Шаблон включает блок прав сотрудника и зоны ответственности, чтобы роль была описана не только через задачи, но и через рамки принятия решений.",
              },
              {
                title: "Требования к квалификации",
                desc: "В документ добавляются требования к опыту, навыкам, знаниям процессов и инструментов, соответствующие уровню роли.",
              },
              {
                title: "KPI и результат",
                desc: "Генератор подсказывает измеримые показатели результата, чтобы должностная инструкция была связана с реальной эффективностью роли.",
              },
              {
                title: "Взаимодействие с отделами",
                desc: "Отдельный блок помогает зафиксировать, с кем и в каком формате взаимодействует сотрудник внутри компании.",
              },
              {
                title: "Шаблон для Word",
                desc: "Результат можно скачать в Word и использовать как рабочую основу для утверждения, адаптации и внутреннего документооборота.",
              },
            ].map((item, index) => (
              <div key={index} style={cardStyle}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "8px", color: "#1a1a2e" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", paddingTop: "48px", paddingBottom: "48px" }}>
        <div
          style={{
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            Когда такой инструмент особенно полезен
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {[
              "Нужно быстро собрать должностную инструкцию для новой роли без долгого старта с пустого листа.",
              "Есть старая инструкция, но она устарела и не отражает реальные задачи сотрудника.",
              "Нужно синхронизировать ожидания HR, руководителя и бизнеса по содержанию роли.",
              "Нужна основа для дальнейшего создания вакансии, вопросов для интервью и критериев оценки кандидатов.",
            ].map((text, index) => (
              <div key={index} style={cardStyle}>
                <p style={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", paddingTop: "48px", paddingBottom: "48px", borderTop: "1px solid #e0e0e0" }}>
        <div
          style={{
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a2e", textAlign: "center", marginBottom: "32px" }}>
            Часто задаваемые вопросы
          </h2>
          {[
            {
              q: "Чем должностная инструкция отличается от описания вакансии?",
              a: "Описание вакансии нужно для привлечения кандидатов на рынке. Должностная инструкция — это внутренний рабочий документ: он фиксирует задачи, права, ответственность, требования и KPI сотрудника внутри компании.",
            },
            {
              q: "Можно ли использовать результат как официальный документ?",
              a: "Инструмент создаёт качественный рабочий шаблон, который удобно использовать как основу. Перед утверждением его стоит адаптировать под внутренние регламенты, оргструктуру и юридические требования вашей компании.",
            },
            {
              q: "Подходит ли инструмент для руководящих ролей?",
              a: "Да. Генератор учитывает уровень роли и для Lead/Manager-позиций сильнее акцентирует ответственность за процессы, результат команды, координацию и KPI.",
            },
            {
              q: "Можно ли скачать должностную инструкцию в Word?",
              a: "Да. После генерации доступен Word-экспорт. В файл попадает тот же шаблон, который отображается на странице, поэтому его удобно доработать и согласовать внутри компании.",
            },
            {
              q: "Как использовать документ дальше в найме?",
              a: "На основе инструкции удобно собирать описание вакансии, вопросы для интервью и scorecard для оценки кандидатов. Именно поэтому этот инструмент хорошо работает как стартовая точка перед запуском найма.",
            },
          ].map((item, index) => (
            <div key={index} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: index < 4 ? "1px solid #f0f0f0" : "none" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "8px", color: "#1a1a2e" }}>{item.q}</h3>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
