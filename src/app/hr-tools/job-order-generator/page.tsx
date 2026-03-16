import * as React from "react";
import type { Metadata } from "next";
import JobOrderClient from "./JobOrderClient";

export const metadata: Metadata = {
  title: "Приказ о приёме на работу: образец и генератор | SofiHR",
  description:
    "Создайте приказ о приёме на работу (форма Т-1) за минуту. AI сгенерирует кадровый приказ с условиями труда, должностью и основанием. Бесплатно, без регистрации, экспорт в Word.",
  keywords: [
    "приказ о приеме на работу",
    "форма Т-1",
    "кадровый приказ",
    "оформление приема сотрудника",
    "приказ на работу образец",
    "приказ о приеме образец",
    "приказ Т-1",
    "оформление приема на работу",
    "приказ о приеме на работу форма",
    "как оформить приказ о приеме",
  ],
  openGraph: {
    title: "Приказ о приёме на работу: образец и генератор | SofiHR",
    description:
      "Сгенерируйте приказ о приёме на работу (Т-1) за минуту: сотрудник, должность, условия и основание. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/job-order-generator",
    siteName: "SofiHR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Приказ о приёме на работу: генератор | SofiHR",
    description: "Генератор приказа о приёме (Т-1): должность, условия, Word-шаблон",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/job-order-generator",
  },
  robots: { index: true, follow: true },
};

export default function JobOrderGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Генератор приказа о приёме на работу",
    description:
      "Бесплатный инструмент для создания приказа о приёме на работу (форма Т-1): должность, отдел, оклад, испытательный срок, формат работы и экспорт в Word",
    url: "https://sofihr.ru/hr-tools/job-order-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    featureList: [
      "Генерация приказа о приёме (Т-1)",
      "Должность, отдел, оклад",
      "Испытательный срок и формат работы",
      "Экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const faqItems = [
    {
      q: "Что такое приказ о приёме на работу и форма Т-1?",
      a: "Приказ о приёме на работу — это распорядительный документ работодателя, который оформляет факт приёма сотрудника. Форма Т-1 — унифицированная форма такого приказа, утверждённая Постановлением Госкомстата России. Приказ издаётся после подписания трудового договора и является основанием для внесения записи в трудовую книжку.",
    },
    {
      q: "Когда нужен приказ о приёме?",
      a: "Приказ издаётся в день фактического начала работы сотрудника (или в течение 3 дней после подписания договора). Без приказа нельзя оформить запись в трудовой книжке, личную карточку Т-2 и другие кадровые документы. Приказ подписывается руководителем и знакомится сотрудник под роспись.",
    },
    {
      q: "Какие поля указываются в приказе?",
      a: "Типичные поля: ФИО сотрудника, должность, структурное подразделение, вид работы (основная/совместительство), оклад/тарифная ставка, дата начала работы, испытательный срок, режим работы (офис/удалёнка/гибрид). Основанием указывают трудовой договор.",
    },
    {
      q: "Чем отличается основная работа от совместительства?",
      a: "Основная работа — когда трудовой договор заключается на основное место. Совместительство — когда сотрудник уже работает в другой организации или у того же работодателя на другой должности. В приказе это указывается в поле «вид работы».",
    },
    {
      q: "Можно ли редактировать сгенерированный приказ?",
      a: "Да, результат можно скопировать или скачать в Word и адаптировать: подставить номер приказа по вашей нумерации, дату, реквизиты компании, добавить подписи на фирменном бланке.",
    },
    {
      q: "Генератор бесплатный?",
      a: "Да, генератор приказа о приёме полностью бесплатный и работает без регистрации. Вы можете создавать столько приказов, сколько нужно.",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px", lineHeight: 1.2 }}>
            Приказ о приёме на работу: образец и генератор
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "720px", lineHeight: 1.6, marginBottom: "24px" }}>
            Создайте приказ о приёме на работу (форма Т-1) за минуту. Укажите ФИО сотрудника, должность и условия — система сгенерирует кадровый приказ, готовый к печати.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Бесплатно", "Без регистрации", "Экспорт в Word"].map((badge) => (
              <span key={badge} style={{ display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#e8f5e9", color: "#2E7D32", fontSize: "0.88rem", fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <JobOrderClient />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Как работает генератор приказа</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", title: "Заполните форму", desc: "Укажите ФИО сотрудника, должность и условия приёма. Чем больше деталей, тем точнее результат." },
              { step: "2", title: "AI создаст приказ", desc: "Система сгенерирует приказ о приёме с номером, датой, текстом распоряжения и условиями работы." },
              { step: "3", title: "Скачайте в Word", desc: "Скопируйте текст или экспортируйте в Word для распечатки и подписания на фирменном бланке." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#2E7D32", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "12px" }}>{item.step}</div>
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

        <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#f0f7ff", border: "1px solid #dbe6f3" }}>
          <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Приказ создан AI-генератором и носит справочный характер. Рекомендуем адаптировать его под вашу нумерацию и фирменный стиль, проверить детали и получить консультацию юриста при необходимости.
          </p>
        </div>
      </div>
    </>
  );
}
