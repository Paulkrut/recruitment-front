import * as React from "react";
import type { Metadata } from "next";
import OfferClient from "./OfferClient";

export const metadata: Metadata = {
  title: "Оффер кандидату: пример и генератор | SofiHR",
  description:
    "Создайте профессиональный оффер кандидату за минуту. AI сгенерирует структурированное письмо с условиями работы, компенсацией и следующими шагами. Бесплатно, без регистрации, экспорт в Word.",
  keywords: [
    "оффер кандидату",
    "offer letter",
    "шаблон оффера",
    "генератор оффера",
    "оффер на работу",
    "предложение о работе",
    "оффер образец",
    "оффер пример",
    "HR оффер",
    "job offer шаблон",
  ],
  openGraph: {
    title: "Оффер кандидату: пример и генератор | SofiHR",
    description:
      "Сгенерируйте профессиональный оффер за минуту: должность, условия, бонусы и следующие шаги. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/offer-generator",
    siteName: "SofiHR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Оффер кандидату: генератор | SofiHR",
    description: "Генератор оффера кандидату: условия, компенсация, Word-шаблон",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/offer-generator",
  },
  robots: { index: true, follow: true },
};

export default function OfferGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Генератор оффера кандидату",
    description:
      "Бесплатный инструмент для создания профессионального оффера кандидату: должность, условия работы, компенсация, бонусы и экспорт в Word",
    url: "https://sofihr.ru/hr-tools/offer-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    featureList: [
      "Генерация оффера кандидату",
      "Условия работы и компенсация",
      "Бонусы и льготы",
      "Экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const faqItems = [
    { q: "Что такое оффер кандидату?", a: "Оффер (offer letter) — это официальное письменное предложение о работе, которое компания отправляет кандидату после успешного прохождения собеседований. Оно содержит описание должности, условия работы, оплату и другие детали." },
    { q: "Оффер — это юридически обязывающий документ?", a: "Оффер сам по себе не является трудовым договором и обычно не несёт юридической силы в РФ. Однако он фиксирует договорённости и показывает серьёзность намерений работодателя. Юридические обязательства возникают при подписании трудового договора." },
    { q: "Что должно быть в оффере?", a: "В хорошем оффере обычно указывают: должность, подразделение, дату выхода, размер оплаты, формат работы (офис/удалёнка/гибрид), испытательный срок, бонусы и льготы, а также следующие шаги для кандидата." },
    { q: "Можно ли редактировать сгенерированный оффер?", a: "Да, результат можно скопировать или скачать в Word и адаптировать под конкретную ситуацию: добавить детали, изменить формулировки, вставить фирменный бланк компании." },
    { q: "Генератор бесплатный?", a: "Да, генератор оффера полностью бесплатный и работает без регистрации. Вы можете генерировать столько офферов, сколько вам нужно." },
    { q: "Какие данные нужны для генерации?", a: "Минимум — ФИО кандидата и название должности. Дополнительно можно указать оклад, дату выхода, формат работы, испытательный срок, бонусы и название компании." },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px", lineHeight: 1.2 }}>
            Оффер кандидату: пример и генератор
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "720px", lineHeight: 1.6, marginBottom: "24px" }}>
            Создайте профессиональное письмо-оффер за минуту. Укажите должность и условия — система сгенерирует структурированное предложение о работе.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Бесплатно", "Без регистрации", "Экспорт в Word"].map((badge) => (
              <span key={badge} style={{ display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#e0f2f1", color: "#00695c", fontSize: "0.88rem", fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <OfferClient />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Как работает генератор оффера</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", title: "Заполните форму", desc: "Укажите ФИО кандидата, должность и условия работы. Чем больше деталей, тем точнее результат." },
              { step: "2", title: "AI создаст оффер", desc: "Система сгенерирует профессиональное письмо с поздравлением, условиями и следующими шагами." },
              { step: "3", title: "Скачайте в Word", desc: "Скопируйте текст или экспортируйте в Word для отправки кандидату на фирменном бланке." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#009688", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "12px" }}>{item.step}</div>
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
            Оффер создан AI-генератором и носит справочный характер. Рекомендуем адаптировать его под корпоративный стиль и проверить детали перед отправкой кандидату.
          </p>
        </div>
      </div>
    </>
  );
}
