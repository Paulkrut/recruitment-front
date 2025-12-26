# 🚀 Быстрое решение: Русский язык вместо английского

## Проблема
Язык русский, хотя установлены `NEXT_PUBLIC_DEFAULT_LOCALE=en` и `NEXT_PUBLIC_REGION=US`

## Причина
Переменные окружения не видны приложению на Vercel

## Решение

### 1. Проверьте переменные на Vercel

**Vercel Dashboard → Settings → Environment Variables**

Должны быть установлены для **ВСЕХ окружений** (Production, Preview, Development):

```
NEXT_PUBLIC_DEFAULT_LOCALE = en
NEXT_PUBLIC_REGION = US
```

### 2. Передеплойте

После установки/изменения переменных:

```bash
git add src/app/appRouterI18n.ts
git commit -m "debug: Add locale detection logging"
git push
```

ИЛИ через Vercel Dashboard: **Deployments → Redeploy**

### 3. Проверьте логи

В новом деплое ищите:
```
🌍 [getLocale] Environment variables: {
  NEXT_PUBLIC_DEFAULT_LOCALE: 'en',  ← Должно быть 'en'
  NEXT_PUBLIC_REGION: 'US'           ← Должно быть 'US'
}
✅ [getLocale] Using NEXT_PUBLIC_DEFAULT_LOCALE: en
```

Если переменные `undefined` - они не установлены на Vercel!

## Локально для разработки

Создайте `.env.local`:
```
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_REGION=US
```

---

Подробная инструкция: `VERCEL_LOCALE_FIX.md`

