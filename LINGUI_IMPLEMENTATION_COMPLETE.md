# ✅ Интернационализация с LinguiJS - ЗАВЕРШЕНО

## 🎉 Что сделано

### 1. Установка и настройка LinguiJS

- ✅ Установлены все пакеты LinguiJS
- ✅ Создана конфигурация (.linguirc, babel.config.js)
- ✅ Настроен Webpack loader для .po файлов
- ✅ Добавлены команды в package.json

### 2. Структура переводов

- ✅ Создана структура `src/locales/ru/` и `src/locales/en/`
- ✅ Инициализированы файлы messages.po
- ✅ Настроена автоматическая компиляция

### 3. Интеграция в приложение

- ✅ Создан `LinguiProvider` и добавлен в app.tsx
- ✅ Создан `middleware.ts` для определения языка по домену
- ✅ Настроены утилиты в `src/utils/i18n.ts`

### 4. Инструменты автоматизации

- ✅ **Скрипт автоматической миграции** (`scripts/migrate-to-lingui.js`)
- ✅ **Скрипт проверки прогресса** (`scripts/find-russian-text.js`)
- ✅ Команды NPM для удобной работы

### 5. Документация

Создано **8 файлов** с подробной документацией:

1. ✅ `LINGUI_START_HERE.md` - **Начните с этого файла** ⭐
2. ✅ `LINGUI_README.md` - Краткий обзор
3. ✅ `LINGUI_QUICK_START.md` - Шпаргалка для ежедневной работы
4. ✅ `LINGUI_AUTO_MIGRATION_HOWTO.md` - Автоматическая миграция
5. ✅ `LINGUI_MIGRATION.md` - Руководство по ручной миграции
6. ✅ `LINGUI_GUIDE.md` - Полное руководство (35+ примеров)
7. ✅ `LINGUI_SETUP_COMPLETE.md` - Описание настройки
8. ✅ `LINGUI_SUMMARY.md` - Техническое резюме

---

## 📊 Текущее состояние проекта

### Анализ выполнен: `npm run migrate:check`

```
📊 СТАТИСТИКА:
- Всего файлов: 444
- Файлов с русским текстом: 93
- Всего русских текстов: 3644
- Обернуто (<Trans>/msg): 26
- Не обернуто: 3618

📈 Прогресс: 0.7%
```

### Топ-10 файлов для миграции:

1. `src/app/page.tsx` - 269 текстов
2. `src/app/interview/[token]/page.tsx` - 257 текстов
3. `src/app/privacy-policy/page.tsx` - 195 текстов
4. `src/app/hr-agreement/page.tsx` - 165 текстов
5. `src/app/(DashboardLayout)/hr/vacancies/[id]/KanbanView.tsx` - 134 текста
6. И еще 88 файлов...

---

## 🚀 Что делать дальше?

### Вариант 1: Автоматическая миграция всего проекта (рекомендуется)

```bash
# 1. Backup
git add . && git commit -m "backup: before LinguiJS auto migration"

# 2. Запустить автоматическую миграцию
npm run migrate:auto

# 3. Извлечь и скомпилировать переводы
npm run i18n:extract-compile

# 4. Проверить
npm run dev

# 5. Добавить английские переводы в src/locales/en/messages.po

# 6. Скомпилировать финальные переводы
npm run i18n:compile
```

Время: ~1-2 часа на миграцию + 8-10 часов на переводы

### Вариант 2: Постепенная миграция (безопаснее)

**Неделя 1: Главная и авторизация**

```bash
# Мигрируйте только эти страницы
npm run migrate:auto -- src/app/page.tsx
npm run migrate:auto -- src/app/auth/
npm run i18n:extract-compile
git add . && git commit -m "feat: migrate landing and auth to LinguiJS"
```

**Неделя 2: HR админка - вакансии**

```bash
npm run migrate:auto -- src/app/(DashboardLayout)/hr/vacancies/
npm run i18n:extract-compile
git add . && git commit -m "feat: migrate vacancies to LinguiJS"
```

**Неделя 3: HR админка - кандидаты**

```bash
npm run migrate:auto -- src/app/(DashboardLayout)/hr/candidates/
npm run i18n:extract-compile
git add . && git commit -m "feat: migrate candidates to LinguiJS"
```

**Неделя 4: Остальное**

