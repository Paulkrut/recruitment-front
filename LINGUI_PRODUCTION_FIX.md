# Исправление переводов на Vercel (Production)

## Проблема
На production (Vercel) вместо переводов отображаются ID (например, `L7S2Qo`), хотя на локальной машине (`npm run dev`) всё работает.

## Корневая причина
1. На Vercel используются переменные окружения:
   ```
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   NEXT_PUBLIC_REGION=US
   ```
2. Скомпилированные файлы переводов используют CommonJS формат (`module.exports`), который не импортируется корректно в Next.js 15 с App Router.

## Решение

### 1. Обновите конфигурацию Lingui

Убедитесь, что в `lingui.config.js` стоит правильный формат:

```javascript
/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['ru', 'en'],
  sourceLocale: 'ru',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src/'],
      exclude: ['**/node_modules/**'],
    },
  ],
  format: 'po',
  compileNamespace: 'es', // ES modules
  fallbackLocales: {
    default: 'ru',
  },
};
```

### 2. Перекомпилируйте каталоги

```bash
cd recruitment-front
npx lingui compile
```

### 3. Проверьте скомпилированные файлы

После компиляции файлы `src/locales/*/messages.js` должны экспортировать в формате ES modules:

```javascript
// messages.js должен экспортировать export default { messages: {...} }
// А не module.exports = {...}
```

### 4. Обновите код загрузки переводов

Файл: `src/app/appRouterI18n.ts`

```typescript
import { setupI18n, type I18n } from "@lingui/core";

export type SupportedLocale = "ru" | "en";

export function getLocale(): SupportedLocale {
  // Сначала проверяем NEXT_PUBLIC_DEFAULT_LOCALE
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (defaultLocale === 'en' || defaultLocale === 'ru') {
    return defaultLocale;
  }
  
  // Fallback на NEXT_PUBLIC_REGION
  const region = process.env.NEXT_PUBLIC_REGION;
  return region === "US" ? "en" : "ru";
}

async function loadCatalog(locale: SupportedLocale) {
  try {
    const catalog = await import(`@/locales/${locale}/messages.js`);
    return catalog.messages || catalog.default?.messages || catalog;
  } catch (error) {
    console.error(`Failed to load catalog for locale ${locale}:`, error);
    return {};
  }
}

export async function getI18nInstance(locale: SupportedLocale): Promise<I18n> {
  const messages = await loadCatalog(locale);
  
  const i18n = setupI18n({
    locale: locale,
    messages: { [locale]: messages }
  });
  
  return i18n;
}
```

### 5. Проверьте локально с английской локалью

Тестируйте с той же конфигурацией, что и на Vercel:

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_DEFAULT_LOCALE="en"
$env:NEXT_PUBLIC_REGION="US"
npm run build
npm run start
```

```bash
# Linux/Mac
NEXT_PUBLIC_DEFAULT_LOCALE=en NEXT_PUBLIC_REGION=US npm run build
npm run start
```

Откройте http://localhost:3000 и проверьте:
- ✅ Переводы отображаются на английском
- ✅ В консоли браузера нет ошибок импорта
- ✅ В исходном коде страницы (View Source) переводы присутствуют

### 6. Проверьте настройки на Vercel

**Важно!** На Vercel должны быть установлены переменные окружения:

1. Откройте Vercel Dashboard → Ваш проект → Settings → Environment Variables
2. Проверьте, что установлены:
   ```
   NEXT_PUBLIC_DEFAULT_LOCALE = en
   NEXT_PUBLIC_REGION = US
   ```
3. Эти переменные должны быть доступны для **Production**, **Preview** и **Development** окружений

### 7. Закоммитьте и задеплойте

```bash
git add lingui.config.js
git add src/app/appRouterI18n.ts
git add src/locales/en/messages.js
git add src/locales/ru/messages.js
git commit -m "fix: Исправлена загрузка переводов на production (Vercel)"
git push origin translate2
```

### 8. После деплоя проверьте

1. **Проверьте логи билда на Vercel:**
   ```
   ✅ [appRouterI18n] i18n created: {
     locale: 'en',
     messagesCount: 1875,  // Должно быть > 0!
   }
   ```

2. **Проверьте в браузере:**
   - Откройте ваш сайт на Vercel
   - Проверьте, что тексты отображаются на английском
   - Откройте DevTools → Console: не должно быть ошибок импорта

3. **Проверьте View Source:**
   - ПКМ → View Page Source
   - Найдите любой текст страницы
   - Он должен быть на английском, а не ID типа `L7S2Qo`

## Если проблема сохраняется

### A. Очистите кэш Vercel

1. Vercel Dashboard → Settings → General
2. Нажмите **"Clear Build Cache & Redeploy"**

### B. Проверьте компиляцию каталогов

Убедитесь, что файлы `.js` в `src/locales/*/messages.js` не коммитятся в формате CommonJS:

```javascript
// ❌ BAD (CommonJS):
module.exports = {messages: ...}

// ✅ GOOD (ES modules):
export const messages = {...};
// или
export default {messages: {...}};
```

Если файлы в формате CommonJS, попробуйте:

```bash
rm -rf src/locales/*/messages.js
npx lingui compile
git add src/locales
git commit -m "fix: Recompile catalogs as ES modules"
git push
```

### C. Альтернативное решение: загрузка .po файлов

Если ES modules не работают, можно загружать `.po` файлы напрямую (но это медленнее):

1. Установите `@lingui/loader`:
   ```bash
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

3. Загружайте `.po` вместо `.js`:
   ```typescript
   const catalog = await import(`@/locales/${locale}/messages.po`);
   ```

## Проверочный чеклист

- [ ] `lingui.config.js` использует `compileNamespace: 'es'`
- [ ] Выполнена команда `npx lingui compile`
- [ ] Файлы `src/locales/*/messages.js` закоммичены
- [ ] На Vercel установлены переменные `NEXT_PUBLIC_DEFAULT_LOCALE` и `NEXT_PUBLIC_REGION`
- [ ] Локальный тест с `npm run build` + `npm run start` показывает переводы
- [ ] После деплоя переводы отображаются на production
- [ ] В логах билда `messagesCount > 0`

## Контакты для поддержки

Если проблема не решается:
1. Проверьте логи билда на Vercel
2. Проверьте Console в браузере на production
3. Сравните с локальной сборкой (build + start)
