# 🌍 Автоопределение страны и универсальный placeholder

## ✅ Что реализовано

### 1. Автоопределение страны по локали браузера

Компонент `InternationalPhoneInput` теперь автоматически определяет страну пользователя на основе языка браузера (`navigator.language`):

```typescript
function detectUserCountry(): string {
  const locale = navigator.language; // Например: 'ru-RU', 'en-US', 'be-BY'
  
  const localeToCountry: Record<string, string> = {
    'ru': 'ru', 'ru-RU': 'ru', 'ru-BY': 'ru', 'ru-KZ': 'ru',
    'be': 'by', 'be-BY': 'by',
    'kk': 'kz', 'kk-KZ': 'kz',
    'uk': 'ua', 'uk-UA': 'ua',
    'en': 'us', 'en-US': 'us', 'en-GB': 'gb',
    'ar': 'sa', 'ar-SA': 'sa',
    // ... другие страны
  };
  
  return localeToCountry[locale] || 'ru'; // Fallback на Россию
}
```

### 2. Автоматический placeholder

`react-phone-input-2` **автоматически** генерирует правильный placeholder для выбранной страны! 🎉

#### Примеры:

| Локаль браузера | Страна | Флаг | Placeholder |
|----------------|--------|------|-------------|
| `ru-RU` | Россия | 🇷🇺 | `+7 (900) 123-45-67` |
| `be-BY` | Беларусь | 🇧🇾 | `+375 (29) 123-45-67` |
| `en-US` | США | 🇺🇸 | `+1 (555) 123-4567` |
| `ar-SA` | Саудовская Аравия | 🇸🇦 | `+966 50 123 4567` |
| `kk-KZ` | Казахстан | 🇰🇿 | `+7 (701) 123-45-67` |
| `en-GB` | Великобритания | 🇬🇧 | `+44 20 1234 5678` |

---

## 🔧 Изменения в коде

### InternationalPhoneInput.tsx

```typescript
'use client';

import React, { useState, useEffect } from 'react';

// Функция автоопределения страны
function detectUserCountry(): string {
  if (typeof navigator === 'undefined') return 'ru'; // SSR fallback
  
  const locale = navigator.language || 'ru-RU';
  
  // Маппинг локалей на коды стран
  const localeToCountry: Record<string, string> = {
    'ru': 'ru', 'ru-RU': 'ru',
    'be': 'by', 'be-BY': 'by',
    'en': 'us', 'en-US': 'us',
    'ar': 'sa', 'ar-SA': 'sa',
    // ... и т.д.
  };
  
  // Точное совпадение или по языку
  return localeToCountry[locale] || localeToCountry[locale.split('-')[0]] || 'ru';
}

export default function InternationalPhoneInput({ ... }) {
  const [defaultCountry, setDefaultCountry] = useState<string>('ru');

  // Автоопределение при монтировании
  useEffect(() => {
    const detectedCountry = detectUserCountry();
    setDefaultCountry(detectedCountry);
  }, []);

  return (
    <PhoneInput
      country={defaultCountry}  // ← Автоопределенная страна
      placeholder={placeholder} // ← Библиотека сама генерирует правильный!
      // ... остальные props
    />
  );
}
```

### Убраны все hardcoded placeholder'ы

**До:**
```tsx
<InternationalPhoneInput
  label={_(msg`Телефон`)}
  value={phone}
  onChange={setPhone}
  placeholder={_(msg`+7 (999) 123-45-67`)}  // ← Жестко заданный российский формат
/>
```

**После:**
```tsx
<InternationalPhoneInput
  label={_(msg`Телефон`)}
  value={phone}
  onChange={setPhone}
  // placeholder автоматический! 🎉
/>
```

---

## 📁 Обновленные файлы

1. ✅ `src/components/InternationalPhoneInput.tsx` - добавлено автоопределение
2. ✅ `src/app/auth/register/page.tsx` - убран placeholder
3. ✅ `src/app/interview/apply/[token]/page.tsx` - уже без placeholder
4. ✅ `src/app/forget-me/page.tsx` - убран placeholder
5. ✅ `src/app/contact/page.tsx` - убран placeholder
6. ✅ `src/app/(DashboardLayout)/hr/vacancies/[id]/page.tsx` - убран placeholder, обновлена валидация

---

## 🌍 Поддерживаемые локали

