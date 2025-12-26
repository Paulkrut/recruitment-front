# ✅ ПРАВИЛЬНОЕ РЕШЕНИЕ: @lingui/loader

## Что было неправильно?

Мы пытались импортировать скомпилированные `.js` файлы, которых не было в репозитории.

## Правильное решение (из примера на GitHub)

Используем **`@lingui/loader`** - webpack loader который:
- Загружает `.po` файлы **напрямую**
- Компилирует их **на лету** во время билда
- Работает как в dev, так и в production
- **Не нужно** коммитить скомпилированные `.js` файлы!

## Что изменили:

### 1. Изменили импорты (3 файла)

**До:**
```typescript
const catalog = await import(`../locales/${locale}/messages.js`);
```

**После:**
```typescript
const catalog = await import(`@lingui/loader!../locales/${locale}/messages.po`);
const messages = catalog.messages || {};
```

### 2. Убрали компиляцию из package.json

**До:**
```json
"dev": "npx lingui compile && next dev --turbopack --port 3002",
"build": "npx lingui extract && npx lingui compile && next build",
```

**После:**
```json
"dev": "next dev --turbopack --port 3002",
"build": "npx lingui extract && next build",
```

**`@lingui/loader` компилирует автоматически!**

### 3. Обновили TypeScript декларации

Теперь `src/types/lingui.d.ts` объявляет типы для `@lingui/loader!*`.

## Изменённые файлы:

1. ✅ `src/app/appRouterI18n.ts` - импорт `.po` через loader
2. ✅ `src/app/maintenance/layout.tsx` - импорт `.po` через loader
3. ✅ `src/utils/i18n.ts` - импорт `.po` через loader
4. ✅ `src/types/lingui.d.ts` - TypeScript декларации
5. ✅ `package.json` - убрали `lingui compile`
6. ✅ `lingui.config.js` - исключили `.d.ts` из обработки

## Закоммитьте и задеплойте:

```bash
git add src/app/appRouterI18n.ts
git add src/app/maintenance/layout.tsx
git add src/utils/i18n.ts
git add src/types/lingui.d.ts
git add package.json
git add lingui.config.js
git commit -m "fix: Use @lingui/loader for dynamic .po imports"
git push
```

## Почему это работает?

1. **`next.config.ts` уже настроен** (строки 20-25):
```typescript
webpack: (config) => {
  config.module.rules.push({
    test: /\.po$/,
    use: { loader: '@lingui/loader' }
  });
  return config;
}
```

2. **`@lingui/loader` уже установлен** в `package.json`

3. **Loader компилирует `.po` → JS** автоматически при каждом билде

4. **TypeScript типы** теперь правильные для loader

## Преимущества:

✅ Работает как в dev, так и в production  
✅ Не нужно коммитить `.js` файлы  
✅ Автоматическая компиляция при билде  
✅ Нет проблем с путями и резолвингом модулей  
✅ TypeScript полностью доволен  

## После деплоя проверьте:

В логах Vercel должно быть:
```
✅ [appRouterI18n] Messages extracted: { messagesCount: 1875 }
```

**Теперь всё будет работать правильно!** 🎉

## Environment Variables на Vercel:

```
NEXT_PUBLIC_DEFAULT_LOCALE = en
NEXT_PUBLIC_REGION = US
```

---

**Источник:** https://github.com/ivandotv/nextjs-translation-demo  
**Спасибо автору примера!** 🙏

