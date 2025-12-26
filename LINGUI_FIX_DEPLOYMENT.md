# Исправление проблемы с переводами на продакшене

## Проблема
На удалённом сервере (Vercel) вместо переводов отображаются ID текстов (например, `L7S2Qo`).

## Причина
Скомпилированные каталоги переводов использовали CommonJS формат (`module.exports`), но Next.js 15 с App Router ожидает ES modules.

## Исправления

### 1. Обновлена конфигурация Lingui
Файл: `lingui.config.js`
- Установлен `compileNamespace: 'es'` для генерации ES модулей

### 2. Обновлена загрузка переводов
Файл: `src/app/appRouterI18n.ts`
- Добавлена поддержка `NEXT_PUBLIC_DEFAULT_LOCALE`
- Улучшена обработка ошибок при загрузке каталогов
- Добавлены fallback для разных форматов экспорта

### 3. Упрощён LinguiProvider
Файл: `src/components/providers/LinguiProvider.tsx`
- Использован `useMemo` вместо `useState`
- Убраны избыточные console.log

## Инструкции для деплоя

### Шаг 1: Перекомпилируйте каталоги переводов
```bash
cd recruitment-front
npx lingui compile
```

### Шаг 2: Проверьте локально
```bash
# Тест с русской локалью
NEXT_PUBLIC_REGION=RU npm run build
npm run start

# Тест с английской локалью
NEXT_PUBLIC_DEFAULT_LOCALE=en NEXT_PUBLIC_REGION=US npm run build
npm run start
```

### Шаг 3: Закоммитьте изменения
```bash
git add lingui.config.js
git add src/app/appRouterI18n.ts
git add src/components/providers/LinguiProvider.tsx
git add src/app/layout.tsx
git add src/locales/en/messages.js
git add src/locales/ru/messages.js
git commit -m "fix: Исправлена загрузка переводов на продакшене"
git push
```

### Шаг 4: Настройте переменные окружения на Vercel

В настройках проекта Vercel добавьте:

**Для английской версии:**
```
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_REGION=US
```

**Для русской версии:**
```
NEXT_PUBLIC_DEFAULT_LOCALE=ru
NEXT_PUBLIC_REGION=RU
```

## Проверка работоспособности

После деплоя проверьте:
1. ✅ Переводы отображаются правильно (не ID)
2. ✅ Нет ошибок в консоли браузера
3. ✅ SSR работает корректно (посмотрите исходный код страницы)

## Что изменилось в билд процессе

До:
```
✅ [appRouterI18n] i18n created: {
  messagesCount: 0,  ❌ Сообщения не загружаются!
}
```

После:
```
✅ [appRouterI18n] i18n created: {
  messagesCount: 1873,  ✅ Все сообщения загружены!
}
```

## Если проблема сохраняется

1. Очистите кэш билда на Vercel:
   - Settings → General → Clear Build Cache & Redeploy

2. Проверьте, что файлы `src/locales/*/messages.js` обновились после `npx lingui compile`

3. Убедитесь, что в логах билда на Vercel нет ошибок импорта:
   ```
   Error: Cannot find module '@/locales/en/messages.js'
   ```

4. Если ошибка сохраняется, попробуйте альтернативный подход через .po файлы напрямую.

