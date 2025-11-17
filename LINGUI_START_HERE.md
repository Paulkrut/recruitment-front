# 🌍 LinguiJS - Полная интернационализация проекта

## ✅ Система готова к использованию!

Проект теперь поддерживает **автоматическую** миграцию на LinguiJS с определением языка по домену.

---

## 🚀 Быстрый старт для автоматической миграции

### 1. Сделайте backup

```bash
git add .
git commit -m "backup: before LinguiJS auto migration"
```

### 2. Запустите автоматическую миграцию

```bash
# Мигрировать весь проект
npm run migrate:auto

# ИЛИ сначала проверить что будет мигрировано
npm run migrate:check
```

### 3. Извлеките и скомпилируйте переводы

```bash
npm run i18n:extract-compile
```

### 4. Проверьте результат

```bash
npm run dev
```

---

## 📚 Документация

| Документ | Описание | Когда использовать |
|----------|----------|-------------------|
| [LINGUI_README.md](./LINGUI_README.md) | Краткий обзор | Первое знакомство |
| [LINGUI_QUICK_START.md](./LINGUI_QUICK_START.md) | Шпаргалка | Ежедневная работа |
| [LINGUI_AUTO_MIGRATION_HOWTO.md](./LINGUI_AUTO_MIGRATION_HOWTO.md) | **Автоматическая миграция** | **Начните с этого!** |
| [LINGUI_MIGRATION.md](./LINGUI_MIGRATION.md) | Ручная миграция | Сложные случаи |
| [LINGUI_GUIDE.md](./LINGUI_GUIDE.md) | Полное руководство | Детальное изучение |
| [LINGUI_SETUP_COMPLETE.md](./LINGUI_SETUP_COMPLETE.md) | Описание настройки | Понимание архитектуры |
| [LINGUI_SUMMARY.md](./LINGUI_SUMMARY.md) | Резюме изменений | Технические детали |

---

## 🤖 Доступные команды

### Автоматическая миграция

```bash
# Запустить автоматическую миграцию всего проекта
npm run migrate:auto

# Проверить прогресс миграции (сколько осталось)
npm run migrate:check
```

### Работа с переводами

```bash
# Извлечь все тексты из кода
npm run i18n:extract

# Скомпилировать переводы
npm run i18n:compile

# Извлечь и скомпилировать (всё сразу)
npm run i18n:extract-compile
```

### Разработка

```bash
# Запустить dev-сервер
npm run dev

# Собрать для продакшена
npm run build
```

---

## 🎯 Рекомендуемый workflow

### Для автоматической миграции

```bash
# 1. Backup
git add . && git commit -m "backup"

# 2. Проверьте что нужно мигрировать
npm run migrate:check

# 3. Запустите миграцию
npm run migrate:auto

# 4. Извлеките тексты
npm run i18n:extract-compile

# 5. Проверьте
npm run dev

# 6. Закоммитьте
git add .
git commit -m "feat: migrate to LinguiJS"
```

### Для ежедневной работы

```bash
# 1. Пишите код с <Trans>
import { Trans } from '@lingui/react';
<Button><Trans>Создать</Trans></Button>

# 2. Извлеките тексты
npm run i18n:extract-compile

# 3. Добавьте переводы в src/locales/en/messages.po

# 4. Готово!
```

---

## 📊 Прогресс миграции

Проверьте текущий прогресс:

```bash
npm run migrate:check
```

Вы увидите:

```
📊 ОБЩАЯ СТАТИСТИКА:
Всего русских текстов: 1243
  ✅ Обернуто: 450
  ❌ Не обернуто: 793

📈 Прогресс миграции: 36.2%

🎯 ТОП-10 ФАЙЛОВ ДЛЯ МИГРАЦИИ:
1. src/app/(DashboardLayout)/hr/vacancies/page.tsx (45 текстов)
2. src/app/(DashboardLayout)/hr/candidates/page.tsx (38 текстов)
...
```

---

## 🌍 Как работает определение языка

### Автоматически по домену:

- `sofihr.ru` → 🇷🇺 Русский
- `sofihr.com` → 🇬🇧 Английский
- `en.sofihr.ru` → 🇬🇧 Английский
- `localhost` → 🇷🇺 Русский (по умолчанию)