```bash
npm run migrate:auto
npm run i18n:extract-compile
git add . && git commit -m "feat: complete migration to LinguiJS"
```

### Вариант 3: Только новые страницы

Мигрируйте только новые страницы, старые оставьте как есть:

```tsx
// Новые страницы
import { Trans } from '@lingui/react';

export function NewPage() {
  return <h1><Trans>Новая страница</Trans></h1>;
}
```

---

## 📚 Документация для команды

### Для разработчиков

**Быстрый старт (5 минут):**
- Прочитайте [LINGUI_START_HERE.md](./LINGUI_START_HERE.md)

**Ежедневная работа:**
- Шпаргалка в [LINGUI_QUICK_START.md](./LINGUI_QUICK_START.md)

**Детальное изучение (1 час):**
- Полное руководство в [LINGUI_GUIDE.md](./LINGUI_GUIDE.md)

### Для переводчиков

1. Откройте `src/locales/en/messages.po`
2. Найдите строку на русском (`msgid "Текст"`)
3. Добавьте перевод (`msgstr "Translation"`)
4. Сохраните файл
5. Готово! ✅

---

## 🎯 Команды для работы

### Проверка и миграция

```bash
# Проверить прогресс миграции
npm run migrate:check

# Запустить автоматическую миграцию
npm run migrate:auto
```

### Работа с переводами

```bash
# Извлечь тексты из кода
npm run i18n:extract

# Скомпилировать переводы
npm run i18n:compile

# Всё сразу
npm run i18n:extract-compile
```

### Разработка

```bash
# Dev-сервер
npm run dev

# Production build
npm run build
```

---

## 🌍 Как работает определение языка

Middleware автоматически определяет язык по домену:

- `sofihr.ru` → 🇷🇺 Русский
- `sofihr.com` → 🇬🇧 Английский
- `en.sofihr.ru` → 🇬🇧 Английский
- `localhost` → 🇷🇺 Русский (по умолчанию)

Настройка в `src/middleware.ts`

---

## 💡 Примеры использования

### Простой текст

```tsx
import { Trans } from '@lingui/react';

<Button><Trans>Создать вакансию</Trans></Button>
```

### Атрибуты

```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  return (
    <TextField 
      label={_(msg`Название`)}
      placeholder={_(msg`Введите название`)}
    />
  );
}
```

### С переменными

```tsx
const userName = "Иван";

<Typography>
  <Trans>Привет, {userName}!</Trans>
</Typography>
```

---

## 🐛 Частые проблемы

### Ошибка: "Trans is not defined"

**Решение:** Добавьте импорт

```tsx
import { Trans } from '@lingui/react';
```

### Ошибка: "_ is not defined"

**Решение:** Добавьте хук

```tsx
import { useLingui } from '@lingui/react';

const { _ } = useLingui();
```

### Перевод не отображается

**Решение:**

1. Запустите `npm run i18n:extract`
2. Добавьте перевод в `src/locales/en/messages.po`
3. Запустите `npm run i18n:compile`
4. Перезапустите dev-сервер

---

## 📈 Оценка времени

### Автоматическая миграция

- Запуск скрипта: **5-10 минут**
- Проверка и исправление: **2-3 часа**
- Добавление переводов: **8-10 часов**
- **Итого: ~1-2 рабочих дня**

### Постепенная миграция

- Неделя 1: Главная + auth (4-6 часов)
- Неделя 2: Вакансии (6-8 часов)
- Неделя 3: Кандидаты (6-8 часов)
- Неделя 4: Остальное (8-10 часов)
- **Итого: ~1 месяц** (работая по 6 часов в неделю)

### Только новые страницы

- **Время: 0** (сразу пишите с переводами)

---

## ✅ Чек-лист перед стартом

- [ ] Прочитал [LINGUI_START_HERE.md](./LINGUI_START_HERE.md)
- [ ] Запустил `npm run migrate:check` для оценки
- [ ] Сделал backup: `git commit -am "backup"`
- [ ] Выбрал стратегию миграции
- [ ] Готов к работе! 🚀

---

## 🎉 Готово!

Всё настроено и готово к использованию!

**Следующий шаг:**

Откройте [LINGUI_START_HERE.md](./LINGUI_START_HERE.md) и начните миграцию!

---

**Удачи! 🌍🚀**

_Если возникнут вопросы, вся документация находится в корне проекта._


