import * as React from "react";
import type { Metadata } from "next";
import EmploymentContractClient from "./EmploymentContractClient";

export const metadata: Metadata = {
  title: "Трудовой договор: образец, шаблон и AI-генератор | SofiHR",
  description:
    "Создайте трудовой договор по ТК РФ за минуту. AI-генератор составит шаблон с условиями труда, зарплатой, испытательным сроком и режимом работы. Бессрочный и срочный договор, дистанционная работа. Экспорт в Word.",
  keywords: [
    "трудовой договор",
    "шаблон трудового договора",
    "трудовой договор образец",
    "трудовой договор с испытательным сроком",
    "дистанционная работа",
    "трудовой договор дистанционная работа",
    "срочный трудовой договор",
    "бессрочный трудовой договор",
    "трудовой договор ТК РФ",
    "образец трудового договора 2024",
  ],
  openGraph: {
    title: "Трудовой договор: образец, шаблон и AI-генератор | SofiHR",
    description:
      "Сгенерируйте трудовой договор по ТК РФ: должность, оклад, испытательный срок, формат работы. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/employment-contract-generator",
    siteName: "SofiHR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Трудовой договор: AI-генератор | SofiHR",
    description: "Генератор трудового договора по ТК РФ: шаблон, образец, экспорт в Word",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/employment-contract-generator",
  },
  robots: { index: true, follow: true },
};

export default function EmploymentContractGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Генератор трудового договора",
    description:
      "Бесплатный AI-инструмент для создания трудового договора по ТК РФ: образец, шаблон с условиями труда, зарплатой, испытательным сроком, дистанционной работой и экспортом в Word",
    url: "https://sofihr.ru/hr-tools/employment-contract-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    featureList: [
      "Генерация трудового договора по ТК РФ",
      "Бессрочный и срочный договор",
      "Дистанционная работа и гибрид",
      "Экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const faqItems = [
    {
      q: "Что должно быть в трудовом договоре по ТК РФ?",
      a: "По ст. 57 ТК РФ в трудовом договоре обязательны: ФИО работника и работодателя, место работы, трудовая функция, дата начала работы, условия оплаты труда, режим работы и отдыха, условия об испытательном сроке. По желанию сторон можно включить иные условия, не ухудшающие положение работника.",
    },
    {
      q: "Когда нужен срочный трудовой договор?",
      a: "Срочный трудовой договор заключается только в случаях, предусмотренных ст. 59 ТК РФ: на время исполнения обязанностей absent работника, сезонные работы, на срок до 2 месяцев и т.д. В остальных случаях — бессрочный договор.",
    },
    {
      q: "Как оформить дистанционную работу?",
      a: "Дистанционная работа оформляется трудовым договором с указанием места работы как «удалённо» или «дистанционно». В договор включают условия об особенностях дистанционной работы (ст. 312.1–312.5 ТК РФ): порядок взаимодействия, учёт рабочего времени и др.",
    },
    {
      q: "Максимальный испытательный срок по ТК РФ?",
      a: "Обычно испытание не может превышать 3 месяцев (для руководителей — 6 месяцев). Для договоров на срок от 2 до 6 месяцев испытание не более 2 недель. Беременным женщинам, несовершеннолетним испытательный срок не устанавливается.",
    },
    {
      q: "Нужна ли юридическая проверка шаблона?",
      a: "Сгенерированный документ — ориентировочный шаблон. Перед использованием рекомендуем проконсультироваться с юристом или кадровым специалистом, так как положения ТК РФ и локальные нормы могут меняться.",
    },
    {
      q: "Генератор бесплатный?",
      a: "Да, генератор трудового договора полностью бесплатный и работает без регистрации. Вы можете генерировать документы и экспортировать их в Word для доработки.",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px", lineHeight: 1.2 }}>
            Трудовой договор: образец, шаблон и AI-генератор
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "720px", lineHeight: 1.6, marginBottom: "24px" }}>
            Создайте трудовой договор по ТК РФ за минуту. Укажите данные работника и условия — система сгенерирует структурированный документ для печати и подписания.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Бесплатно", "Без регистрации", "Экспорт в Word"].map((badge) => (
              <span key={badge} style={{ display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#e3f2fd", color: "#1565c0", fontSize: "0.88rem", fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <EmploymentContractClient />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Как работает генератор трудового договора</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", title: "Заполните форму", desc: "Укажите ФИО работника, должность, оклад и условия: тип договора, формат работы, график, испытательный срок." },
              { step: "2", title: "AI создаст договор", desc: "Система сгенерирует трудовой договор с преамбулой, разделами по ТК РФ и блоком подписей." },
              { step: "3", title: "Скачайте в Word", desc: "Скопируйте текст или экспортируйте в Word для печати и подписания. Рекомендуем юридическую проверку." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#1565C0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "12px" }}>{item.step}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "0.93rem", color: "#64748b", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Часто задаваемые вопросы</h2>
          {faqItems.map((item) => (
            <div key={item.q} style={{ marginBottom: "16px", padding: "20px", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "8px" }}>{item.q}</h3>
              <p style={{ fontSize: "0.93rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#fff3e0", border: "1px solid #ffe0b2" }}>
          <p style={{ fontSize: "0.85rem", color: "#e65100", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Документ создан AI-генератором и носит справочный характер. Трудовой договор — юридический документ. Перед использованием обязательно проконсультируйтесь с юристом или кадровым специалистом.
          </p>
        </div>
      </div>
    </>
  );
}
