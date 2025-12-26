# Отладка проблемы с переводами на Vercel

## Текущая ситуация

В логах Vercel видно:
```
✅ [appRouterI18n] i18n created: {
  locale: 'ru',
  hasMessages: false,      ← ПРОБЛЕМА!
  messagesCount: 0,        ← ПРОБЛЕМА!
  testTranslation: 'L7S2Qo'  ← Возвращает ID вместо перевода
}
```

Но при этом:
```
Catalog statistics for src/locales/{locale}/messages: 
│ ru (source) │    1873     │    -    │  ← Есть все переводы!
│ en          │    1875     │   17    │  ← Есть почти все переводы
```

## Возможные причины

### 1. Проблема с форматом экспорта

Скомпилированные файлы `messages.js` используют CommonJS (`module.exports`), но Next.js 15 ожидает ES modules.

**Проверка локально:**

```powershell
# Откройте файл
notepad src\locales\ru\messages.js
```

Ищите в начале файла:
```javascript
// ❌ BAD - если видите это:
module.exports = {messages: ...}

// ✅ GOOD - должно быть это:
export const messages = {...};
// или
export default {messages: {...}};
```

### 2. Проблема с динамическим импортом

Динамический импорт `import(\`@/locales/${locale}/messages.js\`)` может не работать правильно во время SSR.

**Решение:** Использовать статический импорт с условием.

### 3. Проблема с доступом к внутренним полям i18n

`i18n.messages` может быть undefined, нужно использовать `(i18n as any)._messages`.

## Шаги для отладки

### Шаг 1: Проверьте формат скомпилированных файлов

```powershell
cd c:\laragon\www\recruitment-front
type src\locales\en\messages.js | Select-Object -First 5
```

### Шаг 2: Перекомпилируйте с правильными настройками

```powershell
# Удалите старые скомпилированные файлы
Remove-Item src\locales\*\messages.js

# Перекомпилируйте
npx lingui compile

# Проверьте первые строки нового файла
type src\locales\en\messages.js | Select-Object -First 5
```

### Шаг 3: Локальный тест с английской локалью

```powershell
# Установите переменные окружения
$env:NEXT_PUBLIC_DEFAULT_LOCALE="en"
$env:NEXT_PUBLIC_REGION="US"

# Запустите билд
npm run build

# Запустите production сервер
npm run start
```

Откройте http://localhost:3000 и проверьте:
1. **Консоль браузера** - должны быть логи:
   ```
   📥 [appRouterI18n] Loading catalog for locale: en
   📦 [appRouterI18n] Catalog imported: ...
   ✅ [appRouterI18n] Messages extracted: { messagesCount: 1875 }
   ```

2. **View Source** (ПКМ → View Page Source):
   - Текст должен быть на английском
   - Не должно быть ID типа `L7S2Qo`

### Шаг 4: Если проблема с форматом файлов

Если видите `module.exports` в скомпилированных файлах, попробуйте альтернативный подход:

**Вариант A: Использовать статический импорт**

Создайте файл `src/app/i18nStaticLoader.ts`:

```typescript
import { setupI18n, type I18n } from "@lingui/core";
import ruMessages from "@/locales/ru/messages";
import enMessages from "@/locales/en/messages";

export type SupportedLocale = "ru" | "en";

export function getLocale(): SupportedLocale {
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (defaultLocale === 'en' || defaultLocale === 'ru') {
    return defaultLocale;
  }
  
  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

const catalogs = {
  ru: ruMessages.messages || ruMessages,
  en: enMessages.messages || enMessages,
};

export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  const messages = catalogs[locale];
  
  console.log('✅ [i18nStaticLoader] Creating i18n:', {
    locale,
    messagesCount: Object.keys(messages).length,
  });
  
  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });
  
  return i18n;
}
```

Обновите `src/app/layout.tsx`:
```typescript
import { getI18nInstance, getLocale } from "./i18nStaticLoader"; // ← Изменили импорт
```

**Вариант B: Использовать .po файлы напрямую**

1. Установите загрузчик:
```powershell
npm install --save-dev @lingui/loader
```

2. Обновите `next.config.ts`:
```typescript
const nextConfig = {
  webpack: (config: any) => {
    config.module.rules.push({
      test: /\.po$/,
      use: '@lingui/loader',
    });
    return config;
  },
};
```

3. Измените импорт в `appRouterI18n.ts`:
```typescript
const catalog = await import(`@/locales/${locale}/messages.po`);
```

## Финальный чеклист

После внесения изменений:

- [ ] Локальный `npm run dev` показывает переводы ✅
- [ ] Локальный `npm run build` + `npm run start` (с `NEXT_PUBLIC_DEFAULT_LOCALE=en`) показывает переводы
- [ ] В логах консоли `messagesCount > 0`
- [ ] View Source показывает переведённый текст
- [ ] Закоммичены изменения в Git
- [ ] Запушено на Vercel
- [ ] Vercel билд успешен
- [ ] Production сайт показывает переводы

## Если ничего не помогает

Отправьте мне:
1. Первые 10 строк файла `src/locales/en/messages.js`
2. Логи из консоли браузера (F12 → Console) после `npm run start`
3. Скриншот страницы с проблемой

