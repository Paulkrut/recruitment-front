import * as React from "react";
import type { Metadata } from "next";
import AdditionalAgreementClient from "./AdditionalAgreementClient";

export const metadata: Metadata = {
  title: "Дополнительное соглашение: шаблон и генератор | SofiHR",
  description:
    "Создайте дополнительное соглашение к трудовому договору за минуту. AI сгенерирует документ на изменение оклада, перевод на удалёнку, смену должности и другие изменения. Бесплатно, без регистрации, экспорт в Word.",
  keywords: [
    "допсоглашение",
    "дополнительное соглашение к трудовому договору",
    "изменение оклада",
    "перевод на удаленку",
    "изменение должности",
    "изменение графика работы",
    "перевод в другой отдел",
    "шаблон допсоглашения",
    "генератор допсоглашения",
    "дополнительное соглашение образец",
    "ст. 72 ТК РФ",
  ],
  openGraph: {
    title: "Дополнительное соглашение: шаблон и генератор | SofiHR",
    description:
      "Сгенерируйте допсоглашение к трудовому договору: изменение оклада, перевод на удалёнку, должности, графика. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/additional-agreement-generator",
    siteName: "SofiHR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Допсоглашение к трудовому договору: генератор | SofiHR",
    description: "Генератор дополнительного соглашения: изменение условий труда, экспорт в Word",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/additional-agreement-generator",
  },
  robots: { index: true, follow: true },
};

export default function AdditionalAgreementGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Генератор дополнительного соглашения к трудовому договору",
    description:
      "Бесплатный инструмент для создания допсоглашения к трудовому договору: изменение оклада, должности, графика, перевод на удалёнку и экспорт в Word",
    url: "https://sofihr.ru/hr-tools/additional-agreement-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    featureList: [
      "Генерация дополнительного соглашения",
      "Изменение оклада, должности, графика",
      "Перевод на удалёнку",
      "Экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const faqItems = [
    {
      q: "Что такое дополнительное соглашение к трудовому договору?",
      a: "Дополнительное соглашение — это документ, которым стороны изменяют условия уже действующего трудового договора. Оно составляется в соответствии со ст. 72 ТК РФ и подписывается работником и работодателем.",
    },
    {
      q: "Когда нужно дополнительное соглашение?",
      a: "Допсоглашение оформляют при изменении оклада, должности, графика работы, перевода на удалёнку или в другой отдел, продлении срока договора и других существенных изменениях условий труда.",
    },
    {
      q: "Нужно ли согласие работника на допсоглашение?",
      a: "Да. По ст. 72 ТК РФ изменение условий трудового договора допускается только по соглашению сторон. Работник должен подписать допсоглашение — без его согласия изменения незаконны.",
    },
    {
      q: "Можно ли редактировать сгенерированное допсоглашение?",
      a: "Да, результат можно скопировать или скачать в Word и адаптировать под конкретную ситуацию: добавить реквизиты, скорректировать формулировки, вставить на фирменный бланк компании.",
    },
    {
      q: "Генератор бесплатный?",
      a: "Да, генератор дополнительного соглашения полностью бесплатный и работает без регистрации. Вы можете создавать столько документов, сколько требуется.",
    },
    {
      q: "Какие данные нужны для генерации?",
      a: "Минимум — тип изменения (оклад, должность, удалёнка и т.п.), ФИО работника и новые условия. Дополнительно можно указать текущие условия, дату вступления в силу и название компании.",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px", lineHeight: 1.2 }}>
            Дополнительное соглашение: шаблон и генератор
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "720px", lineHeight: 1.6, marginBottom: "24px" }}>
            Создайте допсоглашение к трудовому договору за минуту. Выберите тип изменения, укажите условия — система сгенерирует юридически корректный документ.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Бесплатно", "Без регистрации", "Экспорт в Word"].map((badge) => (
              <span key={badge} style={{ display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#ede7f6", color: "#5e35b1", fontSize: "0.88rem", fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <AdditionalAgreementClient />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Как работает генератор допсоглашения</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", title: "Заполните форму", desc: "Выберите тип изменения (оклад, должность, удалёнка и т.д.), укажите ФИО работника и новые условия. Чем точнее данные, тем лучше результат." },
              { step: "2", title: "AI создаст документ", desc: "Система сгенерирует допсоглашение с преамбулой, пунктами изменений, датой вступления в силу и блоками подписей." },
              { step: "3", title: "Скачайте в Word", desc: "Скопируйте текст или экспортируйте в Word для печати и подписания на фирменном бланке компании." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#7B1FA2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "12px" }}>{item.step}</div>
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
            Допсоглашение создано AI-генератором и носит справочный характер. Рекомендуем проверить соответствие ст. 72 ТК РФ и внутренним документам компании перед подписанием.
          </p>
        </div>
      </div>
    </>
  );
}
