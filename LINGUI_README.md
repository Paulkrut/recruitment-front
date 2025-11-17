# 🌍 Интернационализация с LinguiJS

## ✅ Настройка завершена!

Проект теперь поддерживает **русский** и **английский** языки с автоматическим определением по домену.

## 🚀 Быстрый старт

### 1. Использование в коде

```tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

function MyComponent() {
  const { _ } = useLingui();
  
  return (
    <div>
      {/* Текст в JSX */}
      <h1><Trans>Добро пожаловать</Trans></h1>
      
      {/* Атрибуты */}
      <input placeholder={_(msg`Введите текст`)} />
    </div>
  );
}
```

### 2. Извлечение и компиляция

```bash
# Найти все тексты в проекте
npm run i18n:extract

# Добавить переводы в src/locales/en/messages.po

# Скомпилировать
npm run i18n:compile

# Или всё сразу
npm run i18n:extract-compile
```

### 3. Определение языка

Автоматически по домену:
- `sofihr.ru` → 🇷🇺 Русский
- `sofihr.com` → 🇬🇧 Английский

## 📚 Документация

| Файл | Описание |
|------|----------|
| [LINGUI_QUICK_START.md](./LINGUI_QUICK_START.md) | Краткая шпаргалка |
| [LINGUI_GUIDE.md](./LINGUI_GUIDE.md) | Полное руководство |
| [LINGUI_MIGRATION.md](./LINGUI_MIGRATION.md) | Миграция кода |
| [LINGUI_SETUP_COMPLETE.md](./LINGUI_SETUP_COMPLETE.md) | Что сделано |

## 📝 Примеры

- `src/components/examples/ExampleI18n.tsx` - Примеры компонентов
- `src/app/auth/login/page.i18n-example.tsx` - Миграция страницы входа

## 🎯 Что дальше?

1. Начните с малого - оберните тексты в `<Trans>`
2. Запустите `npm run i18n:extract`
3. Добавьте переводы в `src/locales/en/messages.po`
4. Скомпилируйте: `npm run i18n:compile`

## 🔑 Ключевые команды

```bash
npm run i18n:extract           # Извлечь тексты
npm run i18n:compile           # Скомпилировать
npm run i18n:extract-compile   # Всё сразу
```

## 📂 Структура

```
src/
├── locales/
│   ├── ru/messages.po    # Русские тексты
│   └── en/messages.po    # Английские переводы
├── utils/i18n.ts         # Утилиты
├── middleware.ts         # Определение языка
└── components/
    └── providers/
        └── LinguiProvider.tsx
```

## 💡 Помощь

Если возникли вопросы, смотрите полную документацию в файлах выше или официальную документацию: https://lingui.js.org/

---

**Готово к использованию!** 🎉 Начните оборачивать тексты и запускайте extract!