Настроено в `src/middleware.ts`

---

## 📝 Примеры кода

### Простой текст

```tsx
import { Trans } from '@lingui/react';

<Typography><Trans>Добро пожаловать</Trans></Typography>
```

### Атрибуты

```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  return (
    <TextField 
      placeholder={_(msg`Введите текст`)} 
    />
  );
}
```

### С переменными

```tsx
<Trans>Привет, {userName}!</Trans>
```

---

## 🛠 Структура проекта

```
recruitment-front/
├── src/
│   ├── locales/
│   │   ├── ru/messages.po          # Русские тексты
│   │   └── en/messages.po          # Английские переводы
│   ├── utils/i18n.ts               # Утилиты
│   ├── middleware.ts               # Определение языка
│   └── components/
│       ├── providers/
│       │   └── LinguiProvider.tsx  # React Provider
│       └── examples/
│           └── ExampleI18n.tsx     # Примеры
│
├── scripts/
│   ├── migrate-to-lingui.js        # Автоматическая миграция
│   └── find-russian-text.js        # Поиск текстов
│
├── .linguirc                       # Конфигурация LinguiJS
├── babel.config.js                 # Babel для макросов
│
└── Документация:
    ├── LINGUI_README.md            # Краткий обзор
    ├── LINGUI_QUICK_START.md       # Шпаргалка
    ├── LINGUI_AUTO_MIGRATION_HOWTO.md  # Автоматическая миграция ⭐
    ├── LINGUI_MIGRATION.md         # Ручная миграция
    ├── LINGUI_GUIDE.md             # Полное руководство
    ├── LINGUI_SETUP_COMPLETE.md    # Описание настройки
    └── LINGUI_SUMMARY.md           # Резюме
```

---

## 🎓 Обучение команды

### 5 минут - Быстрое введение

Прочитайте: [LINGUI_QUICK_START.md](./LINGUI_QUICK_START.md)

### 20 минут - Автоматическая миграция

Прочитайте: [LINGUI_AUTO_MIGRATION_HOWTO.md](./LINGUI_AUTO_MIGRATION_HOWTO.md)

### 1 час - Полное понимание

Прочитайте: [LINGUI_GUIDE.md](./LINGUI_GUIDE.md)

---

## 🚨 Важные замечания

### ⚠️ Перед автоматической миграцией

1. **ОБЯЗАТЕЛЬНО** сделайте backup: `git commit -am "backup"`
2. **Проверьте** что нужно мигрировать: `npm run migrate:check`
3. **Запустите** миграцию: `npm run migrate:auto`
4. **Проверьте** изменения: `git diff`
5. **Протестируйте**: `npm run dev`

### ✅ После миграции

1. Запустите: `npm run i18n:extract-compile`
2. Добавьте переводы в `src/locales/en/messages.po`
3. Протестируйте на обоих языках
4. Закоммитьте изменения

---

## 💡 Полезные ссылки

- **Официальная документация**: https://lingui.js.org/
- **Tutorial**: https://lingui.js.org/tutorials/react.html
- **API Reference**: https://lingui.js.org/ref/macro.html

---

## 🆘 Помощь и поддержка

### Возникла проблема?

1. Проверьте [LINGUI_GUIDE.md](./LINGUI_GUIDE.md) - раздел "Частые ошибки"
2. Проверьте [LINGUI_AUTO_MIGRATION_HOWTO.md](./LINGUI_AUTO_MIGRATION_HOWTO.md) - раздел "Устранение проблем"
3. Откатите изменения: `git reset --hard HEAD`
4. Попробуйте постепенную миграцию

### Нужна ручная миграция?

См. [LINGUI_MIGRATION.md](./LINGUI_MIGRATION.md) - 10+ паттернов миграции

---

## ✨ Готово!

Все инструменты настроены и готовы к использованию!

**Начните с:**

1. 📖 Прочитайте [LINGUI_AUTO_MIGRATION_HOWTO.md](./LINGUI_AUTO_MIGRATION_HOWTO.md)
2. 💾 Сделайте backup
3. 🤖 Запустите `npm run migrate:auto`
4. 🎉 Наслаждайтесь!

---

**Удачи с миграцией!** 🚀🌍


