# 🚀 Улучшения микроразметки Schema.org для Google и Яндекс

## ✅ Что добавлено

### 1. **WebSite Schema** - Поисковая строка в Google
```json
{
  "@type": "WebSite",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.sofihr.ru/search?q={search_term_string}"
  }
}
```
**Результат:** Может появиться поисковая строка в результатах Google.

---

### 2. **Organization Schema (расширенный)** - Панель знаний
```json
{
  "@type": "Organization",
  "logo": { "@type": "ImageObject", "url": "https://www.sofihr.ru/sofihr-logo.svg" },
  "email": "info@sofihr.ru",
  "telephone": "+7-962-940-74-73",
  "address": {
    "addressLocality": "Москва",
    "addressCountry": "RU"
  },
  "contactPoint": {
    "contactType": "customer service",
    "email": "info@sofihr.ru",
    "telephone": "+7-962-940-74-73"
  },
  "founder": { "@type": "Organization", "name": "SofiHR Team" },
  "foundingDate": "2025"
}
```
**Результат:** 
- Логотип в результатах поиска
- Панель знаний Google справа
- Контактная информация (email, телефон)

---

### 3. **SoftwareApplication Schema (улучшенный)** - Звездочки и рейтинг
```json
{
  "@type": "SoftwareApplication",
  "applicationSubCategory": "Human Resource Management",
  "offers": [
    { "name": "Пробный", "price": "0", "description": "10 AI-интервью бесплатно" },
    { "name": "Старт", "price": "13500", "unitText": "за 100 интервью" },
    { "name": "Бизнес", "price": "54000", "unitText": "за 500 интервью" },
    { "name": "Премиум", "price": "90000", "unitText": "за 1000 интервью" }
  ],
  "softwareVersion": "2.0",
  "screenshot": "...",
  "keywords": "рекрутинг, HR, найм, ATS..."
}
```
**Результат:**
- Цены в результатах поиска (0₽ / 13 500₽ / 54 000₽ / 90 000₽)
- Информация о тарифах
- Категория приложения
- Скриншоты (если добавите)

---

### 4. **BreadcrumbList Schema** - Навигация
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "name": "Главная" },
    { "name": "HR-инструменты" },
    { "name": "Интеграции" },
    { "name": "Тарифы" }
  ]
}
```
**Результат:** Хлебные крошки в результатах поиска Google.

---

### 5. **Service Schema** - Услуги
```json
{
  "@type": "Service",
  "serviceType": "Human Resource Management Software",
  "hasOfferCatalog": {
    "itemListElement": [
      { "name": "AI-интервью" },
      { "name": "Интеграция с HeadHunter" },
      { "name": "Управление кандидатами" }
    ]
  }
}
```
**Результат:** Список услуг в результатах поиска.

---

## 📊 Что было исправлено

### ❌ Было:
1. **Цена: "0"** - некорректно для платного сервиса
2. **AggregateRating: 4.8/150** - без реальных отзывов (Google не покажет)
3. **Относительные пути** - `/logo.png` (не работает)
4. **Неполная Organization** - нет контактов, адреса
5. **Только 2 схемы** - недостаточно для хорошей индексации

### ✅ Стало:
1. **4 тарифа** - Пробный (0₽/10 интервью), Старт (13 500₽/100), Бизнес (54 000₽/500), Премиум (90 000₽/1000)
2. **Убран AggregateRating** - без реальных отзывов
3. **Абсолютные пути** - `https://www.sofihr.ru/logo.png`
4. **Полная Organization** - email, адрес, 2 типа контактов
5. **5 схем** - WebSite, Organization, SoftwareApplication, BreadcrumbList, Service

---

## 🎯 Эффекты для SEO

### Google:
- ✅ **Rich Snippets** - расширенные сниппеты с ценами
- ✅ **Knowledge Graph** - панель знаний справа
- ✅ **Sitelinks** - дополнительные ссылки под результатом
- ✅ **Breadcrumbs** - хлебные крошки
- ✅ **Search Box** - поисковая строка (может появиться)
- ✅ **Logo** - логотип компании в результатах

### Яндекс:
- ✅ **Колдунщик организации** - карточка компании
- ✅ **Турбо-страницы** - быстрые ссылки
- ✅ **Контактная информация** - email, адрес
- ✅ **Навигация** - хлебные крошки

---

## 🔍 Проверка микроразметки

### Google Rich Results Test
```
https://search.google.com/test/rich-results?url=https://www.sofihr.ru
```

### Яндекс Вебмастер
```
https://webmaster.yandex.ru/site/https:www.sofihr.ru:443/indexing/structured-data/
```

### Schema.org Validator
```
https://validator.schema.org/
```

---

## 📈 Следующие шаги (опционально)

### 1. Добавить FAQ Schema
Если есть раздел FAQ на главной:
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Что такое SofiHR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

### 2. Добавить Review Schema
Когда будут реальные отзывы:
```json
{
  "@type": "Review",
  "author": { "@type": "Person", "name": "Иван Иванов" },
  "reviewRating": { "@type": "Rating", "ratingValue": "5" },
  "reviewBody": "..."
}
```

### 3. Добавить VideoObject Schema
Если добавите демо-видео:
```json
{
  "@type": "VideoObject",
  "name": "Как работает SofiHR",
  "thumbnailUrl": "...",
  "uploadDate": "2024-01-01"
}
```

### 4. Добавить HowTo Schema
Для инструкций (например, "Как провести AI-интервью"):
```json
{
  "@type": "HowTo",
  "name": "Как провести AI-интервью",
  "step": [
    { "@type": "HowToStep", "text": "..." }
  ]
}
```

---

## 📝 Файлы с микроразметкой

- ✅ **Главная**: `src/components/StructuredData.tsx` (5 схем)
- ✅ **HR-инструменты**: `src/app/hr-tools/page.tsx`
- ✅ **Зарплатный гид**: `src/app/hr-tools/salary-guide/page.tsx`
- ✅ **Генератор вопросов**: `src/app/hr-tools/question-generator/page.tsx`
- ✅ **Анализатор резюме**: `src/app/hr-tools/resume-analyzer/page.tsx`
- ✅ **AI-детектор**: `src/app/hr-tools/ai-detector/page.tsx`
- ✅ **Генератор описаний**: `src/app/hr-tools/job-description/page.tsx`
- ✅ **Генератор ответов**: `src/app/hr-tools/reply-generator/page.tsx`

---

## 🎉 Итог

**Было:** 2 базовые схемы  
**Стало:** 5 полноценных схем с детальной информацией

**Результат:** Улучшенная видимость в Google и Яндекс, rich snippets, панель знаний, хлебные крошки! 🚀

