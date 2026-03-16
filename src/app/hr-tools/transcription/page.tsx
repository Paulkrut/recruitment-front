import * as React from "react";
import type { Metadata } from "next";
import TranscriptionClient from "./TranscriptionClient";

export const metadata: Metadata = {
  title: "Транскрибация аудио и видео онлайн бесплатно | SofiHR",
  description:
    "Переведите аудио или видео в текст за минуту. AI распознает речь, исправит ошибки и выдаст готовый Word-документ. Бесплатно, без регистрации.",
  keywords: [
    "транскрибация онлайн",
    "расшифровка аудио",
    "перевод аудио в текст",
    "расшифровка видео",
    "транскрибация бесплатно",
    "аудио в текст онлайн",
    "расшифровка записи",
    "транскрипция аудио",
    "распознавание речи",
    "speech to text",
  ],
  openGraph: {
    title: "Транскрибация аудио и видео онлайн бесплатно | SofiHR",
    description:
      "Загрузите аудио или видео — получите текст и Word-файл. AI Whisper + улучшение текста.",
    url: "https://sofihr.ru/hr-tools/transcription",
    siteName: "SofiHR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Транскрибация аудио и видео онлайн | SofiHR",
    description: "Расшифровка аудио и видео в текст бесплатно с AI",
  },
  alternates: {
    canonical: "https://sofihr.ru/hr-tools/transcription",
  },
  robots: { index: true, follow: true },
};

export default function TranscriptionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Транскрибация аудио и видео",
    description:
      "Бесплатный инструмент для расшифровки аудио и видео в текст. AI распознаёт речь и улучшает текст. Экспорт в Word.",
    url: "https://sofihr.ru/hr-tools/transcription",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    featureList: [
      "Распознавание речи из аудио и видео",
      "AI-улучшение текста",
      "Поддержка MP3, WAV, OGG, MP4, WEBM",
      "Автоматический экспорт в Word",
      "Работает без регистрации",
    ],
  };

  const faqItems = [
    { q: "Какие форматы поддерживаются?", a: "Аудио: MP3, WAV, OGG, M4A, AAC. Видео: MP4, WEBM, MOV. Максимальный размер файла — 60 МБ." },
    { q: "Как происходит транскрибация?", a: "Файл отправляется в AI-модель Whisper, которая распознаёт речь. Затем текст проходит через второй AI для исправления ошибок транскрибации — пунктуация, опечатки, слова-паразиты." },
    { q: "На каких языках работает?", a: "Основной язык — русский. Модель Whisper также поддерживает английский и другие языки, но качество лучше всего на русском и английском." },
    { q: "Это бесплатно?", a: "Да, инструмент полностью бесплатный и работает без регистрации. Вы можете транскрибировать столько файлов, сколько вам нужно." },
    { q: "Можно ли транскрибировать видео с совещания?", a: "Да. Загрузите видеозапись совещания (MP4, WEBM, MOV) — система извлечёт аудио-дорожку и расшифрует речь в текст." },
    { q: "Как получить Word-файл?", a: "Word-файл скачивается автоматически, как только транскрибация завершена. Также вы можете скопировать текст или скачать Word повторно." },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "#f8f9fa", paddingTop: "48px", paddingBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", marginLeft: "auto", marginRight: "auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px", lineHeight: 1.2 }}>
            Транскрибация аудио и видео онлайн
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: "720px", lineHeight: 1.6, marginBottom: "24px" }}>
            Загрузите аудио или видео — AI распознает речь, исправит ошибки и выдаст готовый текст с автоматическим экспортом в Word.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Бесплатно", "Без регистрации", "Авто-экспорт в Word"].map((badge) => (
              <span key={badge} style={{ display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#e3f2fd", color: "#1565C0", fontSize: "0.88rem", fontWeight: 600 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <TranscriptionClient />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "24px" }}>Как работает транскрибация</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", title: "Загрузите файл", desc: "Перетащите аудио или видео в зону загрузки или выберите файл. Поддерживаются MP3, WAV, MP4 и другие форматы до 60 МБ." },
              { step: "2", title: "AI распознает речь", desc: "Модель Whisper расшифровывает аудио, затем второй AI исправляет ошибки транскрибации, расставляет пунктуацию." },
              { step: "3", title: "Получите текст и Word", desc: "Текст появляется на экране, а Word-файл скачивается автоматически. Также можно скопировать текст или скачать заново." },
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

        <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#f0f7ff", border: "1px solid #dbe6f3" }}>
          <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Транскрибация выполняется AI-моделью Whisper и носит справочный характер. Рекомендуем проверить текст перед использованием в официальных документах.
          </p>
        </div>
      </div>
    </>
  );
}
