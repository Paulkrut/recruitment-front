# РЕШЕНИЕ: Статические импорты для переводов

## Что было сделано

### Проблема
На Vercel переводы не загружались, вместо текста отображались ID (например, `L7S2Qo`).

**Причина:** Динамические импорты `import(\`@/locales/${locale}/messages.js\`)` не работали правильно с CommonJS модулями во время SSR в Next.js 15.

### Решение
Создан **статический загрузчик** `i18nStaticLoader.ts`, который импортирует все переводы на этапе билда.

## Изменённые файлы

1. **src/app/i18nStaticLoader.ts** (новый файл)
   - Статические импорты `import ruMessages from "@/locales/ru/messages"`
   - Гарантированная работа в SSR
   - Детальное логирование

2. **src/app/layout.tsx**
   - Изменён импорт с `./appRouterI18n` на `./i18nStaticLoader`

3. **src/app/appRouterI18n.ts**
   - Добавлено детальное логирование для отладки

## Следующие шаги

### 1. Закоммитьте изменения

```bash
cd c:\laragon\www\recruitment-front

git add src/app/i18nStaticLoader.ts
git add src/app/layout.tsx
git add src/app/appRouterI18n.ts
git add src/locales/en/messages.js
git add src/locales/ru/messages.js

git commit -m "fix: Использовать статические импорты для переводов на production"
git push origin translate2
```

### 2. Проверьте локально (ВАЖНО!)

Перед деплоем на Vercel обязательно проверьте локально:

```powershell
# Установите переменные окружения как на Vercel
$env:NEXT_PUBLIC_DEFAULT_LOCALE="en"
$env:NEXT_PUBLIC_REGION="US"

# Очистите .next
Remove-Item -Recurse -Force .next

# Запустите билд
npm run build

# Запустите production сервер
npm run start
```

Откройте http://localhost:3000 и проверьте:

✅ **Консоль браузера (F12 → Console):**
```
🌍 [i18nStaticLoader] Using NEXT_PUBLIC_DEFAULT_LOCALE: en
🚀 [i18nStaticLoader] getI18nInstance called, locale: en
📊 [i18nStaticLoader] Messages loaded: {
  locale: 'en',
  messagesCount: 1875,  ← Должно быть > 0!
  ...
}
✅ [i18nStaticLoader] i18n created successfully
```

✅ **Переводы отображаются на английском** (не ID)

✅ **View Source (ПКМ → View Page Source):** текст на английском

### 3. Деплой на Vercel

После успешной локальной проверки:

1. Запушьте изменения (если ещё не сделали)
2. Vercel автоматически запустит деплой
3. Проверьте логи билда на Vercel:
   ```
   📊 [i18nStaticLoader] Messages loaded: {
     messagesCount: 1875  ← Должно быть > 0!
   }
   ```

### 4. Проверьте на production

После деплоя откройте ваш сайт на Vercel:

- ✅ Переводы должны отображаться правильно
- ✅ Никаких ID вместо текста
- ✅ Console (F12) не содержит ошибок
- ✅ View Source показывает переведённый текст

## Преимущества этого решения

✅ **Надёжность**: Статические импорты всегда работают в SSR  
✅ **Производительность**: Все переводы загружаются на этапе билда  
✅ **Простота**: Не нужны дополнительные webpack лоадеры  
✅ **Отладка**: Детальное логирование для диагностики проблем  

## Если проблема сохраняется

1. Проверьте логи Vercel билда
2. Проверьте переменные окружения на Vercel:
   - Settings → Environment Variables
   - Должны быть установлены `NEXT_PUBLIC_DEFAULT_LOCALE` и `NEXT_PUBLIC_REGION`
3. Очистите Build Cache на Vercel:
   - Settings → General → Clear Build Cache & Redeploy

## Rollback (если нужно вернуться)

Чтобы вернуться к динамическим импортам:

```bash
# В src/app/layout.tsx измените обратно:
import { getI18nInstance, getLocale } from "./appRouterI18n";
```

Но статический загрузчик — это **рекомендуемое решение** для production!

