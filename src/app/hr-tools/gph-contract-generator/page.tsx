import * as React from "react";
import type { Metadata } from "next";
import GphContractClient from "./GphContractClient";

export const metadata: Metadata = {
  title: "Договор ГПХ: образец, шаблон и генератор | SofiHR",
  description:
    "Создайте договор ГПХ (подряда или оказания услуг) за минуту. AI сгенерирует шаблон для физлица, самозанятого или ИП. Бесплатно, без регистрации, экспорт в Word.",
  keywords: [
    "договор ГПХ",
    "договор подряда",
    "договор оказания услуг",
    "договор с самозанятым",
    "договор с ИП",
    "гражданско-правовой договор",
    "ГПХ образец",
    "шаблон договора ГПХ",
    "договор подряда образец",
    "договор самозанятый НПД",
  ],
  openGraph: {
    title: "Договор ГПХ: образец, шаблон и генератор | SofiHR",
    description:
      "Сгенерируйте договор ГПХ за минуту: подряд, оказание услуг, самозанятый или ИП. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/gph-contract-generator",
    siteName: "SofiHR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Договор ГПХ: генератор | SofiHR",
    description: "Генератор договора ГПХ: подряд, услуги, самозанятый, ИП, экспорт в Word",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/gph-contract-generator",
  },
  robots: { index: true, follow: true },
};

export default function GphContractGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Генератор договора ГПХ",
    description:
      "Бесплатный инструмент для создания договора ГПХ (подряда или оказания услуг) для физического лица, самозанятого (НПД) или ИП. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/gph-contract-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    featureList: [
      "Договор подряда и оказания услуг",
      "Физлицо, самозанятый, ИП",
      "Экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const faqItems = [
    {
      q: "Чем договор ГПХ отличается от трудового?",
      a: "Договор ГПХ (гражданско-правовой характер) регулируется ГК РФ и не предусматривает трудовых отношений: нет отпусков, больничных, подчинения правилам внутреннего распорядка. Исполнитель выполняет работу (оказывает услуги) по заданию заказчика и получает оплату за результат.",
    },
    {
      q: "Как оформить договор с самозанятым?",
      a: "С самозанятым (плательщиком НПД) заключают договор оказания услуг или подряда. Важно указать, что исполнитель применяет специальный налоговый режим «Налог на профессиональный доход» (НПД). Оплата — по факту оказания услуг с выставлением чека.",
    },
    {
      q: "Чем отличается договор с ИП?",
      a: "С ИП также заключается договор подряда или оказания услуг по ГК РФ. В отличие от физлица, ИП действует от своего имени как субъект предпринимательской деятельности. В договоре указывают реквизиты ИП, ОГРНИП, ИНН.",
    },
    {
      q: "Какие налоги при договоре ГПХ?",
      a: "Для физлица — НДФЛ 13% (удерживает заказчик как налоговый агент) и страховые взносы на ОПС и ОМС (если не ИП/самозанятый). Самозанятый платит налог сам (4–6%). ИП платит налоги по своей системе налогообложения.",
    },
    {
      q: "Можно ли использовать шаблон как есть?",
      a: "Сгенерированный шаблон носит справочный характер. Рекомендуется адаптировать его под конкретную ситуацию и проконсультироваться с юристом перед подписанием.",
    },
    {
      q: "Генератор бесплатный?",
      a: "Да, генератор договора ГПХ бесплатный и работает без регистрации. Вы можете скачать результат в Word и доработать его под свои нужды.",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px", lineHeight: 1.2 }}>
            Договор ГПХ: образец, шаблон и генератор
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "720px", lineHeight: 1.6, marginBottom: "24px" }}>
            Создайте договор подряда или оказания услуг за минуту. Укажите тип исполнителя (физлицо, самозанятый, ИП) и условия — система сгенерирует готовый шаблон.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Бесплатно", "Без регистрации", "Экспорт в Word"].map((badge) => (
              <span key={badge} style={{ display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#ffe0b2", color: "#E65100", fontSize: "0.88rem", fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <GphContractClient />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Как работает генератор договора ГПХ</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", title: "Заполните форму", desc: "Укажите тип исполнителя (физлицо, самозанятый, ИП), ФИО/наименование, описание работ или услуг. Чем детальнее — тем точнее результат." },
              { step: "2", title: "AI создаст договор", desc: "Система сгенерирует шаблон договора ГПХ с преамбулой, разделами, подписями и оговоркой." },
              { step: "3", title: "Скачайте в Word", desc: "Экспортируйте документ в Word, доработайте при необходимости и отправьте на подпись." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#E65100", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "12px" }}>{item.step}</div>
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

        <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#fff3e0", border: "1px solid #ffcc80" }}>
          <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Шаблон договора ГПХ создан AI-генератором и носит справочный характер. Рекомендуем адаптировать его под конкретную ситуацию и при необходимости проконсультироваться с юристом перед подписанием.
          </p>
        </div>
      </div>
    </>
  );
}