### Восточная Европа и СНГ
- 🇷🇺 Русский: `ru`, `ru-RU`, `ru-BY`, `ru-KZ` → Россия
- 🇧🇾 Белорусский: `be`, `be-BY` → Беларусь
- 🇰🇿 Казахский: `kk`, `kk-KZ` → Казахстан
- 🇺🇦 Украинский: `uk`, `uk-UA` → Украина

### Западная Европа
- 🇬🇧 Английский (UK): `en-GB` → Великобритания
- 🇫🇷 Французский: `fr`, `fr-FR` → Франция
- 🇩🇪 Немецкий: `de`, `de-DE` → Германия
- 🇪🇸 Испанский: `es`, `es-ES` → Испания
- 🇮🇹 Итальянский: `it`, `it-IT` → Италия
- 🇵🇹 Португальский: `pt`, `pt-PT` → Португалия

### Америка
- 🇺🇸 Английский (US): `en`, `en-US` → США
- 🇧🇷 Португальский (BR): `pt-BR` → Бразилия

### Азия и Ближний Восток
- 🇸🇦 Арабский: `ar`, `ar-SA` → Саудовская Аравия
- 🇨🇳 Китайский: `zh`, `zh-CN` → Китай
- 🇯🇵 Японский: `ja`, `ja-JP` → Япония

**Fallback**: Если локаль не найдена → `ru` (Россия) 🇷🇺

---

## 🧪 Как проверить

### Шаг 1: Проверка в Chrome DevTools

1. Откройте Chrome DevTools (F12)
2. Нажмите `⋮` → **More tools** → **Sensors**
3. В разделе **Location** найдите **Locale override**
4. Выберите разные локали:
   - `ru-RU` → флаг 🇷🇺, placeholder `+7 (900) 123-45-67`
   - `en-US` → флаг 🇺🇸, placeholder `+1 (555) 123-4567`
   - `be-BY` → флаг 🇧🇾, placeholder `+375 (29) 123-45-67`
   - `ar-SA` → флаг 🇸🇦, placeholder `+966 50 123 4567`
5. Перезагрузите страницу (F5)

### Шаг 2: Проверка в Firefox

1. Введите в адресной строке: `about:config`
2. Найдите: `intl.accept_languages`
3. Измените на: `be-BY,be;q=0.9` (для Беларуси)
4. Перезагрузите страницу

### Шаг 3: Проверка в реальных условиях

Откройте сайт из разных стран:
- 🇷🇺 Россия → автоматически 🇷🇺 +7
- 🇧🇾 Беларусь → автоматически 🇧🇾 +375
- 🇺🇸 США → автоматически 🇺🇸 +1
- 🇸🇦 Саудовская Аравия → автоматически 🇸🇦 +966

---

## 🎯 Преимущества

### ✅ Для пользователей
1. **Мгновенное удобство**: правильная страна выбрана сразу
2. **Правильный формат**: placeholder соответствует стране
3. **Меньше действий**: не нужно искать свою страну в списке
4. **Понятный интерфейс**: видят знакомый формат номера

### ✅ Для разработчиков
1. **Меньше кода**: не нужны хардкод placeholder'ы
2. **Автоматика**: `react-phone-input-2` сама генерирует placeholder
3. **Универсальность**: работает для всех стран
4. **Поддержка**: легко добавить новые локали

---

## 🔧 Добавление новых локалей

Чтобы добавить новую страну:

```typescript
const localeToCountry: Record<string, string> = {
  // ... существующие
  'tr': 'tr', 'tr-TR': 'tr',        // 🇹🇷 Турция
  'pl': 'pl', 'pl-PL': 'pl',        // 🇵🇱 Польша
  'cs': 'cz', 'cs-CZ': 'cz',        // 🇨🇿 Чехия
  'hu': 'hu', 'hu-HU': 'hu',        // 🇭🇺 Венгрия
  'ro': 'ro', 'ro-RO': 'ro',        // 🇷🇴 Румыния
  // ... и т.д.
};
```

---

## 🎉 Итого

- ✅ **Автоопределение** страны по локали браузера
- ✅ **Универсальный placeholder** (генерируется библиотекой)
- ✅ **17+ локалей** из коробки (можно добавить больше)
- ✅ **SSR-safe** (fallback на 'ru')
- ✅ **Убраны все хардкоды** из 6 файлов
- ✅ **Приоритетные страны** в dropdown: RU, BY, KZ, UA, US, SA

**Пользователь из любой страны увидит правильный флаг и формат номера сразу!** 🌍

---

*Обновлено: 5 декабря 2024*
*Фича: Автоопределение страны + универсальный placeholder*







