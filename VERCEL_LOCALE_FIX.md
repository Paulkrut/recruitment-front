# 🔧 Настройка локали на Vercel

## Проблема
Отображается русский язык вместо английского, хотя установлены переменные:
- `NEXT_PUBLIC_DEFAULT_LOCALE = en`
- `NEXT_PUBLIC_REGION = US`

## Причины

### 1. Переменные не установлены на Vercel
Проверьте в **Vercel Dashboard → Project → Settings → Environment Variables**

### 2. Переменные установлены только для Production
Нужно установить для **всех окружений**: Production, Preview, Development

### 3. Нужен новый деплой после установки переменных
Переменные применяются только при новом деплое

## Решение

### Шаг 1: Проверьте переменные на Vercel

1. Откройте https://vercel.com/your-project/settings/environment-variables
2. Убедитесь что установлены:

```
Name: NEXT_PUBLIC_DEFAULT_LOCALE
Value: en
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_REGION
Value: US
Environments: ☑ Production ☑ Preview ☑ Development
```

### Шаг 2: Если переменных нет - добавьте

1. Нажмите **"Add New"**
2. Введите имя: `NEXT_PUBLIC_DEFAULT_LOCALE`
3. Введите значение: `en`
4. Выберите все окружения
5. Нажмите **"Save"**

Повторите для `NEXT_PUBLIC_REGION = US`

### Шаг 3: Передеплойте проект

После добавления/изменения переменных окружения:

**Вариант A: Через Git**
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

**Вариант B: Через Vercel Dashboard**
1. Откройте **Deployments**
2. Найдите последний успешный деплой
3. Нажмите **"..."** → **"Redeploy"**
4. Выберите **"Use existing Build Cache"** (если нужно быстро)

### Шаг 4: Проверьте логи нового деплоя

В логах билда должно быть:
```
🌍 [getLocale] Environment variables: {
  NEXT_PUBLIC_DEFAULT_LOCALE: 'en',
  NEXT_PUBLIC_REGION: 'US'
}
✅ [getLocale] Using NEXT_PUBLIC_DEFAULT_LOCALE: en
```

## Локальная разработка

Создайте файл `.env.local` в корне проекта:

```bash
# .env.local
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_REGION=US
NEXT_PUBLIC_RECRUITMENT_API=http://recruitment.test
```

**Важно:** `.env.local` не коммитится в git (в `.gitignore`)

## Отладка

Если язык всё ещё русский:

1. **Проверьте логи сервера** (Vercel → Deployment → Runtime Logs)
2. **Проверьте консоль браузера** (F12 → Console)
3. Ищите строки с `[getLocale]` и `[appRouterI18n]`

Они покажут:
- Какие переменные видит приложение
- Какая локаль выбрана
- Сколько переводов загружено

## Типичные ошибки

❌ **Переменные установлены только для Production**
- Решение: Выберите все окружения

❌ **Не сделан новый деплой после установки переменных**
- Решение: Передеплойте проект

❌ **Опечатка в имени переменной**
- Правильно: `NEXT_PUBLIC_DEFAULT_LOCALE`
- Неправильно: `NEXT_PUBLIC_LOCALE` или `DEFAULT_LOCALE`

❌ **Пробелы в значении**
- Правильно: `en`
- Неправильно: ` en ` (пробелы вокруг)

## Коммит с логированием

Текущий коммит добавляет логи для отладки:

```bash
git add src/app/appRouterI18n.ts
git commit -m "debug: Add locale detection logging"
git push
```

После деплоя проверьте логи и убедитесь что переменные видны!

